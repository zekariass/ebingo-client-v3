import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  nickName: z.string().min(1, { message: "Nickname is required" }),
  dateOfBirth: z.preprocess((val) => {
    // Convert string to Date if necessary
    if (typeof val === "string" || val instanceof Date) return new Date(val);
  }, z.date().refine((date) => {
    const today = new Date();
    const ageDiff = today.getFullYear() - date.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > date.getMonth() ||
      (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
    const age = hasHadBirthdayThisYear ? ageDiff : ageDiff - 1;
    return age >= 18;
  }, { message: "You must be at least 18 years old" })),
  phone: z.string().regex(/^\+?\d{10,15}$/, { message: "Invalid phone number" }),
});

export type SignupFormData = z.infer<typeof signupSchema>;
