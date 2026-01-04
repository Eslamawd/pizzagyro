"use client";
import InventoryItemsPage from "@/components/dashboard/inventoryItems/InventoryItemsPage";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams();
  return <InventoryItemsPage restaurantId={params.id} />;
}

export default Page;
