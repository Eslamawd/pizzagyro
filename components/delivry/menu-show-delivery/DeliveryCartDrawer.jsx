import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeliveryCartOptions from "./DeliveryCartOptions";

const DeliveryCartDrawer = ({
  showCart,
  cart,
  phone,
  orderType,
  cartTotal,
  setPhone,
  setOrderType,
  updateQty,
  removeFromCart,
  onClose,
  onProceed,
}) => {
  const deliveryFee = orderType === "delivery" ? 5 : 0;
  const taxAmount = cartTotal * 0.095;
  const finalTotal = cartTotal + deliveryFee + taxAmount;

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
                onClick={onClose}
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

                <div className="flex justify-between text-sm text-slate-600 items-center">
                  <span>Phone:</span>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-32 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>

                <div className="flex justify-between text-lg font-black text-slate-900">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    ${finalTotal.toFixed(2)}
                  </span>
                  <span>Delivery:</span>
                  <span className="text-orange-600">
                    {deliveryFee.toFixed(2)}
                  </span>
                  <span>TAX:</span>
                  <span className="text-orange-600">
                    {taxAmount.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full py-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-200 transition-all"
                  onClick={onProceed}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryCartDrawer;
