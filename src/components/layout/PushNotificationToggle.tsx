import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, requestPermission, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      className="gap-2"
      onClick={isSubscribed ? unsubscribe : requestPermission}
    >
      {isSubscribed ? (
        <>
          <BellOff className="w-4 h-4" />
          <span className="hidden sm:inline">Disable Notifications</span>
          <span className="sm:hidden">Disable</span>
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Enable Notifications</span>
          <span className="sm:hidden">Enable</span>
        </>
      )}
    </Button>
  );
}
