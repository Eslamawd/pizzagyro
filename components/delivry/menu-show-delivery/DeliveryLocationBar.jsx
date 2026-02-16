import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

const DeliveryLocationBar = ({ location, onClick }) => {
  return (
    <div className="px-4 py-6 sticky top-16 z-40">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="max-w-xl mx-auto border border-orange-100 shadow-xl rounded-2xl p-3 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3 px-2">
          <div
            className={`p-2 rounded-xl ${
              location.isSet ? "bg-green-500" : "bg-orange-500"
            } text-white shadow-lg`}
          >
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Delivery to
            </p>
            <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">
              {location.address || "Set your location"}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-2 rounded-full">
          <Navigation size={18} className="text-orange-500" />
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryLocationBar;
