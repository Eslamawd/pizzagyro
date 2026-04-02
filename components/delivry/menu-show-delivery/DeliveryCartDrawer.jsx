import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DeliveryCartOptions from "./DeliveryCartOptions";
import { CLOSED_WEEK_DAYS } from "./constants";

const DeliveryCartDrawer = ({
  showCart,
  cart,
  location,
  phone,
  customerName,
  tipPercentage,
  scheduledDate,
  scheduledTime,
  orderType,
  cartTotal,
  setLocation,
  setPhone,
  setCustomerName,
  setTipPercentage,
  setScheduledDate,
  setScheduledTime,
  setOrderType,
  updateQty,
  removeFromCart,
  onClose,
  onProceed,
}) => {
  const [showCheckoutScreen, setShowCheckoutScreen] = useState(false);
  const [isResolvingGpsAddress, setIsResolvingGpsAddress] = useState(false);
  const baseTotal =
    cartTotal + (orderType === "delivery" ? 5 : 0) + cartTotal * 0.095;
  const safeTipPercentage = Number(tipPercentage || 0);
  const safeTips = (baseTotal * safeTipPercentage) / 100;
  const deliveryFee = orderType === "delivery" ? 5 : 0;
  const taxAmount = cartTotal * 0.095;
  const finalTotal = cartTotal + deliveryFee + taxAmount + safeTips;
  const tipOptions = [0, 5, 10, 15, 20];

  const isClosedWeekDay = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    return CLOSED_WEEK_DAYS.includes(date.getDay());
  };

  const getBusinessHoursForDate = (dateValue) => {
    if (!dateValue) {
      return { minTime: "10:00", maxTime: "22:00", label: "10:00 - 22:00" };
    }

    const selectedDate = new Date(`${dateValue}T00:00:00`);
    const day = selectedDate.getDay();
    const isWeekendWindow = day === 5 || day === 6; // Friday, Saturday

    return isWeekendWindow
      ? { minTime: "10:00", maxTime: "23:30", label: "10:00 - 23:30" }
      : { minTime: "10:00", maxTime: "22:00", label: "10:00 - 22:00" };
  };

  const selectedDayBusinessHours = getBusinessHoursForDate(scheduledDate);

  const handleCloseDrawer = () => {
    setShowCheckoutScreen(false);
    onClose();
  };

  const handleProceedPayment = () => {
    const canOpenPayment = onProceed?.();
    if (canOpenPayment) {
      setShowCheckoutScreen(false);
    }
  };

  const handleDateChange = (event) => {
    const nextDate = event.target.value;

    if (isClosedWeekDay(nextDate)) {
      toast.error("Selected day is closed. Please choose another date.");
      setScheduledDate("");
      setScheduledTime("");
      return;
    }

    setScheduledDate(nextDate);
  };

  const handleAddressChange = (event) => {
    const nextAddress = event.target.value;
    setLocation((prev) => ({
      ...prev,
      address: nextAddress,
      isSet: true,
    }));
  };

  const handleUseGpsAddress = async () => {
    const lat = location?.lat;
    const lng = location?.lng;

    if (lat == null || lng == null) {
      toast.error("GPS location is not available yet.");
      return;
    }

    setIsResolvingGpsAddress(true);
    try {
      const response = await fetch(
        `/api/geocode/reverse?lat=${lat}&lon=${lng}&language=en`,
      );
      if (!response.ok) throw new Error("Failed to resolve GPS address");

      const data = await response.json();
      const addressData = data.address || {};
      const resolvedAddress =
        addressData.neighbourhood ||
        addressData.suburb ||
        addressData.city_district ||
        addressData.town ||
        addressData.city ||
        data.display_name ||
        "Your location";

      setLocation((prev) => ({
        ...prev,
        address: resolvedAddress,
        isSet: true,
      }));
      toast.success("Address updated from GPS.");
    } catch (error) {
      console.error("Failed to resolve GPS address:", error);
      toast.error("Could not fetch GPS address right now.");
    } finally {
      setIsResolvingGpsAddress(false);
    }
  };

  return (
    <AnimatePresence>
      {showCart && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-md flex justify-end">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="w-full max-w-md h-full p-6 shadow-2xl relative flex flex-col bg-white"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <ShoppingCart className="text-orange-500" /> Your Cart
              </h3>
              <Button
                variant="ghost"
                onClick={handleCloseDrawer}
                className="rounded-full bg-slate-100"
              >
                <X />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <ShoppingCart size={40} />
                  </div>
                  <p className="text-slate-400 font-bold">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">
                        {item.name}
                      </h4>
                      {item.comment && (
                        <p className="text-xs text-slate-500 mt-1">
                          Comment:{" "}
                          <span className="font-medium">{item.comment}</span>
                        </p>
                      )}
                      <DeliveryCartOptions item={item} />
                      <p className="text-orange-600 font-bold text-sm mt-1">
                        ${item.price}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center gap-2 bg-white p-1 rounded-full">
                        <span
                          className="h-6 w-6 text-center justify-center items-center rounded-full text-orange-100"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <Minus className="text-red-800" size={22} />
                        </span>
                        <span className="font-bold text-sm">{item.qty}</span>
                        <span
                          className="h-6 w-6 rounded-full text-orange-600"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <Plus className="text-orange-500" size={22} />
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 h-6 w-6 p-0 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-6 space-y-4 bg-slate-50 p-5 rounded-2xl">
                <div className="space-y-1 text-sm text-slate-700 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TAX:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${safeTips.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-3">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full py-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-200 transition-all"
                  onClick={() => setShowCheckoutScreen(true)}
                >
                  Checkout Details
                </Button>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showCheckoutScreen && cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.96 }}
                  className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-black text-slate-900">
                      Checkout
                    </h3>
                    <span
                      variant="ghost"
                      onClick={() => setShowCheckoutScreen(false)}
                      className="rounded-full bg-slate-100"
                    >
                      <X />
                    </span>
                  </div>

                  <div className="space-y-4 ">
                    <div className="space-y-2">
                      <span className="text-sm text-slate-600 font-semibold">
                        Order Type:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`flex items-center justify-center gap-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            orderType === "pickup"
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="orderType"
                            value="pickup"
                            checked={orderType === "pickup"}
                            onChange={() => setOrderType("pickup")}
                            className="accent-orange-500"
                          />
                          Pickup
                        </label>

                        <label
                          className={`flex items-center justify-center gap-2 py-2 rounded-lg border cursor-pointer transition-all ${
                            orderType === "delivery"
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="orderType"
                            value="delivery"
                            checked={orderType === "delivery"}
                            onChange={() => setOrderType("delivery")}
                            className="accent-orange-500"
                          />
                          Delivery
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-sm text-slate-600">Phone:</span>
                        <input
                          type="tel"
                          placeholder="Enter your phone number"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm text-slate-600">Name:</span>
                        <input
                          type="text"
                          placeholder="Customer name"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={customerName}
                          onChange={(event) =>
                            setCustomerName(event.target.value)
                          }
                        />
                      </div>
                    </div>

                    {orderType === "delivery" && (
                      <div className="space-y-1">
                        <span className="text-sm text-slate-600">Address:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter delivery address manually"
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={location?.address || ""}
                            onChange={handleAddressChange}
                          />
                          <span
                            role="button"
                            tabIndex={0}
                            onKeyDown
                            onClick={handleUseGpsAddress}
                            disabled={isResolvingGpsAddress}
                            className="h-10 px-3 text-xs whitespace-nowrap"
                          >
                            {isResolvingGpsAddress ? "Loading..." : "Use GPS"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          You can type address manually. GPS location stays
                          enabled.
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-sm text-slate-600">
                        Receive On:
                      </span>
                      <p className="text-xs text-slate-500">
                        Sunday - Thursday: 10 AM - 10 PM
                      </p>
                      <p className="text-xs text-slate-500">
                        Friday - Saturday: 10 AM - 11:30 PM
                      </p>
                      {CLOSED_WEEK_DAYS.length > 0 && (
                        <p className="text-xs text-red-500">
                          Some weekdays are closed and cannot be selected.
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={scheduledDate}
                          onChange={handleDateChange}
                        />
                        <input
                          type="time"
                          min={selectedDayBusinessHours.minTime}
                          max={selectedDayBusinessHours.maxTime}
                          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={scheduledTime}
                          onChange={(event) =>
                            setScheduledTime(event.target.value)
                          }
                        />
                      </div>
                      <p className="text-xs text-orange-600">
                        Available today: {selectedDayBusinessHours.label}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-slate-600">Tips:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {tipOptions.map((value) => (
                          <span
                            key={value}
                            type="button"
                            onClick={() => setTipPercentage(value)}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                              safeTipPercentage === value
                                ? "border-orange-500 bg-orange-50 text-orange-700 font-bold"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            {value}%
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <div className="flex justify-between text-sm text-slate-700">
                        <span>Tip Amount:</span>
                        <span className="font-semibold text-orange-600">
                          ${safeTips.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-slate-900 pt-1 border-t border-slate-200">
                        <span>Final Total:</span>
                        <span className="text-orange-600">
                          ${finalTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full py-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-200 transition-all"
                      onClick={handleProceedPayment}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryCartDrawer;
