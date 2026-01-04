"use client";
import RestaurantPage from "@/components/dashboard/restaurants/RestaurantPage";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams();
  return <RestaurantPage id={params.id} />;
}

export default Page;
