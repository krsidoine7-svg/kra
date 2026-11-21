"use client";

import * as React from "react";
import { Check, LockKey, ShieldCheck, Trash, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DELETE_ACCOUNT_PHRASE } from "@/lib/validators/profile";

export interface ProfileFormInitialData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  recoveryEmail: string;
}

interface ProfileSettingsFormProps {
  initialProfile: ProfileFormInitialData;
}

export function ProfileSettingsForm({
  initialProfile,
}: ProfileSettingsFormProps) {
  const [firstName, setFirstName] = React.useState(initialProfile.firstName);
  const [lastName, setLastName] = React.useState(initialProfile.lastName);
  const [email, setEmail] = React.useState(initialProfile.email);
  const [phone, setPhone] = React.useState(initialProfile.phone);
  const [recoveryEmail, setRecoveryEmail] = React.useState(
    initialProfile.recoveryEmail
  );

  const [profileStatus, setProfileStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [savingProfile, setSavingProfile] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordStatus, setPasswordStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [savingPassword, setSavingPassword] = React.useState(false);

  const [deletePassword, setDeletePassword] = React.useState("");
  const [deletePhrase, setDeletePhrase] = React.useState("");
  const [deleteMode, setDeleteMode] = React.useState<"soft_delete" | "purge">(
    "soft_delete"
  );
  const [deleteStatus, setDeleteStatus] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingAccount, setDeletingAccount] = React.useState(false);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileStatus(null);
    setSavingProfile(true);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          recoveryEmail,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setProfileStatus({
          type: "error",
          message: data.error ?? "Impossible d'enregistrer le profil.",
        });
        return;
      }

      setProfileStatus({
        type: "success",
        message: "Informations personnelles enregistrées (téléphone chiffré AES-256-GCM).",
      });
    } catch {
      setProfileStatus({
        type: "error",
        message: "Erreur réseau. Vérifiez votre connexion.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "Les nouveaux mots de passe ne correspondent pas.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/admin/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setPasswordStatus({
          type: "error",
          message: data.error ?? "Échec de la mise à jour du mot de passe.",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({
        type: "success",
        message: "Mot de passe mis à jour. Les autres sessions ont été révoquées.",
      });
    } catch {
      setPasswordStatus({
        type: "error",
        message: "Erreur réseau. Réessayez.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleAccountDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteStatus(null);

    if (deletePhrase.trim() !== DELETE_ACCOUNT_PHRASE) {
      setDeleteStatus({
        type: "error",
        message: `Saisissez exactement « ${DELETE_ACCOUNT_PHRASE} ».`,
      });
      return;
    }

    setDeletingAccount(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: deletePassword,
          confirmationText: deletePhrase,
          mode: deleteMode,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !data.ok) {
        setDeleteStatus({
          type: "error",
          message: data.error ?? "Suppression impossible.",
        });
        return;
      }

      setDeleteStatus({
        type: "success",
        message: "Compte supprimé et sessions révoquées.",
      });
      if (typeof window !== "undefined" && data.redirectTo) {
        window.location.assign(data.redirectTo);
      }
    } catch {
      setDeleteStatus({
        type: "error",
        message: "Erreur réseau. Réessayez.",
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-[6px] border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-text)] focus:outline-none";

  return (
    <div className="space-y-8">
      {/* Section Identité & Coordonnées */}
      <section className="grid gap-6 border-b border-[var(--dash-border)] pb-8 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="text-base font-medium text-[var(--dash-text)]">
            Identité & Coordonnées
          </h2>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Vos informations administrateur. Le téléphone et l&apos;e-mail de secours sont chiffrés au repos en AES-256-GCM.
          </p>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
        >
          {profileStatus ? (
            <div
              role="status"
              className={
                profileStatus.type === "success"
                  ? "flex items-center gap-2 rounded-[6px] bg-[var(--p-green-bg)] px-3 py-2 text-sm text-[var(--p-green-fg)]"
                  : "rounded-[6px] bg-[var(--p-red-bg)] px-3 py-2 text-sm text-[var(--p-red-fg)]"
              }
            >
              {profileStatus.type === "success" ? (
                <Check size={16} weight="bold" aria-hidden="true" />
              ) : null}
              <span>{profileStatus.message}</span>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-firstname"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Prénom
              </label>
              <input
                id="profile-firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-lastname"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Nom
              </label>
              <input
                id="profile-lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Adresse e-mail de connexion
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-phone"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Téléphone (chiffré)
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-recovery"
              className="block text-sm font-medium text-[var(--dash-text)]"
            >
              E-mail de secours (chiffré, optionnel)
            </label>
            <input
              id="profile-recovery"
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="secours@exemple.ci"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? "Enregistrement..." : "Enregistrer le profil"}
            </Button>
          </div>
        </form>
      </section>

      {/* Section Mot de passe */}
      <section className="grid gap-6 border-b border-[var(--dash-border)] pb-8 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="text-base font-medium text-[var(--dash-text)]">
            Mot de passe
          </h2>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Haché avec bcrypt (coût 12). La modification déconnecte vos autres appareils.
          </p>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
        >
          {passwordStatus ? (
            <div
              role="status"
              className={
                passwordStatus.type === "success"
                  ? "flex items-center gap-2 rounded-[6px] bg-[var(--p-green-bg)] px-3 py-2 text-sm text-[var(--p-green-fg)]"
                  : "rounded-[6px] bg-[var(--p-red-bg)] px-3 py-2 text-sm text-[var(--p-red-fg)]"
              }
            >
              {passwordStatus.type === "success" ? (
                <ShieldCheck size={16} weight="bold" aria-hidden="true" />
              ) : null}
              <span>{passwordStatus.message}</span>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="pwd-current"
              className="block text-sm font-medium text-[var(--dash-text)]"
            >
              Mot de passe actuel
            </label>
            <input
              id="pwd-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="pwd-new"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Nouveau mot de passe
              </label>
              <input
                id="pwd-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={10}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pwd-confirm"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="pwd-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={10}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="outline" disabled={savingPassword}>
              <LockKey size={16} weight="bold" aria-hidden="true" />
              {savingPassword ? "Mise à jour..." : "Changer le mot de passe"}
            </Button>
          </div>
        </form>
      </section>

      {/* Section Destructive Suppression Compte (M2.1) */}
      <section className="grid gap-6 pb-8 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="text-base font-medium text-[var(--p-red-fg)]">
            Suppression du compte
          </h2>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Zone sensible. Exige le mot de passe actuel et la confirmation explicite avant archivage ou purge.
          </p>
        </div>

        <form
          onSubmit={handleAccountDelete}
          className="rounded-[8px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 space-y-4"
        >
          <div className="flex items-start gap-2.5 rounded-[6px] bg-[var(--p-red-bg)] p-3 text-xs text-[var(--p-red-fg)]">
            <Warning size={16} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Cette action révoque immédiatement toutes vos sessions administrateur actives.
            </span>
          </div>

          {deleteStatus ? (
            <div
              role="status"
              className={
                deleteStatus.type === "success"
                  ? "rounded-[6px] bg-[var(--p-green-bg)] px-3 py-2 text-sm text-[var(--p-green-fg)]"
                  : "rounded-[6px] bg-[var(--p-red-bg)] px-3 py-2 text-sm text-[var(--p-red-fg)]"
              }
            >
              {deleteStatus.message}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="delete-mode"
              className="block text-sm font-medium text-[var(--dash-text)]"
            >
              Mode de suppression
            </label>
            <select
              id="delete-mode"
              value={deleteMode}
              onChange={(e) =>
                setDeleteMode(
                  e.target.value === "purge" ? "purge" : "soft_delete"
                )
              }
              className={inputClass}
            >
              <option value="soft_delete">Archiver (Soft Delete récupérable)</option>
              <option value="purge">Purge définitive immédiate</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="delete-current-pwd"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Mot de passe actuel (vérification)
              </label>
              <input
                id="delete-current-pwd"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="delete-confirm-phrase"
                className="block text-sm font-medium text-[var(--dash-text)]"
              >
                Tapez {DELETE_ACCOUNT_PHRASE}
              </label>
              <input
                id="delete-confirm-phrase"
                type="text"
                value={deletePhrase}
                onChange={(e) => setDeletePhrase(e.target.value)}
                placeholder={DELETE_ACCOUNT_PHRASE}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              disabled={deletingAccount}
              className="border-[var(--p-red-fg)] text-[var(--p-red-fg)] hover:bg-[var(--p-red-bg)]"
            >
              <Trash size={16} weight="bold" aria-hidden="true" />
              {deletingAccount ? "Suppression..." : "Supprimer le compte"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

