import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeliveryFloatingCartButton = ({ cartCount, cartTotal, onOpenCart }) => {
  if (cartCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-4 right-4 z-40 max-w-lg mx-auto"
    >
      <Button
        onClick={onOpenCart}
        className="w-full py-7 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-[0_15px_40px_rgba(249,115,22,0.4)] flex justify-between px-6 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <ShoppingCart size={20} />
          </div>
          <div className="text-left">
            <span className="font-bold text-base">{cartCount} items</span>
            <span className="block text-xs text-orange-100">Show Cart</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-xl">${cartTotal.toFixed(2)}</span>
        </div>
      </Button>
    </motion.div>
  );
};

export default DeliveryFloatingCartButton;
