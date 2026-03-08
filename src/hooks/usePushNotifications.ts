import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY_STORAGE = "push-notifications-enabled";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      setIsSubscribed(localStorage.getItem(VAPID_PUBLIC_KEY_STORAGE) === "true");
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        setIsSubscribed(true);
        localStorage.setItem(VAPID_PUBLIC_KEY_STORAGE, "true");
        toast.success("Push notifications enabled! 🔔");

        // Show a test notification
        if (navigator.serviceWorker.controller) {
          new Notification("CityBites Lahore", {
            body: "You'll now get notified about new deals and trending restaurants!",
            icon: "/pwa-192x192.png",
          });
        }
        return true;
      } else {
        toast.error("Notification permission denied");
        return false;
      }
    } catch (err) {
      console.error("Push permission error:", err);
      toast.error("Failed to enable notifications");
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(() => {
    setIsSubscribed(false);
    localStorage.removeItem(VAPID_PUBLIC_KEY_STORAGE);
    toast.success("Push notifications disabled");
  }, []);

  // Send a local notification (used for in-app triggers)
  const sendLocalNotification = useCallback(
    (title: string, body: string, url?: string) => {
      if (permission !== "granted") return;

      try {
        const notif = new Notification(title, {
          body,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `citybites-${Date.now()}`,
        });

        if (url) {
          notif.onclick = () => {
            window.focus();
            window.location.href = url;
          };
        }
      } catch {
        // Fallback for browsers that block Notification constructor
      }
    },
    [permission]
  );

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    unsubscribe,
    sendLocalNotification,
  };
}
