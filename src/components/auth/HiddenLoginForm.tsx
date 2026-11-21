"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeSlash,
  LockSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface HiddenLoginFormProps {
  redirectPath: string;
}

export function HiddenLoginForm({ redirectPath }: HiddenLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || password.length < 8) {
      setErrorMessage("Renseignez un e-mail valide et un mot de passe d'au moins 8 caractères.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setErrorMessage(data.error ?? "Connexion refusée.");
        return;
      }

      router.replace(redirectPath);
      router.refresh();
    } catch {
      setErrorMessage("Connexion réseau impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-[6px] border border-[#9F2F2D] bg-[#FFEDEA] px-3.5 py-2.5 text-sm text-[#9F2F2D]"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="studio-email"
          className="block text-sm font-medium text-[#111111]"
        >
          Adresse e-mail
        </label>
        <input
          id="studio-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@manukra.ci"
          className="h-11 w-full rounded-[6px] border border-[#D4D4D4] bg-[#FFFFFF] px-3.5 text-sm text-[#111111] placeholder:text-[#6B6B6B] focus:border-[#111111] focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="studio-password"
          className="block text-sm font-medium text-[#111111]"
        >
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="studio-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-[6px] border border-[#D4D4D4] bg-[#FFFFFF] pl-3.5 pr-11 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
          />
          <button
            type="button"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[#525252] hover:text-[#111111]"
          >
            {showPassword ? (
              <EyeSlash size={18} weight="bold" aria-hidden="true" />
            ) : (
              <Eye size={18} weight="bold" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full justify-between px-4"
      >
        <span className="inline-flex items-center gap-2">
          <LockSimple size={16} weight="bold" aria-hidden="true" />
          {isSubmitting ? "Vérification..." : "Accéder au Studio"}
        </span>
        <ArrowRight size={16} weight="bold" aria-hidden="true" />
      </Button>
    </form>
  );
}

