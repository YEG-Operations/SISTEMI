"use client";

/**
 * Azioni della pagina convocazione: scarica il testo e torna al piano viaggi.
 * Client component: il download genera un file di testo lato browser.
 */
export function ConvocazioneActions({
  text,
  filename,
  backHref,
}: {
  text: string;
  filename: string;
  backHref: string;
}) {
  function handleDownload() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={backHref}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sistemi-red/30 bg-white px-5 py-3 text-sm font-semibold text-sistemi-red shadow-card transition hover:bg-sistemi-red/5"
      >
        <span aria-hidden>←</span>
        Torna al piano viaggi
      </a>
      <button
        type="button"
        onClick={handleDownload}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sistemi-red px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-sistemi-red-dark"
      >
        <span aria-hidden>⬇</span>
        Scarica la convocazione
      </button>
    </div>
  );
}
