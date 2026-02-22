"use client";

import { AnimatePresence } from "framer-motion";
import { Coffee, Drumstick, Pizza, Utensils } from "lucide-react";
import CloverPayment from "./CloverPayment";
import { RESTAURANT_DATA } from "./RestaurantData";
import DeliveryCartDrawer from "./menu-show-delivery/DeliveryCartDrawer";
import DeliveryFloatingCartButton from "./menu-show-delivery/DeliveryFloatingCartButton";
import DeliveryItemModal from "./menu-show-delivery/DeliveryItemModal";
import DeliveryLocationBar from "./menu-show-delivery/DeliveryLocationBar";
import DeliveryLocationModal from "./menu-show-delivery/DeliveryLocationModal";
import DeliveryMenuGrid from "./menu-show-delivery/DeliveryMenuGrid";
import DeliveryMenuModal from "./menu-show-delivery/DeliveryMenuModal";
import { EMPTY_ITEM_SELECTION } from "./menu-show-delivery/constants";
import { calculateItemTotal } from "./menu-show-delivery/utils";
import useMenuShowDelivery from "./menu-show-delivery/useMenuShowDelivery";

const MenuShowDelivery = () => {
  const {
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
  } = useMenuShowDelivery();

  const getMenuIcon = (menuName) => {
    if (menuName.includes("Pizza"))
      return <Pizza className="text-orange-500" />;
    if (menuName.includes("Gyro"))
      return <Utensils className="text-green-500" />;
    if (menuName.includes("Calzones"))
      return <Drumstick className="text-red-500" />;
    if (menuName.includes("Wings"))
      return <Drumstick className="text-yellow-500" />;
    if (menuName.includes("Drinks"))
      return <Coffee className="text-blue-500" />;
    return <Utensils className="text-purple-500" />;
  };

  return (
    <section className="min-h-screen mt-30 w-full pb-32 font-sans">
      <DeliveryLocationBar
        location={location}
        onClick={() => setShowLocModal(true)}
      />

      <DeliveryMenuGrid
        restaurantName={RESTAURANT_DATA.name}
        menus={menus}
        onSelectMenu={setSelectedMenu}
        getMenuIcon={getMenuIcon}
      />

      <DeliveryMenuModal
        selectedMenu={selectedMenu}
        onClose={() => setSelectedMenu(null)}
        getMenuIcon={getMenuIcon}
        selectedOptions={selectedOptions}
        handleOptionSelect={handleOptionSelect}
        onSelectItem={(item) => {
          setSelectedItem(item);
          setSelectedOptions(EMPTY_ITEM_SELECTION);
        }}
      />

      <DeliveryItemModal
        selectedItem={selectedItem}
        selectedOptions={selectedOptions}
        calculateItemTotal={calculateItemTotal}
        handleOptionSelect={handleOptionSelect}
        onAddToCart={addToCart}
        onClose={resetSelectedItemState}
      />

      <DeliveryCartDrawer
        showCart={showCart}
        cart={cart}
        phone={phone}
        orderType={orderType}
        cartTotal={cartTotal}
        setPhone={setPhone}
        setOrderType={setOrderType}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        onClose={() => setShowCart(false)}
        onProceed={() => {
          if (!canProceedToPayment()) return;
          setShowPaymentModal(true);
        }}
      />

      <DeliveryLocationModal
        showLocModal={showLocModal}
        location={location}
        setLocation={setLocation}
        onClose={() => setShowLocModal(false)}
      />

      <DeliveryFloatingCartButton
        cartCount={cart.length}
        cartTotal={cartTotal}
        onOpenCart={() => setShowCart(true)}
      />

      <AnimatePresence>
        {showPaymentModal && (
          <CloverPayment
            cartTotal={cartTotal}
            isProcessingOrder={isProcessingOrder}
            paymentToken={paymentToken}
            onPaymentSuccess={(token) => {
              setPaymentToken(token);
              newOrderDelivery(token);
            }}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default MenuShowDelivery;
