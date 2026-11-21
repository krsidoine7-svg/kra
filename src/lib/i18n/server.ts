import "server-only";
import { cookies } from "next/headers";
import {
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/dictionary";

/**
 * Lit la langue active côté serveur (`?lang=en|fr` prioritaire, sinon cookie `kra_locale`).
 */
export async function getServerLocale(searchParamLang?: string): Promise<Locale> {
  if (searchParamLang === "en" || searchParamLang === "fr") {
    return searchParamLang;
  }

  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    return normalizeLocale(rawCookie);
  } catch {
    return "fr";
  }
}

