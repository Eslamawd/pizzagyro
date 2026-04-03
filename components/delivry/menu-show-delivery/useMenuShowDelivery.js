import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMenus } from "@/lib/menuApi";
import { addNewOrderDelivery } from "@/lib/orderApi";
import { EMPTY_ITEM_SELECTION, OPTION_GROUP_CONFIG } from "./constants";
import {
  buildOptionDetails,
  buildOptionsKey,
  calculateCartPricing,
  calculateItemTotal,
} from "./utils";
import {
  canProceedDeliveryPayment,
  submitDeliveryOrder,
} from "./deliveryCheckout";

const useMenuShowDelivery = () => {
  const [cart, setCart] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [location, setLocation] = useState({
    address: "",
    lat: null,
    lng: null,
    isSet: false,
  });
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tipPercentage, setTipPercentage] = useState(0);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [orderType, setOrderType] = useState("delivery");
  const [showLocModal, setShowLocModal] = useState(false);
  const [menus, setMenus] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const pricingSummary = calculateCartPricing(cart, orderType, tipPercentage);

  useEffect(() => {
    const getMenusApi = async () => {
      try {
        const response = await getMenus();
        setMenus(response);
      } catch {
        toast.error("Failed to load menus. Please try again.");
      }
    };

    getMenusApi();
  }, []);

  useEffect(() => {
    if (selectedItem && selectedItem.options_grouped?.size) {
      const defaultSize = selectedItem.options_grouped.size[0];
      setSelectedOptions((prev) => ({
        ...prev,
        size: {
          id: defaultSize.id,
          name: defaultSize.name,
          price: defaultSize.price,
          position: "whole",
        },
      }));
    }
  }, [selectedItem]);

  const resetSelectedItemState = () => {
    setSelectedItem(null);
    setSelectedOptions(EMPTY_ITEM_SELECTION);
  };

  const handleOptionSelect = (
    groupKey,
    optionId,
    position = "whole",
    name,
    price,
  ) => {
    const config = OPTION_GROUP_CONFIG[groupKey] || { type: "single" };

    if (config.type === "multiple") {
      const current = selectedOptions[groupKey] || [];
      const existingOption = current.find((entry) => entry.id === optionId);
      if (!existingOption && current.length >= (config.max || Infinity)) {
        toast.error(
          `Maximum ${config.max} options allowed for ${groupKey.replace("_", " ")}`,
        );
        return;
      }
    }

    setSelectedOptions((prev) => {
      if (config.type === "multiple") {
        const current = prev[groupKey] || [];
        const existingIndex = current.findIndex(
          (entry) => entry.id === optionId,
        );

        if (existingIndex > -1) {
          const existing = current[existingIndex];
          if (existing.position === position) {
            return {
              ...prev,
              [groupKey]: current.filter((entry) => entry.id !== optionId),
            };
          }

          const updatedOptions = [...current];
          updatedOptions[existingIndex] = {
            id: optionId,
            position,
            name,
            price,
          };
          return { ...prev, [groupKey]: updatedOptions };
        }

        return {
          ...prev,
          [groupKey]: [...current, { id: optionId, position, name, price }],
        };
      }

      const currentSingle = prev[groupKey];
      if (
        currentSingle?.id === optionId &&
        currentSingle?.position === position
      ) {
        return { ...prev, [groupKey]: null };
      }

      return { ...prev, [groupKey]: { id: optionId, position, name, price } };
    });
  };

  const addToCart = (item, currentSelectedOptions = {}, itemComment = "") => {
    const optionsKey = buildOptionsKey(currentSelectedOptions);
    const normalizedComment = itemComment?.trim() || "";
    const cartItemId = `${item.id}-${optionsKey}-comment:${normalizedComment || "none"}`;
    const finalPrice = calculateItemTotal(item, currentSelectedOptions);
    const selectedSize = currentSelectedOptions.size;

    let displayName = item.name;
    if (selectedSize) {
      const sizeName =
        item.options_grouped?.size?.find((size) => size.id === selectedSize)
          ?.name || selectedSize;
      displayName += ` (${sizeName})`;
    }

    const optionDetails = buildOptionDetails(currentSelectedOptions);

    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === cartItemId);
      if (existing) {
        return prev.map((entry) =>
          entry.id === cartItemId ? { ...entry, qty: entry.qty + 1 } : entry,
        );
      }

      return [
        ...prev,
        {
          id: cartItemId,
          item_id: item.id,
          name: displayName,
          image: item.image,
          price: finalPrice,
          qty: 1,
          discount_percentage: Number(item.discount_percentage || 0),
          comment: normalizedComment || null,
          options: optionDetails,
        },
      ];
    });

    setSelectedItem(null);
    setSelectedOptions(EMPTY_ITEM_SELECTION);
    toast.success(`Added ${displayName} 🍽️`);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const canProceedToPayment = () => {
    return canProceedDeliveryPayment({
      cart,
      cartTotal,
      pricingSummary,
      orderType,
      location,
      phone,
      customerName,
      scheduledDate,
      scheduledTime,
      setShowCart,
      setShowLocModal,
    });
  };

  const newOrderDelivery = async (token = null) => {
    return submitDeliveryOrder({
      token,
      cart,
      cartTotal,
      pricingSummary,
      orderType,
      location,
      menus,
      phone,
      customerName,
      tipPercentage,
      scheduledDate,
      scheduledTime,
      addNewOrderDelivery,
      setShowCart,
      setShowLocModal,
      setShowPaymentModal,
      setCart,
      setSelectedItem,
      setSelectedOptions,
      setCustomerName,
      setTipPercentage,
      setScheduledDate,
      setScheduledTime,
      setPaymentToken,
      setIsProcessingOrder,
    });
  };

  return {
    cart,
    cartTotal,
    pricingSummary,
    location,
    menus,
    phone,
    customerName,
    tipPercentage,
    scheduledDate,
    scheduledTime,
    orderType,
    selectedItem,
    selectedMenu,
    selectedOptions,
    showCart,
    showLocModal,
    showPaymentModal,
    paymentToken,
    isProcessingOrder,
    addToCart,
    canProceedToPayment,
    handleOptionSelect,
    newOrderDelivery,
    removeFromCart,
    resetSelectedItemState,
    setLocation,
    setPaymentToken,
    setPhone,
    setOrderType,
    setCustomerName,
    setTipPercentage,
    setScheduledDate,
    setScheduledTime,
    setSelectedItem,
    setSelectedMenu,
    setSelectedOptions,
    setShowCart,
    setShowLocModal,
    setShowPaymentModal,
    updateQty,
  };
};

export default useMenuShowDelivery;
