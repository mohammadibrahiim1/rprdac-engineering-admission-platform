import { z } from "zod";

// বাংলাদেশি ফোন নম্বর ভ্যালিডেশনের জন্য রেগেক্স (01 দিয়ে শুরু এবং মোট ১১ ডিজিট)
const bdPhoneRegex = /^01[3-9]\d{8}$/;

export const loginValidationSchema = z.object({
  phone: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(bdPhoneRegex, {
      message:
        "Please enter a valid Bangladeshi phone number (e.g., 017XXXXXXXX)",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password is too long" }),
  cfTurnstileToken: z.string().optional(),
});

// Zod স্কিমা থেকে অটো টাইপ জেনারেট করার জন্য (অপশনাল, টাইপস ফাইলে অলরেডি আছে)
export type LoginFormData = z.infer<typeof loginValidationSchema>;
