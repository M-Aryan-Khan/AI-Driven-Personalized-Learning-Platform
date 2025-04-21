"use client";

import { useAuth } from "@/contexts/auth-context";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type MobileAuthButtonProps = {
  onClick?: () => void;
};

export default function MobileAuthButton({ onClick }: MobileAuthButtonProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    if (onClick) onClick();
    router.push("/auth/login");
  };

  const handleDashboard = () => {
    if (onClick) onClick();
    if (user?.role === "student") {
      router.push("/dashboard/student");
    } else if (user?.role === "expert") {
      router.push("/dashboard/expert");
    }
  };

  if (loading) {
    return (
      <motion.button className="mt-4 border-2 border-[#ffc6a8] bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 text-deep-cocoa px-6 rounded-lg py-3 text-lg flex items-center justify-center gap-2 w-full opacity-70">
        <div className="w-5 h-5 border-2 border-deep-cocoa border-t-transparent rounded-full animate-spin"></div>
      </motion.button>
    );
  }

  if (user) {
    return (
      <motion.button
        className="mt-4 bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-6 rounded-lg py-3 text-lg flex items-center justify-center gap-2 w-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDashboard}
      >
        Go to Dashboard
      </motion.button>
    );
  }

  return (
    <motion.button
      className="mt-4 border-2 border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-6 rounded-lg py-3 text-lg flex items-center justify-center gap-2 w-full"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogin}
    >
      <LogIn size={20} />
      Log In
    </motion.button>
  );
}
