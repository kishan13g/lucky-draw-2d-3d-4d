import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Check, Edit2, Loader2, LogOut, UserCircle, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCallerProfile,
  useCallerRole,
  useSaveProfile,
} from "../hooks/useQueries";

export default function UserProfilePage() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: role } = useCallerRole();
  const { mutate: saveProfile, isPending: saving } = useSaveProfile();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (profile?.name) setEditName(profile.name);
  }, [profile?.name]);

  const handleSave = () => {
    if (!editName.trim() || !profile) return;
    saveProfile(
      { ...profile, name: editName.trim() },
      {
        onSuccess: () => {
          toast.success("Naam update ho gaya!");
          setEditing(false);
        },
        onError: () => toast.error("Update fail hua"),
      },
    );
  };

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 10)}...${principal.slice(-6)}`
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-primary" />
          </div>
          <span
            className="font-bold text-foreground text-sm"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
          >
            ControlHub
          </span>
        </div>
        <Button
          data-ocid="profile.button"
          variant="ghost"
          size="sm"
          onClick={clear}
          className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Logout</span>
        </Button>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4">
        {profileLoading ? (
          <div
            data-ocid="profile.loading_state"
            className="flex justify-center py-12"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Profile card */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span
                    className="text-primary font-bold text-xl"
                    style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
                  >
                    {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {profile?.name || "User"}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-xs border-primary/40 text-primary"
                    >
                      {role || "user"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {shortPrincipal}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit name section */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Naam Edit Karein
                </h3>
                {!editing && (
                  <Button
                    data-ocid="profile.edit_button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(true);
                      setEditName(profile?.name || "");
                    }}
                    className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="editName"
                      className="text-xs text-muted-foreground"
                    >
                      Naya Naam
                    </Label>
                    <Input
                      id="editName"
                      data-ocid="profile.input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Apna naam likhen"
                      className="h-10 bg-secondary/50 border-border rounded-xl text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-ocid="profile.save_button"
                      onClick={handleSave}
                      disabled={saving || !editName.trim()}
                      size="sm"
                      className="flex-1 bg-primary text-primary-foreground h-9 rounded-xl text-sm"
                    >
                      {saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button
                      data-ocid="profile.cancel_button"
                      onClick={() => setEditing(false)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border h-9 rounded-xl text-sm"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile?.name || "—"}
                </p>
              )}
            </div>

            {/* Account status */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Account Status
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${profile?.isBlocked ? "bg-destructive" : "bg-[oklch(0.68_0.18_145)]"}`}
                />
                <span
                  className={`text-sm ${profile?.isBlocked ? "text-destructive" : "text-foreground"}`}
                >
                  {profile?.isBlocked ? "Block hai" : "Active hai"}
                </span>
              </div>
            </div>
          </motion.div>
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
