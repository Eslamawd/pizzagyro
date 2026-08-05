import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { OPTION_GROUP_CONFIG } from "./constants";

const DeliveryItemModal = ({
  selectedItem,
  selectedOptions,
  calculateItemTotal,
  handleOptionSelect,
  onClose,
  onAddToCart,
}) => {
  const [comment, setComment] = useState("");

  useEffect(() => {
    setComment("");
  }, [selectedItem?.id]);

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <AnimatePresence>
      {selectedItem && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-t-[3rem] p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-start mb-4 sm:mb-6 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 truncate">
                  {selectedItem.name}
                </h3>
                {selectedItem.description && (
                  <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2">
                    {selectedItem.description}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="rounded-full bg-slate-100 flex-shrink-0 ml-2"
              >
                <X size={16} />
              </Button>
            </div>

            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-[1.5rem] sm:rounded-[2rem] mb-6 sm:mb-8 shadow-lg"
            />

            {Object.entries(selectedItem.options_grouped || {}).map(
              ([groupKey, options]) => {
                const config = OPTION_GROUP_CONFIG[groupKey] || {};
                const isMultiple = config.type === "multiple";

                return (
                  <div key={groupKey} className="mb-8">
                    <p className="font-bold text-slate-600 mb-3 capitalize">
                      {groupKey.replace("_", " ")}
                      {config.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {options.map((option) => {
                        const isSelected = isMultiple
                          ? (selectedOptions[groupKey] || []).some(
                              (value) => value.id === option.id,
                            )
                          : selectedOptions[groupKey]?.id === option.id;

                        const currentPos = isMultiple
                          ? (selectedOptions[groupKey] || []).find(
                              (value) => value.id === option.id,
                            )?.position
                          : selectedOptions[groupKey]?.id === option.id
                            ? selectedOptions[groupKey].position
                            : "whole";

                        const sizeName =
                          selectedOptions.size?.name?.toLowerCase() || "";
                        let displayPrice = Number(option.price || 0);

                        if (groupKey === "topping" || groupKey === "extra") {
                          if (sizeName === "m" || sizeName === "medium")
                            displayPrice += 0.25;
                          else if (sizeName === "l" || sizeName === "large")
                            displayPrice += 0.5;
                          else if (sizeName === "xl") displayPrice += 0.75;
                        }

                        return (
                          <div key={option.id} className="flex flex-col gap-2">
                            <div
                              onClick={() =>
                                handleOptionSelect(
                                  groupKey,
                                  option.id,
                                  "whole",
                                  option.name,
                                  displayPrice,
                                )
                              }
                              className={`py-3 px-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                                isSelected
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-slate-100 bg-white"
                              }`}
                            >
                              <div className="text-right">
                                <div className="font-bold text-slate-900">
                                  {option.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  +${displayPrice.toFixed(2)}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                              )}
                            </div>

                            {option.half && isSelected && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg"
                              >
                                {[
                                  { id: "left", label: " Left" },
                                  { id: "whole", label: "Whole" },
                                  { id: "right", label: " Right" },
                                ].map((position) => (
                                  <span
                                    key={position.id}
                                    onClick={() =>
                                      handleOptionSelect(
                                        groupKey,
                                        option.id,
                                        position.id,
                                        option.name,
                                        displayPrice,
                                      )
                                    }
                                    className={`text-[10px] py-1.5 rounded-md font-bold transition-all text-center ${
                                      currentPos === position.id
                                        ? "bg-white text-orange-600 shadow-sm"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {position.label}
                                  </span>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}

            <div className="mb-6">
              <Label>Comment:</Label>
              <Textarea
                placeholder="Add your comment here..."
                className="w-full mt-1"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-600 text-sm sm:text-base">
                  Total Price:
                </span>
                <span className="text-lg sm:text-xl md:text-2xl font-black text-orange-600">
                  ${calculateItemTotal(selectedItem, selectedOptions)}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                <p>Base Price: ${selectedItem.price}</p>
                {selectedOptions.size?.name && (
                  <p>
                    Size ({selectedOptions.size.name}): +$
                    {selectedOptions.size.price || "0.00"}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() =>
                onAddToCart(selectedItem, selectedOptions, comment.trim())
              }
              className="w-full py-4 sm:py-5 md:py-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-base sm:text-lg shadow-lg shadow-orange-200 transition-all"
            >
              {selectedItem.options_grouped?.size &&
              selectedItem.options_grouped.size.length > 0
                ? `Add ${selectedItem.name} (${selectedOptions.size?.name}) - $${calculateItemTotal(selectedItem, selectedOptions)}`
                : `Add ${selectedItem.name} - $${calculateItemTotal(selectedItem, selectedOptions)}`}
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryItemModal;
