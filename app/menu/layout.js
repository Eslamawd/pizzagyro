"use client";
import { OrderProvider } from "@/context/OrderContext";
import React from "react";

function layout({ children }) {
  return <OrderProvider>{children}</OrderProvider>;
}

export default layout;
