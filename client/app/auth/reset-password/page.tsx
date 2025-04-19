"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import AuthHeader from "@/components/auth-header";
import api from "@/lib/axios";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    resetCode: ["", "", "", "", "", ""],
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Redirect if no email is provided
    if (!email) {
      router.push("/auth/forgot-password");
      return;
    }

    // Focus first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Set up cooldown timer if active
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [email, router, cooldown]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    // Update the code array
    const newCode = [...formData.resetCode];
    newCode[index] = value;
    setFormData({
      ...formData,
      resetCode: newCode,
    });

    // Clear error when user types
    if (errors.resetCode) {
      setErrors({
        ...errors,
        resetCode: "",
      });
    }

    // Auto-focus next input if value is entered
    const nextInput = inputRefs.current[index + 1];
    if (value && index < 5 && nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const prevInput = inputRefs.current[index - 1];
    const nextInput = inputRefs.current[index + 1];

    if (e.key === "Backspace" && !formData.resetCode[index] && index > 0) {
      prevInput?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      prevInput?.focus();
    }

    if (e.key === "ArrowRight" && index < formData.resetCode.length - 1) {
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setFormData({
        ...formData,
        resetCode: digits,
      });

      // Focus last input after paste
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate reset code
    const resetCode = formData.resetCode.join("");
    if (resetCode.length !== 6) {
      newErrors.resetCode = "Please enter all 6 digits of the reset code";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({
        form: "Email is required",
      });
      return;
    }

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const response = await api.post("/api/auth/reset-password", {
          email,
          reset_code: formData.resetCode.join(""),
          password: formData.password,
          confirm_password: formData.confirmPassword,
        });

        toast({
          title: "Password reset successful!",
          description:
            "Your password has been reset. You can now log in with your new password.",
        });

        // Redirect to login page
        router.push(
          `/auth/login?reset=success&email=${encodeURIComponent(email)}`
        );
      } catch (error: any) {
        console.error("Password reset error:", error);

        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Failed to reset password";

        setErrors({
          form: errorMessage,
        });

        toast({
          variant: "destructive",
          title: "Password reset failed",
          description: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || !email) return;

    setIsResending(true);

    try {
      const response = await api.post("/api/auth/forgot-password", { email });

      toast({
        title: "Reset code sent!",
        description: "Please check your email for the new reset code.",
      });

      // Reset code inputs
      setFormData({
        ...formData,
        resetCode: ["", "", "", "", "", ""],
      });
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      // Set cooldown to 60 seconds
      setCooldown(60);
    } catch (error: any) {
      console.error("Resend error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to resend reset code";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-vanilla-cream flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-rose-dust/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-deep-cocoa">
              Reset your password
            </h1>

            <p className="text-rose-dust">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-deep-cocoa">{email}</span> and
              create a new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resetCode">Verification Code</Label>
              <div className="flex justify-between gap-2">
                {formData.resetCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border border-rose-dust/30 rounded-md focus:border-warm-coral focus:ring-1 focus:ring-warm-coral outline-none"
                  />
                ))}
              </div>
              {errors.resetCode && (
                <p className="text-red-500 text-xs mt-1">{errors.resetCode}</p>
              )}

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || cooldown > 0}
                  className="text-warm-coral hover:underline text-xs inline-flex items-center gap-1 disabled:opacity-50 disabled:hover:no-underline"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend code (${cooldown}s)`
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Resend code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-dust hover:text-deep-cocoa"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-rose-dust">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={
                    errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-dust hover:text-deep-cocoa"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.form}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            <div className="text-center text-sm text-rose-dust">
              <Link
                href="/auth/login"
                className="text-warm-coral hover:underline"
              >
                Back to login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
