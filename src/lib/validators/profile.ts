import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().min(1, "Nom requis.").max(80),
  email: z.string().trim().email("Adresse e-mail invalide.").max(255),
  phone: z
    .string()
    .trim()
    .max(30, "Numéro de téléphone trop long.")
    .optional()
    .default(""),
  recoveryEmail: z
    .union([z.string().trim().email("E-mail de secours invalide.").max(255), z.literal("")])
    .optional()
    .default(""),
});

export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Mot de passe actuel requis.").max(128),
    newPassword: z
      .string()
      .min(10, "Le nouveau mot de passe doit contenir au moins 10 caractères.")
      .max(128)
      .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
      .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
      .regex(/[0-9]/, "Ajoutez au moins un chiffre."),
    confirmPassword: z.string().min(1, "Confirmation requise.").max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les nouveaux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const DELETE_ACCOUNT_PHRASE = "SUPPRIMER MON COMPTE";

export const DeleteAccountSchema = z.object({
  currentPassword: z.string().min(8, "Mot de passe actuel requis.").max(128),
  confirmationText: z
    .string()
    .trim()
    .refine((val) => val === DELETE_ACCOUNT_PHRASE, {
      message: `Saisissez exactement « ${DELETE_ACCOUNT_PHRASE} ».`,
    }),
  mode: z.enum(["soft_delete", "purge"]).default("soft_delete"),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>;

