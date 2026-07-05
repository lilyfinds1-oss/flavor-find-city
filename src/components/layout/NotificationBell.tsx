import { Bell, CheckCheck, Star, Ticket, MessageSquare, Award, Sparkles, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { icon: LucideIcon; tone: string }> = {
  xp_earned: { icon: Sparkles, tone: "text-amber-500 bg-amber-500/10" },
  new_deal: { icon: Ticket, tone: "text-primary bg-primary/10" },
  review_approved: { icon: Star, tone: "text-emerald-500 bg-emerald-500/10" },
  new_comment: { icon: MessageSquare, tone: "text-blue-500 bg-blue-500/10" },
  badge_earned: { icon: Award, tone: "text-fuchsia-500 bg-fuchsia-500/10" },
  referral: { icon: Users, tone: "text-primary bg-primary/10" },
};

function iconFor(type: string) {
  return TYPE_META[type] ?? { icon: Bell, tone: "text-muted-foreground bg-muted" };
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass border-border/50">
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={markAllAsRead}>
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {notifications.map((notif) => {
                const meta = iconFor(notif.type);
                const Icon = meta.icon;
                const content = (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                      !notif.is_read && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", meta.tone)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-medium leading-tight flex-1">{notif.title}</p>
                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                      </div>
                      {notif.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );

                return notif.link ? (
                  <Link key={notif.id} to={notif.link} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={notif.id}>{content}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/30">
            <Link to="/profile" className="block text-center text-xs text-muted-foreground hover:text-foreground py-1.5">
              View all activity
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
