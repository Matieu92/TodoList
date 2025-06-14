import { z } from 'zod';

export const todoSchema = z.object({
  title: z.string().min(1, { message: "Tytuł jest wymagany" }).max(100, { message: "Tytuł za długi (max 100 znaków)" }),
  description: z.string().max(500, { message: "Opis za długi (max 500 znaków)" }).optional(),
  dueDate: z.coerce.date().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Niepoprawny format email" }),
  password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
});

export const signupSchema = z.object({
  email: z.string().email({ message: "Niepoprawny format email" }),
  password: z.string().min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
});