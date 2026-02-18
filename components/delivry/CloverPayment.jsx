"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2, Shield, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CloverPayment = ({ cartTotal, orderType, onPaymentSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cloverReady, setCloverReady] = useState(false);
  const [cardError, setCardError] = useState("");

  // Use useRef instead of useState to avoid re-render
  const cardElementsRef = useRef({});
  const cloverInstanceRef = useRef(null);
  const cloverInitialized = useRef(false);

  const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX;
  const MERCHANT_ID = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX;

  const deliveryFee = orderType === "delivery" ? 5 : 0;
  const totalAmount = (cartTotal + deliveryFee + cartTotal * 0.095).toFixed(2);

  // 📦 Load Clover SDK - only once on mount
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    // Prevent duplicate loading
    if (cloverInitialized.current) {
      console.log("ℹ️ Clover SDK already initialized");
      return;
    }

    const loadCloverSDK = () => {
      // If Clover is already loaded, use it
      if (window.Clover) {
        initializeClover();
        return;
      }

      const existingScript = document.getElementById("clover-sdk-script");
      if (existingScript) {
        existingScript.addEventListener("load", initializeClover, {
          once: true,
        });
        return;
      }

      // Create script tag for SDK
      const script = document.createElement("script");
      script.src = "https://checkout.clover.com/sdk.js";
      script.async = true;
      script.id = "clover-sdk-script";
      script.onload = () => {
        if (window.Clover && isMounted) {
          initializeClover();
          cloverInitialized.current = true;
        } else if (!isMounted) {
          console.log("Component unmounted, skipping initialization");
        }
      };
      script.onerror = () => {
        if (isMounted) {
          toast.error("Error loading Clover Payments");
        }
      };
      document.head.appendChild(script);
    };

    loadCloverSDK();

    // Cleanup function: manual cleanup of DOM before React unmounts
    return () => {
      isMounted = false;
      Object.values(cardElementsRef.current).forEach((element) => {
        if (element && typeof element.destroy === "function") {
          element.destroy();
        }
      });
      cardElementsRef.current = {};
      cloverInstanceRef.current = null;
      console.log("✅ Cleaned up Clover DOM");
    };
  }, []); // Empty dependencies = runs only once on mount

  // 🔧 Initialize Clover and create Card Element
  const initializeClover = () => {
    try {
      if (cloverInitialized.current) {
        return;
      }

      if (!PUBLIC_TOKEN || !MERCHANT_ID) {
        console.error("Missing Clover Credentials", {
          PUBLIC_TOKEN,
          MERCHANT_ID,
        });
        toast.error("Clover credentials are missing");
        return;
      }

      const requiredMounts = [
        "#card-number",
        "#card-date",
        "#card-cvv",
        "#card-postal-code",
      ];
      const missingMounts = requiredMounts.filter(
        (selector) => !document.querySelector(selector),
      );
      if (missingMounts.length > 0) {
        console.error("❌ Clover mount containers not found", missingMounts);
        return;
      }

      const clover = new window.Clover(PUBLIC_TOKEN, {
        merchantId: MERCHANT_ID,
      });

      const elements = clover.elements();
      const style = {
        style: {
          base: {
            fontSize: "15px",
            fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
            color: "#9a3412",
            lineHeight: "1.2",
            padding: "0px",
            "::placeholder": {
              color: "#c2410c",
            },
          },
          invalid: {
            color: "#dc2626",
          },
        },
      };

      const cardNumber = elements.create("CARD_NUMBER", style);
      const cardDate = elements.create("CARD_DATE", style);
      const cardCvv = elements.create("CARD_CVV", style);
      const cardPostalCode = elements.create("CARD_POSTAL_CODE", style);

      const attachValidationListeners = (element) => {
        if (!element || typeof element.addEventListener !== "function") {
          return;
        }
        const handleEvent = (event) => {
          const maybeError = event?.error;
          if (typeof maybeError === "string") {
            setCardError(maybeError);
          } else if (maybeError?.message) {
            setCardError(maybeError.message);
          } else if (event?.empty || event?.complete) {
            setCardError("");
          }
        };

        element.addEventListener("change", handleEvent);
        element.addEventListener("blur", handleEvent);
      };

      attachValidationListeners(cardNumber);
      attachValidationListeners(cardDate);
      attachValidationListeners(cardCvv);
      attachValidationListeners(cardPostalCode);

      // Mount the card element in the specified div
      cardNumber.mount("#card-number");
      cardDate.mount("#card-date");
      cardCvv.mount("#card-cvv");
      cardPostalCode.mount("#card-postal-code");

      cardElementsRef.current = {
        cardNumber,
        cardDate,
        cardCvv,
        cardPostalCode,
      };
      cloverInstanceRef.current = clover;
      cloverInitialized.current = true;
      setCloverReady(true);
      setCardError("");
      console.log("✅ Clover card element mounted successfully");
    } catch (error) {
      console.error("Error initializing Clover:", error);
      toast.error("Error initializing payment system");
    }
  };

  // 💳 Handle Payment - call clover.createToken()
  const handlePayment = async () => {
    if (
      !cloverReady ||
      !cloverInstanceRef.current ||
      !cardElementsRef.current.cardNumber
    ) {
      toast.error(
        "Payment system is not ready yet. Please try again in a moment",
      );
      return;
    }

    setLoading(true);

    try {
      // Call clover.createToken() to get the real Token
      const result = await cloverInstanceRef.current.createToken();

      const rawErrors = result?.errors
        ? Array.isArray(result.errors)
          ? result.errors
          : Object.values(result.errors)
        : [];

      if (rawErrors.length > 0) {
        const errorMessage = rawErrors
          .map((err) => (typeof err === "string" ? err : err?.message))
          .filter(Boolean)
          .join(", ");
        setCardError(errorMessage || "Invalid card information");
        toast.error(`Card error: ${errorMessage}`);
        setLoading(false);
        return;
      }

      if (!result.token) {
        toast.error("Failed to create payment token. Please try again");
        setLoading(false);
        return;
      }

      const generatedToken = result.token;
      setToken(generatedToken);
      setCardError("");

      try {
        toast.success("✅ Card verified successfully!");

        setPaymentSuccess(true);

        // Wait to show success message then call callback
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess(generatedToken);
          }
        }, 1500);
      } catch (backendError) {
        console.error("Backend error:", backendError);
        toast.error("Error sending card to server. Please try again");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl my-auto clover-payment-modal"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5 sm:mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
              <Shield className="text-orange-600" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-orange-700">
                Secure Payment
              </h3>
              <p className="text-xs text-orange-500">Clover Payments</p>
            </div>
          </div>
          {!paymentSuccess && (
            <button
              onClick={onClose}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-1.5 rounded-full transition flex-shrink-0"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Success State */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Check className="text-orange-600" size={32} />
              </motion.div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-2">
              Payment Successful! ✅
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Processing your order...
            </p>
            <div className="bg-orange-50 border border-orange-200 p-2 rounded-lg text-center">
              <p className="text-xs text-slate-500 mb-1">Token:</p>
              <p className="text-xs font-mono text-orange-600 break-all overflow-hidden line-clamp-2">
                {token}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payment Form */}
        {!paymentSuccess && (
          <>
            {/* Security Info */}
            <div className="mb-5 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <Lock
                  size={14}
                  className="text-orange-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-slate-700">
                  <span className="font-bold text-orange-600">
                    🔒 Secure Information
                  </span>
                  <br />
                  Card data is protected with 256-bit SSL encryption by Clover
                </p>
              </div>
            </div>

            {/* Clover Card Element */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-bold text-orange-700 mb-2">
                Card Information
              </label>
              <div className="space-y-2">
                <div className="w-full h-12 sm:h-14 border border-orange-300 rounded-lg bg-white px-3 flex items-center">
                  <div
                    id="card-number"
                    style={{ width: "100%", height: "100%", minHeight: "0px" }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="w-full h-12 sm:h-14 border border-orange-300 rounded-lg bg-white px-3 flex items-center sm:col-span-1">
                    <div
                      id="card-date"
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "0px",
                      }}
                    />
                  </div>
                  <div className="w-full h-12 sm:h-14 border border-orange-300 rounded-lg bg-white px-3 flex items-center sm:col-span-1">
                    <div
                      id="card-cvv"
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "0px",
                      }}
                    />
                  </div>
                  <div className="w-full h-12 sm:h-14 border border-orange-300 rounded-lg bg-white px-3 flex items-center sm:col-span-1">
                    <div
                      id="card-postal-code"
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "0px",
                      }}
                    />
                  </div>
                </div>
              </div>
              {cloverReady && (
                <p className="text-xs text-orange-600 mt-1.5">
                  ✅ Payment system loaded - Enter your card details
                </p>
              )}
              {!cloverReady && (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Loader2 className="animate-spin" size={12} />
                  Loading payment system...
                </p>
              )}
              {cardError && (
                <p className="text-xs text-red-600 mt-1.5" role="alert">
                  {cardError}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="mb-5 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-orange-700">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  ${totalAmount}
                </span>
              </div>
              <div className="space-y-1 text-xs text-orange-700 border-t border-orange-300 pt-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 ? (
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="font-semibold text-orange-700">$5.00</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span>Pickup:</span>
                    <span className="font-semibold text-orange-700">$0.00</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (9.5%):</span>
                  <span className="font-semibold text-orange-700">
                    ${(cartTotal * 0.095).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading || !cloverReady}
              className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all border-0"
              style={{
                cursor: loading || !cloverReady ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Processing...</span>
                </div>
              ) : cloverReady ? (
                `Pay Now - $${totalAmount}`
              ) : (
                "Loading..."
              )}
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-orange-600">
              <Lock size={10} />
              <p>Security verified by Clover Payments</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CloverPayment;
