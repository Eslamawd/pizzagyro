"use client";
import RestaurantManagement from "@/components/dashboard/RestaurantManagement";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams();
  return <RestaurantManagement userId={params.id} />;
}

export default Page;
