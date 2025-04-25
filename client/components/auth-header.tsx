"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Logo from "@/app/assets/Logo.png";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <header className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center">
          <Link href="/" className="flex items-center gap-1 group">
            <div className="relative w-12 h-12">
              <Image src={Logo.src || "/placeholder.svg"} alt={"Logo"} fill className="object-cover" />
            </div>
            <span className="text-[#3d2c2e] text-xl font-bold group-hover:text-[#ff8474] transition-colors">
              Synapse
            </span>
          </Link>
        </div>

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
