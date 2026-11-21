import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getServerLocale } from "@/lib/i18n/server";

export default async function NotFoundPage() {
  const locale = await getServerLocale();
  const t = getDictionary(locale).notFound;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center bg-[#FFFFFF] px-4 py-16 md:px-8">
      <p className="font-mono-tech text-xs uppercase tracking-[0.06em] text-[#0F2942]">
        {t.eyebrow}
      </p>
      <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.03em] text-[#111111] md:text-5xl">
        {t.heading}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[#525252]">
        {t.description}
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#0F2942] px-5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#183D61]"
        >
          {t.backHome}
        </Link>
      </div>
    </main>
  );
}

