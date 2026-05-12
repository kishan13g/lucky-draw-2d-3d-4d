import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function BlockedPage() {
  const { clear } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 border border-destructive/40 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Account Block Hai
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Aapka account admin ne block kar diya hai. Access ke liye admin se
          sampark karein.
        </p>
        <div
          data-ocid="blocked.error_state"
          className="glass-card rounded-2xl p-4 mb-6 border-destructive/30"
        >
          <p className="text-destructive text-sm font-medium">
            🚫 Aapka access revoke kar diya gaya hai
          </p>
        </div>
        <Button
          data-ocid="blocked.button"
          variant="outline"
          onClick={clear}
          className="border-border text-foreground hover:bg-secondary"
        >
          Logout karein
        </Button>
      </motion.div>
    </div>
  );
}
