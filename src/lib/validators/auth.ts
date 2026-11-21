import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  password: z.string().min(8, "Mot de passe requis.").max(128),
});

export type LoginRequestInput = z.infer<typeof LoginRequestSchema>;

