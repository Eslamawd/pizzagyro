"use client";

import OrdersManagement from "@/components/dashboard/orders/OrdersManagement";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams();
  return <OrdersManagement restaurantId={params.id} />;
}

export default Page;
