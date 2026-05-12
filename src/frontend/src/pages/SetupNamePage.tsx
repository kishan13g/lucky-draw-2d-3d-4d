import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

export default function SetupNamePage() {
  const [name, setName] = useState("");
  const { mutate: saveProfile, isPending } = useSaveProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile(
      { name: name.trim(), isBlocked: false },
      {
        onSuccess: () => toast.success("Profile save ho gaya!"),
        onError: () => toast.error("Kuch galat hua, dobara try karein"),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <UserCircle className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Apna naam set karein
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform use karne ke liye ek naam chahiye
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 space-y-4"
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Aapka Naam
            </Label>
            <Input
              id="name"
              data-ocid="setup.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jaise: Rahul Kumar"
              className="h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              autoFocus
              maxLength={50}
            />
            {name.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Minimum 1 character chahiye
              </p>
            )}
          </div>

          <Button
            data-ocid="setup.submit_button"
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full bg-primary text-primary-foreground h-11 rounded-xl font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue karein"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
