"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, Shield, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CloverPayment = ({ cartTotal, onPaymentSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cloverReady, setCloverReady] = useState(false);

  // Use useRef instead of useState to avoid re-render
  const cardElementRef = useRef(null);
  const cardElement = useRef(null);
  const cloverInitialized = useRef(false);

  // 🔐 Clover Configuration (from .env)
  const ENV_MODE = process.env.NEXT_PUBLIC_ENV_MODE || "sandbox";
  const PUBLIC_TOKEN =
    ENV_MODE === "production"
      ? process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_PROD ||
        process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX
      : process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX;

  const totalAmount = (cartTotal + 5 + cartTotal * 0.095).toFixed(2);

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
      // Most important step: completely empty the div before component unmounts
      if (cardElementRef.current) {
        cardElementRef.current.innerHTML = "";
        console.log("✅ Cleaned up Clover DOM");
      }
    };
  }, []); // Empty dependencies = runs only once on mount

  // 🔧 Initialize Clover and create Card Element
  const initializeClover = () => {
    try {
      const container = cardElementRef.current;
      if (!container) {
        console.error("❌ Card element container not found");
        return;
      }

      // 🧹 Clean DOM before mount
      if (container.innerHTML) {
        container.innerHTML = "";
      }

      const clover = new window.Clover({
        publicToken: PUBLIC_TOKEN,
        environment: "sandbox",
      });

      const elements = clover.elements();
      const card = elements.create("CARD", {
        placeholder: "Card Number",
        style: {
          base: {
            fontSize: "16px",
            fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
            color: "#1e293b",
            lineHeight: "1.5",
            padding: "8px 12px",
            "::placeholder": {
              color: "#94a3b8",
            },
          },
          invalid: {
            color: "#dc2626",
          },
        },
      });

      // Mount the card element in the specified div
      card.mount("#card-element");
      cardElement.current = card; // Save it in useRef not useState
      setCloverReady(true);
      console.log("✅ Clover card element mounted successfully");

      // Save clover instance for later use
      window.cloverInstance = clover;
    } catch (error) {
      console.error("Error initializing Clover:", error);
      toast.error("Error initializing payment system");
    }
  };

  // 💳 Handle Payment - call clover.createToken()
  const handlePayment = async () => {
    if (!cloverReady || !window.cloverInstance || !cardElement.current) {
      toast.error(
        "Payment system is not ready yet. Please try again in a moment",
      );
      return;
    }

    setLoading(true);

    try {
      // Call clover.createToken() to get the real Token
      const result = await window.cloverInstance.createToken(
        cardElement.current,
      );

      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors.map((err) => err.message).join(", ");
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
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <Shield className="text-blue-600" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Secure Payment
              </h3>
              <p className="text-xs text-slate-500">Clover Payments</p>
            </div>
          </div>
          {!paymentSuccess && (
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition flex-shrink-0"
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
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Check className="text-green-600" size={32} />
              </motion.div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-green-600 mb-2">
              Payment Successful! ✅
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Processing your order...
            </p>
            <div className="bg-green-50 border border-green-200 p-2 rounded-lg text-center">
              <p className="text-xs text-slate-500 mb-1">Token:</p>
              <p className="text-xs font-mono text-green-600 break-all overflow-hidden line-clamp-2">
                {token}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payment Form */}
        {!paymentSuccess && (
          <>
            {/* Security Info */}
            <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lock
                  size={14}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-slate-700">
                  <span className="font-bold text-blue-600">
                    🔒 Secure Information
                  </span>
                  <br />
                  Card data is protected with 256-bit SSL encryption by Clover
                </p>
              </div>
            </div>

            {/* Clover Card Element */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                Card Information
              </label>
              {/* Outer wrapper controlled by React */}
              <div className="w-full border border-slate-300 rounded-lg bg-white transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                {/* This div is where Clover will insert the iframe - React won't see what happens inside */}
                <div
                  ref={cardElementRef}
                  id="card-element"
                  style={{
                    minHeight: "60px",
                    padding: "12px",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Don't put any Loader or text here - Clover will insert the iframe here */}
                </div>
              </div>
              {cloverReady && (
                <p className="text-xs text-green-600 mt-1.5">
                  ✅ Payment system loaded - Enter your card details
                </p>
              )}
              {!cloverReady && (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Loader2 className="animate-spin" size={12} />
                  Loading payment system...
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  ${totalAmount}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-500 border-t border-slate-300 pt-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-semibold text-slate-600">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (9.5%):</span>
                  <span className="font-semibold text-slate-600">
                    ${(cartTotal * 0.095).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading || !cloverReady}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all border-0"
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
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-slate-500">
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
