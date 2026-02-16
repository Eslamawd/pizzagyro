import { AnimatePresence, motion } from "framer-motion";
import LocationPicker from "../LocationPicker";

const DeliveryLocationModal = ({
  showLocModal,
  location,
  setLocation,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {showLocModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[3rem] w-full max-w-md p-6 shadow-2xl"
          >
            <LocationPicker
              location={location}
              setLocation={setLocation}
              onClose={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryLocationModal;
