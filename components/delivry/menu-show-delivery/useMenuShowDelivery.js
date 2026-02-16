import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMenus } from "@/lib/menuApi";
import { addNewOrderDelivery } from "@/lib/orderApi";
import { EMPTY_ITEM_SELECTION, OPTION_GROUP_CONFIG } from "./constants";
import {
  buildOptionDetails,
  buildOptionsKey,
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
  const [orderType, setOrderType] = useState("delivery");
  const [showLocModal, setShowLocModal] = useState(false);
  const [menus, setMenus] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  useEffect(() => {
    const fetchLocation = async (lat, lng) => {
      try {
        const response = await fetch(
          `/api/geocode/reverse?lat=${lat}&lon=${lng}&language=en`,
        );
        if (!response.ok) throw new Error("Failed to fetch address");
        const data = await response.json();
        const addressData = data.address || {};
        const address =
          addressData.neighbourhood ||
          addressData.suburb ||
          addressData.city_district ||
          addressData.town ||
          addressData.city ||
          "Your location";
        setLocation({ lat, lng, address, isSet: true });
      } catch (error) {
        console.log("Error fetching location:", error);
        setLocation({ lat, lng, address: "Your location", isSet: true });
      }
    };

    if (!location.isSet && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Please enable GPS", error);
          setLocation({
            lat: null,
            lng: null,
            address: "Your location",
            isSet: true,
          });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, [location.isSet]);

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

  const addToCart = (item, currentSelectedOptions = {}) => {
    const optionsKey = buildOptionsKey(currentSelectedOptions);
    const cartItemId = `${item.id}-${optionsKey}`;
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
          options: optionDetails,
        },
      ];
    });

    setSelectedItem(null);
    setSelectedOptions({});
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
      orderType,
      location,
      phone,
      setShowCart,
      setShowLocModal,
    });
  };

  const newOrderDelivery = async (token = null) => {
    return submitDeliveryOrder({
      token,
      cart,
      cartTotal,
      orderType,
      location,
      menus,
      phone,
      addNewOrderDelivery,
      setShowCart,
      setShowLocModal,
      setShowPaymentModal,
      setCart,
      setSelectedItem,
      setSelectedOptions,
      setPaymentToken,
      setIsProcessingOrder,
    });
  };

  return {
    cart,
    cartTotal,
    location,
    menus,
    phone,
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
