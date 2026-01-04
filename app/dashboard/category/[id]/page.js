"use client";
import CategoryItemManagement from "@/components/dashboard/restaurants/category/CategoryItemManagement";

import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams();
  return <CategoryItemManagement category_id={params.id} />;
}

export default Page;
