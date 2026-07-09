import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Star, Ticket, MessageSquare, Award, Sparkles, Users, type LucideIcon } from "lucide-react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnimatedList } from "@/components/ui/animated-list";
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
  const bellRef = useRef<HTMLButtonElement>(null);
  const lastUnread = useRef(unreadCount);
  const [open, setOpen] = useState(false);

  // Ring the bell whenever unread count grows
  useEffect(() => {
    if (unreadCount > lastUnread.current && bellRef.current) {
      const el = bellRef.current.querySelector<SVGElement>("svg");
      if (el) {
        gsap.fromTo(
          el,
          { rotate: 0 },
          {
            keyframes: [{ rotate: -18 }, { rotate: 16 }, { rotate: -12 }, { rotate: 8 }, { rotate: 0 }],
            duration: 0.8,
            ease: "power2.out",
            transformOrigin: "top center",
          }
        );
      }
    }
    lastUnread.current = unreadCount;
  }, [unreadCount]);

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          ref={bellRef}
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in z-10">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary/60 animate-ping" />
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col gap-0 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-4 border-b border-border/40 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">Notifications</SheetTitle>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1" onClick={markAllAsRead}>
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <AnimatedList
            items={notifications}
            keyFor={(n) => n.id}
            className="divide-y divide-border/20"
            emptyState={
              <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                No notifications yet. When something happens, it'll pop up here.
              </div>
            }
            render={(notif) => {
              const meta = iconFor(notif.type);
              const Icon = meta.icon;
              const inner = (
                <div
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors cursor-pointer group",
                    !notif.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"
                  )}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                    if (notif.link) setOpen(false);
                  }}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", meta.tone)}>
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
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
              return notif.link ? (
                <Link to={notif.link} className="block">{inner}</Link>
              ) : (
                inner
              );
            }}
          />
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/40">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-muted-foreground hover:text-foreground py-2"
            >
              View all activity
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
