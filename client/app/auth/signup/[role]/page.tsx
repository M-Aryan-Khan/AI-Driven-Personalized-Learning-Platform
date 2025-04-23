"use client";

import { useRef } from "react";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Facebook, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AuthHeader from "@/components/auth-header";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    receiveUpdates: false,
    verificationCode: ["", "", "", "", "", ""],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Refs for verification code inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Validate if we're on a valid role page
  // useEffect(() => {
  //   if (role !== "teach" && role !== "student") {
  //     router.push("/auth/signup/student");
  //   }
  // }, [role, router]);

  const isTeacher = role === "teach";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleCodeInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    // Update the code array
    const newCode = [...formData.verificationCode];
    newCode[index] = value;
    setFormData({
      ...formData,
      verificationCode: newCode,
    });

    // Clear error when user types
    if (errors.verificationCode) {
      setErrors({
        ...errors,
        verificationCode: "",
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
    // Handle backspace to go to previous input
    if (
      e.key === "Backspace" &&
      !formData.verificationCode[index] &&
      index > 0
    ) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) nextInput.focus();
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
        verificationCode: digits,
      });

      // Focus last input after paste
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationCode = () => {
    const code = formData.verificationCode.join("");
    if (code.length !== 6) {
      setErrors({
        verificationCode: "Please enter all 6 digits of the verification code",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateStep2()) {
      setIsSubmitting(true);

      try {
        // Prepare data for API
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          agree_terms: formData.agreeTerms,
          receive_updates: formData.receiveUpdates,
        };

        // Call the appropriate API endpoint based on role
        const endpoint = isTeacher
          ? "/api/auth/register/expert"
          : "/api/auth/register/student";
        const response = await api.post(endpoint, userData);

        // Show success message
        toast({
          title: "Registration successful!",
          description: "Please verify your email with the code we sent you.",
        });

        // Move to verification step
        setStep(3);
        setRegistrationComplete(true);

        // Focus first verification code input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } catch (error: any) {
        console.error("Signup error:", error);

        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "An error occurred during signup. Please try again.";

        setErrors({
          form: errorMessage,
        });

        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateVerificationCode()) {
      setIsVerifying(true);

      try {
        const response = await api.post("/api/auth/verify-email", {
          email: formData.email,
          verification_code: formData.verificationCode.join(""),
        });

        toast({
          title: "Email verified!",
          description:
            "Your account has been successfully verified. You can now log in.",
        });

        // Redirect to login page
        router.push(
          `/auth/login?verified=true&email=${encodeURIComponent(
            formData.email
          )}`
        );
      } catch (error: any) {
        console.error("Verification error:", error);

        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Verification failed. Please check your code and try again.";

        setErrors({
          verificationCode: errorMessage,
        });

        toast({
          variant: "destructive",
          title: "Verification failed",
          description: errorMessage,
        });
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await api.post("/api/auth/resend-verification", {
        email: formData.email,
      });

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the new verification code.",
      });

      // Reset verification code inputs
      setFormData({
        ...formData,
        verificationCode: ["", "", "", "", "", ""],
      });
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error: any) {
      console.error("Resend error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to resend verification code";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // const handleSocialSignup = async (provider: string) => {
  // setIsSubmitting(true);
const handleSocialSignup = (provider: "google") => {
  try {
    setIsSubmitting(true);
    // Use the correct backend URL from environment if possible
    window.location.href = "http://127.0.0.1:8000/api/auth/login-google";
  } catch (error) {
    console.error(`${provider} signup error:`, error);
    setErrors({
      form: `An error occurred during ${provider} signup. Please try again.`,
    });
    setIsSubmitting(false);
  }
};

  

  const nextStep = () => {
    if (step === 1) {
      // Validate first step fields
      if (validateStep1()) {
        setStep(2);
      }
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-vanilla-cream flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left column - Form */}
        <div className="w-full p-4 md:p-8 flex items-center justify-center">
          <motion.div
            className="w-full max-w-md space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-deep-cocoa">
                {step === 3
                  ? "Verify Your Email"
                  : isTeacher
                  ? "Become a Synapse Expert"
                  : "Join Synapse as a Student"}
              </h1>
              <p className="text-rose-dust">
                {step === 3
                  ? `Enter the 6-digit verification code sent to ${formData.email}`
                  : isTeacher
                  ? "Share your expertise and earn teaching tech skills"
                  : "Start your journey to master tech skills with expert guidance"}
              </p>
            </div>

            {/* Signup Form */}
            {step === 3 ? (
              <form onSubmit={handleVerifyEmail} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {formData.verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleCodeInputChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold border border-rose-dust/30 rounded-md focus:border-warm-coral focus:ring-1 focus:ring-warm-coral outline-none"
                    />
                  ))}
                </div>

                {errors.verificationCode && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {errors.verificationCode}
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-4 rounded-lg py-3 text-md items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isVerifying ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-rose-dust mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-warm-coral hover:underline inline-flex items-center gap-1"
                  >
                    Resend verification code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        <div className="min-h-[0.5rem]">
                          {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        <div className="min-h-[0.5rem]">
                          {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-red-500 " : ""}
                      />
                      <div className="min-h-[0.5rem]">
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue
                      <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className={
                            errors.password ? "border-red-500 pr-10" : "pr-10"
                          }
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password}
                        </p>
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
                            errors.confirmPassword
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeTerms"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              agreeTerms: checked as boolean,
                            })
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="agreeTerms"
                            className="text-sm font-normal"
                          >
                            I agree to the{" "}
                            <Link
                              href="/terms"
                              className="text-warm-coral hover:underline"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              className="text-warm-coral hover:underline"
                            >
                              Privacy Policy
                            </Link>
                          </Label>
                          {errors.agreeTerms && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.agreeTerms}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="receiveUpdates"
                          name="receiveUpdates"
                          checked={formData.receiveUpdates}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              receiveUpdates: checked as boolean,
                            })
                          }
                          className="mt-1"
                        />
                        <Label
                          htmlFor="receiveUpdates"
                          className="text-sm font-normal"
                        >
                          I want to receive updates about new features, experts,
                          and promotions
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 border border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-4 rounded-lg py-3 text-md items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Back
                      </motion.button>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 w-full bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                        whileHover={{
                          scale: 1.02,
                          boxShadow:
                            "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            Sign Up
                            <ArrowRight size={18} />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {errors.form && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {errors.form}
                  </div>
                )}
              </form>
            )}

            {step !== 3 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-rose-dust/20"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-vanilla-cream px-2 text-rose-dust">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => handleSocialSignup("google")}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-deep-cocoa font-semibold py-3 px-4 rounded-lg border border-rose-dust/20 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </motion.button>

                  <motion.button
                    type="button"
                    // onClick={() => handleSocialSignup("facebook")}
                    disabled={isSubmitting}
                    className="cursor-pointer flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-3 px-4 rounded-lg"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Facebook size={20} />
                    Continue with Facebook
                  </motion.button>

                  <motion.button
                    type="button"
                    // onClick={() => handleSocialSignup("apple")}
                    disabled={isSubmitting}
                    className="cursor-pointer flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="white"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.2 3.51 7.7 8.87 7.45c1.33.03 2.23.6 3.05.58.92-.03 1.75-.6 3.02-.64 1.93-.08 3.37.87 4.35 2.24-3.84 2.15-3.22 7.34.76 8.65ZM12.03 7.4C11.75 5.05 13.6 3.1 15.9 3c.38 2.55-2.25 4.46-3.87 4.4Z" />
                    </svg>
                    Continue with Apple
                  </motion.button>
                </div>

                <div className="text-center text-sm text-rose-dust">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-warm-coral hover:underline font-semibold"
                  >
                    Log in
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
