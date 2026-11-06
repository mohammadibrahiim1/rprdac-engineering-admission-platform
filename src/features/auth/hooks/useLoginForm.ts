import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/storeHooks";
import { LoginFormData, loginValidationSchema } from "../schemas/Auth.schemas";
import { login } from "../authThunk";

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

  // React Hook Form + Zod Resolver setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError(null);

    // Turnstile টোকেন চেক (যদি এনভায়রনমেন্টে সাইট কি থাকে)
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setGeneralError("Please complete the security verification.");
      return;
    }

    try {
      const resultAction = await dispatch(
        login({
          phone: data.phone,
          password: data.password,
          cfTurnstileToken: turnstileToken,
        }),
      );

      if (login.fulfilled.match(resultAction)) {
        navigate("/dashboard");
      } else {
        const errorMsg =
          (resultAction.payload as string) ||
          "Login failed. Please check your credentials.";
        setGeneralError(errorMsg);

        // ফেইল করলে টার্নস্টাইল রিসেট করা
        setTurnstileWidgetKey((prev) => prev + 1);
        setTurnstileToken("");
      }
    } catch (err) {
      setGeneralError("An unexpected error occurred. Please try again.");
      setTurnstileWidgetKey((prev) => prev + 1);
      setTurnstileToken("");
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    generalError,
    turnstileToken,
    setTurnstileToken,
    turnstileWidgetKey,
    TURNSTILE_SITE_KEY,
  };
}
