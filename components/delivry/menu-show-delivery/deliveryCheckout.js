import { toast } from "sonner";
import {
  CLOSED_WEEK_DAYS,
  DELIVERY_RADIUS_MILES,
  MANUAL_RESTAURANT_LOCATION,
} from "./constants";
import {
  calculateDistance,
  formatOrderItems,
  isValidUSPhone,
  normalizeCoordinate,
  normalizeUSLongitude,
  normalizeUSPhone,
} from "./utils";

const getValidatedLocation = ({ location, setShowLocModal }) => {
  const customerLat = normalizeCoordinate(location.lat);
  const customerLng = normalizeUSLongitude(location.lng);

  if (customerLat === null || customerLng === null) {
    toast.error("Invalid customer location. Please reselect your location.");
    setShowLocModal(true);
    return null;
  }

  const restaurantCoordinates = {
    lat: normalizeCoordinate(MANUAL_RESTAURANT_LOCATION.lat),
    lng: normalizeUSLongitude(MANUAL_RESTAURANT_LOCATION.lng),
  };

  if (
    restaurantCoordinates.lat === null ||
    restaurantCoordinates.lng === null
  ) {
    toast.error("Restaurant location is unavailable. Please contact support.");
    return null;
  }

  return { customerLat, customerLng, restaurantCoordinates };
};

const isWithinBusinessHours = (scheduledDate, scheduledTime) => {
  if (!scheduledDate || !scheduledTime) return false;

  const date = new Date(`${scheduledDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const [hourString, minuteString] = scheduledTime.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;

  const totalMinutes = hour * 60 + minute;
  const openMinutes = 10 * 60; // 10:00
  const isFridayOrSaturday = date.getDay() === 5 || date.getDay() === 6;
  const closeMinutes = isFridayOrSaturday ? 23 * 60 + 30 : 22 * 60;

  return totalMinutes >= openMinutes && totalMinutes <= closeMinutes;
};

const BUSINESS_HOURS_TEXT =
  "Sunday - Thursday: 10 AM - 10 PM, Friday - Saturday: 10 AM - 11:30 PM";

const isClosedWeekDay = (scheduledDate) => {
  if (!scheduledDate) return false;
  const date = new Date(`${scheduledDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return CLOSED_WEEK_DAYS.includes(date.getDay());
};

export const canProceedDeliveryPayment = ({
  cart,
  cartTotal,
  pricingSummary,
  orderType,
  location,
  phone,
  customerName,
  scheduledDate,
  scheduledTime,
  setShowLocModal,
}) => {
  const discountedSubtotal = Number(
    pricingSummary?.subtotalAfterDiscount ?? cartTotal,
  );

  if (cart.length === 0) {
    toast.error("Your cart is empty!");
    return false;
  }

  if (orderType === "delivery" && discountedSubtotal < 25) {
    toast.error(
      "Minimum order amount is $25. Please add more items to your cart.",
    );
    return false;
  }

  if (orderType === "delivery") {
    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowLocModal(true);
      return false;
    }

    const validated = getValidatedLocation({
      location,
      setShowLocModal,
    });
    if (!validated) return false;

    const distance = calculateDistance(
      validated.restaurantCoordinates.lat,
      validated.restaurantCoordinates.lng,
      validated.customerLat,
      validated.customerLng,
    );

    if (distance > DELIVERY_RADIUS_MILES) {
      toast.error(
        `Sorry, we only deliver within ${DELIVERY_RADIUS_MILES} miles. Your distance is ${distance.toFixed(1)} miles.`,
      );
      return false;
    }
  }

  if (!phone?.trim()) {
    toast.error("Please enter your phone number.");
    return false;
  }

  if (!isValidUSPhone(phone)) {
    toast.error(
      "Please enter a valid US phone number (example: +1 615 555 1234).",
    );
    return false;
  }

  if (!customerName?.trim()) {
    toast.error("Please enter customer name.");
    return false;
  }

  return true;
};

export const submitDeliveryOrder = async ({
  token,
  cart,
  cartTotal,
  pricingSummary,
  orderType,
  location,
  menus,
  phone,
  customerName,
  tipPercentage,
  scheduledDate,
  scheduledTime,
  addNewOrderDelivery,
  setShowLocModal,
  setShowPaymentModal,
  setCart,
  setSelectedItem,
  setSelectedOptions,
  setCustomerName,
  setTipPercentage,
  setScheduledDate,
  setScheduledTime,
  setPaymentToken,
  setIsProcessingOrder,
}) => {
  const discountedSubtotal = Number(
    pricingSummary?.subtotalAfterDiscount ?? cartTotal,
  );

  let validated = null;

  if (orderType === "delivery") {
    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowLocModal(true);
      return;
    }

    validated = getValidatedLocation({
      location,
      setShowLocModal,
    });
    if (!validated) return;
  }

  if (orderType === "delivery" && discountedSubtotal < 25) {
    toast.error(
      "Minimum order amount is $25. Please add more items to your cart.",
    );
    return;
  }

  if (orderType === "delivery") {
    const distance = calculateDistance(
      validated.restaurantCoordinates.lat,
      validated.restaurantCoordinates.lng,
      validated.customerLat,
      validated.customerLng,
    );

    if (distance > DELIVERY_RADIUS_MILES) {
      toast.error(
        `Sorry, we only deliver within ${DELIVERY_RADIUS_MILES} miles. Your distance is ${distance.toFixed(1)} miles.`,
      );
      return;
    }
  }

  if (!phone?.trim()) {
    toast.error("Please enter your phone number.");
    return;
  }

  if (!isValidUSPhone(phone)) {
    toast.error(
      "Please enter a valid US phone number (example: +1 615 555 1234).",
    );
    return;
  }

  if (!customerName?.trim()) {
    toast.error("Please enter customer name.");
    return;
  }

  if (cart.length === 0) {
    toast.error("Your cart is empty!");
    return;
  }

  if (!menus || menus.length === 0) {
    toast.error("No restaurant data available!");
    return;
  }

  setIsProcessingOrder(true);

  try {
    const deliveryFee = Number(
      pricingSummary?.deliveryFee ?? (orderType === "delivery" ? 5 : 0),
    );
    const taxAmount = Number(
      pricingSummary?.taxAmount ?? (discountedSubtotal + deliveryFee) * 0.095,
    );
    const baseTotal = discountedSubtotal + deliveryFee + taxAmount;
    const calculatedTips = (baseTotal * Number(tipPercentage || 0)) / 100;

    const hasSchedule = Boolean(scheduledDate && scheduledTime);

    const orderData = {
      restaurant_id: menus[0]?.restaurant_id || 1,
      address: orderType === "delivery" ? location.address : "Pickup",
      latitude: orderType === "delivery" ? validated.customerLat : null,
      longitude: orderType === "delivery" ? validated.customerLng : null,
      phone: normalizeUSPhone(phone),
      customer_name: customerName.trim(),
      tip_percentage: Number(tipPercentage || 0),
      tips: Number(calculatedTips || 0).toFixed(2),
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
      scheduled_for: hasSchedule
        ? `${scheduledDate} ${scheduledTime}:00`
        : null,
      items: formatOrderItems(cart),
      total_price: (baseTotal + Number(calculatedTips || 0)).toFixed(2),
      payment_token: token,
      order_type: orderType,
    };

    const response = await addNewOrderDelivery(orderData);
    toast.success(`${response.message} 🎉`);
    setShowCart(false);
    setCart([]);
    setSelectedItem(null);
    setSelectedOptions({});
    setCustomerName("");
    setTipPercentage(0);
    setScheduledDate("");
    setScheduledTime("");
    setShowPaymentModal(false);
    setPaymentToken(null);
    toast.success("Order created successfully! 🎉");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Error";
    toast.error(`Failed to create order: ${errorMessage}`);
    setShowPaymentModal(false);
  } finally {
    setIsProcessingOrder(false);
  }
};
