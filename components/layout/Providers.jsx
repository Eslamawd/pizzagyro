"use client";
import { Toaster } from "@/components/ui/Toster";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { usePathname } from "next/navigation";
import InstallPrompt from "../InstallPrompt";
import { OrderProvider } from "@/context/OrderContext";

export default function Providers({ children }) {
  const pathname = usePathname();

  // الصفحات اللي مش عايز فيها Header و Footer
  const hideLayoutRoutes = ["/menu", "/kitchen", "/cashier", "/fast"];
  const shouldHideLayout = hideLayoutRoutes.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <AuthProvider>
      <LanguageProvider>
        <OrderProvider>
          <CurrencyProvider>
            {/* Toasts */}
            <Toaster />
            <Sonner />

            {/* Header & Footer حسب المسار */}
            {!shouldHideLayout && <Header />}

            {children}
            <InstallPrompt />

            {!shouldHideLayout && <Footer />}
          </CurrencyProvider>
        </OrderProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
