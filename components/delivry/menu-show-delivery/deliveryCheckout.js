import { toast } from "sonner";
import { DELIVERY_RADIUS_MILES, MANUAL_RESTAURANT_LOCATION } from "./constants";
import {
  calculateDistance,
  formatOrderItems,
  isValidUSPhone,
  normalizeCoordinate,
  normalizeUSLongitude,
  normalizeUSPhone,
} from "./utils";

const getValidatedLocation = ({ location, setShowCart, setShowLocModal }) => {
  const customerLat = normalizeCoordinate(location.lat);
  const customerLng = normalizeUSLongitude(location.lng);

  if (customerLat === null || customerLng === null) {
    toast.error("Invalid customer location. Please reselect your location.");
    setShowCart(false);
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

export const canProceedDeliveryPayment = ({
  cart,
  cartTotal,
  orderType,
  location,
  phone,
  setShowCart,
  setShowLocModal,
}) => {
  if (cart.length === 0) {
    toast.error("Your cart is empty!");
    return false;
  }

  if (orderType === "delivery" && cartTotal < 25) {
    toast.error(
      "Minimum order amount is $25. Please add more items to your cart.",
    );
    return false;
  }

  if (orderType === "delivery") {
    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowCart(false);
      setShowLocModal(true);
      return false;
    }

    const validated = getValidatedLocation({
      location,
      setShowCart,
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

  return true;
};

export const submitDeliveryOrder = async ({
  token,
  cart,
  cartTotal,
  orderType,
  location,
  menus,
  phone,
  addNewOrderDelivery,
  setShowCart,
  setShowLocModal,
  setShowPaymentModal,
  setCart,
  setSelectedItem,
  setSelectedOptions,
  setPaymentToken,
  setIsProcessingOrder,
}) => {
  let validated = null;

  if (orderType === "delivery") {
    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowCart(false);
      setShowLocModal(true);
      return;
    }

    validated = getValidatedLocation({
      location,
      setShowCart,
      setShowLocModal,
    });
    if (!validated) return;
  }

  if (orderType === "delivery" && cartTotal < 25) {
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
    setShowCart(false);
    return;
  }

  if (!isValidUSPhone(phone)) {
    toast.error(
      "Please enter a valid US phone number (example: +1 615 555 1234).",
    );
    setShowCart(false);
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
    const orderData = {
      restaurant_id: menus[0]?.restaurant_id || 1,
      address: orderType === "delivery" ? location.address : "Pickup",
      latitude: orderType === "delivery" ? validated.customerLat : null,
      longitude: orderType === "delivery" ? validated.customerLng : null,
      phone: normalizeUSPhone(phone),
      items: formatOrderItems(cart),
      total_price: cartTotal.toFixed(2),
      payment_token: token,
      order_type: orderType,
    };

    const response = await addNewOrderDelivery(orderData);
    toast.success(`${response.message} 🎉`);
    setShowCart(false);
    setCart([]);
    setSelectedItem(null);
    setSelectedOptions({});
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
