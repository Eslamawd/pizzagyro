import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeliveryMenuModal = ({
  selectedMenu,
  onClose,
  onSelectItem,
  getMenuIcon,
  selectedOptions,
  handleOptionSelect,
}) => {
  return (
    <AnimatePresence>
      {selectedMenu && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className="fixed inset-0 z-[60] bg-white/80 overflow-y-auto"
        >
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-full bg-slate-100"
            >
              <X />
            </Button>
            <h3 className="font-black text-xl">{selectedMenu.name}</h3>
            <div className="w-10" />
          </div>

          <div className="p-6 max-w-4xl mx-auto space-y-12">
            {selectedMenu.categories?.map((category) => (
              <div key={category.id}>
                <h4 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800 border-b pb-3">
                  <span className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                    {getMenuIcon(selectedMenu.name)}
                  </span>
                  {category.name}
                </h4>

                <div className="grid gap-4">
                  {category.items?.map((item) => (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectItem(item)}
                      className="bg-white p-4 rounded-3xl flex gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-inner"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-base text-slate-900">
                            {item.name}
                          </h5>

                          <div className="text-right">
                            {item.options_grouped?.size ? (
                              <div className="flex flex-col items-end">
                                <span className="text-orange-600 font-black text-sm">
                                  ${item.price}
                                </span>
                                <span className="text-xs text-slate-400">
                                  Select the size for the final price
                                </span>
                              </div>
                            ) : (
                              <span className="text-orange-600 font-black">
                                ${item.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex gap-2">
                            {item.options_grouped?.size && (
                              <div className="flex gap-1">
                                {item.options_grouped.size.map((size) => {
                                  const isSelected =
                                    selectedOptions.size?.id === size.id ||
                                    selectedOptions.size === size.id;

                                  return (
                                    <span
                                      key={size.id}
                                      onClick={() =>
                                        handleOptionSelect("size", size.id)
                                      }
                                      className={`py-1 text-sm rounded-xl border-2 text-center ${
                                        isSelected
                                          ? "border-orange-500 bg-orange-50 text-orange-600"
                                          : "border-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {size.name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                            <Plus size={12} /> Add
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryMenuModal;
