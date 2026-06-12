import Image from "next/image";

/** Intestazione brandizzata Sistemi 50 (rosso, logo "50 anni di futuro digitale"). */
export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="bg-sistemi-red text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-5 py-7 text-center">
        <Image
          src="/brand/logo.png"
          alt="Sistemi 50 — 50 anni di futuro digitale"
          width={104}
          height={104}
          priority
          className="h-24 w-24 rounded-2xl"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            #Parigi · 20-23 settembre 2026
          </p>
          {subtitle ? (
            <h1 className="mt-1 text-lg font-bold sm:text-xl">{subtitle}</h1>
          ) : null}
        </div>
      </div>
    </header>
  );
}
