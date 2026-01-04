"use client";
import MenuCategoriesManagement from "@/components/dashboard/restaurants/menus/MenuCategoriesManagement";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams();
  return <MenuCategoriesManagement menuId={params.id} />;
}

export default Page;
