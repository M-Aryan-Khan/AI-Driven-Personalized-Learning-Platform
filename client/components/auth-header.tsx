"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function AuthHeader() {
  return (
    <header className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative w-8 h-8">
          <motion.div
            className="absolute w-8 h-8 bg-warm-coral rounded-lg transform rotate-45"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
          <motion.div
            className="absolute w-4 h-4 bg-soft-peach rounded-sm top-2 left-2"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
        <span className="text-deep-cocoa text-xl font-bold group-hover:text-warm-coral transition-colors">
          Synapse
        </span>
      </Link>

      <Link
        href="/"
        className="flex items-center gap-1 text-deep-cocoa hover:text-warm-coral transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>
    </header>
  );
}
