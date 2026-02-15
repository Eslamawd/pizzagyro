"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function InstallPrompt() {
  const pathname = usePathname();
  const [appName, setAppName] = useState("Pizza & Gyro");
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/cashier")) {
      setAppName("Pizza & Gyro Cashier");
    } else if (pathname.startsWith("/kitchen")) {
      setAppName("Pizza & Gyro Kitchen");
    } else {
      setAppName("Pizza & Gyro Menu");
    }

    const handler = () => setShowPrompt(true);
    window.addEventListener("pwa-install-available", handler);

    return () => window.removeEventListener("pwa-install-available", handler);
  }, [pathname]);

  const install = async () => {
    const event = window.getDeferredPrompt?.();
    if (!event) return;

    event.prompt();
    const result = await event.userChoice;

    console.log(result);

    window.clearDeferredPrompt?.();
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4  p-4 shadow-lg bg-white rounded-xl border ">
      <p>Install {appName}?</p>
      <button onClick={install} className="mt-2  px-3 py-1 rounded">
        Install
      </button>
    </div>
  );
}
