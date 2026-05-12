import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Unlock,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllUsers,
  useAssignRole,
  useBlockUser,
  useUnblockUser,
} from "../hooks/useQueries";

export default function AdminDashboard() {
  const { clear, identity } = useInternetIdentity();
  const { data: users = [], isLoading, refetch, isFetching } = useAllUsers();
  const { mutate: blockUser, isPending: blocking } = useBlockUser();
  const { mutate: unblockUser, isPending: unblocking } = useUnblockUser();
  const { mutate: assignRole, isPending: assigning } = useAssignRole();
  const [pendingPrincipal, setPendingPrincipal] = useState<string | null>(null);

  const myPrincipal = identity?.getPrincipal().toString();

  const handleBlock = (principal: Principal, isBlocked: boolean) => {
    const pid = principal.toString();
    setPendingPrincipal(pid);
    if (isBlocked) {
      unblockUser(principal, {
        onSuccess: () => {
          toast.success("User unblock ho gaya");
          setPendingPrincipal(null);
        },
        onError: () => {
          toast.error("Action fail hua");
          setPendingPrincipal(null);
        },
      });
    } else {
      blockUser(principal, {
        onSuccess: () => {
          toast.success("User block ho gaya");
          setPendingPrincipal(null);
        },
        onError: () => {
          toast.error("Action fail hua");
          setPendingPrincipal(null);
        },
      });
    }
  };

  const handleRoleChange = (principal: Principal, role: string) => {
    const pid = principal.toString();
    setPendingPrincipal(pid);
    assignRole(
      { user: principal, role: role as UserRole },
      {
        onSuccess: () => {
          toast.success("Role update ho gaya");
          setPendingPrincipal(null);
        },
        onError: () => {
          toast.error("Role update fail hua");
          setPendingPrincipal(null);
        },
      },
    );
  };

  const isPending = blocking || unblocking || assigning;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span
              className="font-bold text-foreground"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              ControlHub
            </span>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-ocid="admin.secondary_button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              data-ocid="admin.button"
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Kul Users", value: users.length, icon: Users },
            {
              label: "Active",
              value: users.filter(([, p]) => !p.isBlocked).length,
              color: "text-[oklch(0.68_0.18_145)]",
            },
            {
              label: "Blocked",
              value: users.filter(([, p]) => p.isBlocked).length,
              color: "text-destructive",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-3 text-center"
            >
              <p
                className={`text-xl font-bold ${stat.color || "text-primary"}`}
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Saare Users
        </h2>

        {isLoading ? (
          <div
            data-ocid="admin.loading_state"
            className="flex justify-center py-16"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div
            data-ocid="admin.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
          >
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Abhi koi user nahi hai
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="admin.list">
            <AnimatePresence>
              {users.map(([principal, profile], idx) => {
                const pid = principal.toString();
                const isMe = pid === myPrincipal;
                const isThisPending = pendingPrincipal === pid && isPending;
                const shortPid = `${pid.slice(0, 8)}...${pid.slice(-4)}`;

                return (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    data-ocid={`admin.item.${idx + 1}`}
                    className={`glass-card rounded-2xl p-4 space-y-3 ${
                      profile.isBlocked ? "border-destructive/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            profile.isBlocked
                              ? "bg-destructive/20 border border-destructive/30"
                              : "bg-primary/20 border border-primary/30"
                          }`}
                        >
                          <span
                            className={`font-bold text-sm ${profile.isBlocked ? "text-destructive" : "text-primary"}`}
                            style={{
                              fontFamily: "Bricolage Grotesque, sans-serif",
                            }}
                          >
                            {profile.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {profile.name || "No Name"}
                            </p>
                            {isMe && (
                              <Badge
                                variant="outline"
                                className="text-xs border-primary/30 text-primary py-0"
                              >
                                Aap
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {shortPid}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {profile.isBlocked && (
                          <Badge variant="destructive" className="text-xs py-0">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <Select
                        defaultValue={profile.isBlocked ? "blocked" : "active"}
                        onValueChange={(v) => {
                          if (v === "blocked" && !profile.isBlocked)
                            handleBlock(principal, false);
                          else if (v === "active" && profile.isBlocked)
                            handleBlock(principal, true);
                        }}
                        disabled={isThisPending || isMe}
                      >
                        <SelectTrigger
                          data-ocid={`admin.select.${idx + 1}`}
                          className="h-8 flex-1 bg-secondary/50 border-border text-xs rounded-lg"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        defaultValue={"user"}
                        onValueChange={(v) => handleRoleChange(principal, v)}
                        disabled={isThisPending || isMe}
                      >
                        <SelectTrigger
                          data-ocid={`admin.select.${idx + 1}`}
                          className="h-8 flex-1 bg-secondary/50 border-border text-xs rounded-lg"
                        >
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.admin}>Admin</SelectItem>
                          <SelectItem value={UserRole.user}>User</SelectItem>
                          <SelectItem value={UserRole.guest}>Guest</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        data-ocid={
                          profile.isBlocked
                            ? `admin.secondary_button.${idx + 1}`
                            : `admin.delete_button.${idx + 1}`
                        }
                        size="sm"
                        variant={profile.isBlocked ? "outline" : "destructive"}
                        disabled={isThisPending || isMe}
                        onClick={() =>
                          handleBlock(principal, profile.isBlocked)
                        }
                        className="h-8 w-8 p-0 flex-shrink-0 rounded-lg"
                      >
                        {isThisPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : profile.isBlocked ? (
                          <Unlock className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="px-4 py-4 text-center text-xs text-muted-foreground border-t border-border/30">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
