"use client";

import type { Convocazione } from "@/lib/convocazioni";
import { BAGGAGE_DISCLAIMER, PARKING_URL } from "@/lib/convocazioni";

/**
 * Azioni della pagina convocazione: scarica un PDF brandizzato e torna al
 * piano viaggi. Client component: il PDF è generato lato browser con jsPDF
 * (import dinamico, così non pesa sul bundle iniziale).
 */
export function ConvocazioneActions({
  conv,
  filename,
  backHref,
}: {
  conv: Convocazione;
  filename: string;
  backHref: string;
}) {
  async function handleDownload() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 48;
    const contentW = pageW - marginX * 2;

    // Palette brand Sistemi
    const RED: [number, number, number] = [194, 14, 26];
    const INK: [number, number, number] = [26, 26, 26];
    const GRAY: [number, number, number] = [120, 120, 128];
    const MIST: [number, number, number] = [244, 244, 245];

    // I font standard di jsPDF non hanno la freccia unicode né il trattino
    // lungo: li normalizziamo in ASCII per evitare glifi mancanti.
    const clean = (s: string) => s.replace(/→/g, "->").replace(/–/g, "-");

    let y = 128;

    const pageBreak = (needed: number) => {
      if (y + needed > pageH - 48) {
        doc.addPage();
        y = 60;
      }
    };

    // Paragrafo con grassetto inline sugli orari (HH:MM), a capo automatico.
    const drawRich = (
      segments: { text: string; bold: boolean }[],
      size: number,
      lineH: number,
      color: [number, number, number]
    ) => {
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      pageBreak(lineH);
      let cx = marginX;
      let atLineStart = true;
      for (const seg of segments) {
        const tokens = seg.text.match(/\s+|\S+/g) || [];
        for (const tok of tokens) {
          const isSpace = /^\s+$/.test(tok);
          doc.setFont("helvetica", seg.bold ? "bold" : "normal");
          const w = doc.getTextWidth(tok);
          if (isSpace) {
            if (!atLineStart) cx += w;
            continue;
          }
          if (!atLineStart && cx + w > marginX + contentW) {
            cx = marginX;
            y += lineH;
            atLineStart = true;
            if (y > pageH - 48) {
              doc.addPage();
              y = 60;
            }
          }
          doc.text(tok, cx, y);
          cx += w;
          atLineStart = false;
        }
      }
      y += lineH;
    };

    // Spezza un testo bolando i token orario.
    const timeSeg = (s: string) =>
      clean(s)
        .split(/(\d{1,2}[:.]\d{2})/g)
        .filter((p) => p !== "")
        .map((p) => ({ text: p, bold: /^\d{1,2}[:.]\d{2}$/.test(p) }));

    const plain = (s: string) => [{ text: clean(s), bold: false }];

    const heading = (label: string) => {
      pageBreak(24);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text(label.toUpperCase(), marginX, y);
      y += 15;
    };

    // --- Fascia intestazione ---
    doc.setFillColor(RED[0], RED[1], RED[2]);
    doc.rect(0, 0, pageW, 92, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("SISTEMI 50 - #Parigi 20-23 settembre 2026", marginX, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("LA TUA CONVOCAZIONE", marginX, 68);

    // Logo Sistemi nella fascia (angolo destro). Se non è raggiungibile, il
    // PDF viene comunque generato senza logo.
    try {
      const res = await fetch("/brand/logo.png");
      const blob = await res.blob();
      const logo: string = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      const size = 56;
      doc.addImage(logo, "PNG", pageW - marginX - size, (92 - size) / 2, size, size);
    } catch {
      /* logo non disponibile: nessun blocco alla generazione del PDF */
    }

    // --- Data (sopra a tutto l'operativo) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(RED[0], RED[1], RED[2]);
    doc.text(clean(conv.dateLabel), marginX, y);
    y += 24;

    // --- Ritrovo / hotel ---
    if (conv.hotel?.length) {
      heading("Ritrovo");
      for (const line of conv.hotel) drawRich(plain(line), 11, 15, INK);
    }

    // --- Volo ---
    if (conv.flights?.length) {
      heading(conv.flightsLabel ?? "Volo");
      for (const f of conv.flights) drawRich(timeSeg(f), 11, 15, INK);
    }

    // --- Convocazione (orari in grassetto) ---
    if (conv.call?.length) {
      heading("Convocazione");
      for (const line of conv.call) drawRich(timeSeg(line), 11, 15, INK);
    }

    // --- Franchigia bagaglio ---
    if (conv.baggage?.length) {
      heading(conv.baggageLabel ?? "Franchigia bagaglio");
      for (const b of conv.baggage) drawRich(plain("- " + b), 11, 15, INK);
    }

    // --- Clausola obbligatoria (box) ---
    y += 8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const discLines: string[] = doc.splitTextToSize(
      clean(BAGGAGE_DISCLAIMER),
      contentW - 24
    );
    const boxH = discLines.length * 12 + 20;
    pageBreak(boxH);
    doc.setFillColor(MIST[0], MIST[1], MIST[2]);
    doc.roundedRect(marginX, y, contentW, boxH, 6, 6, "F");
    doc.setTextColor(90, 90, 96);
    doc.text(discLines, marginX + 12, y + 16);
    y += boxH + 6;

    // --- Parcheggio ---
    if (conv.parking) {
      heading("Parcheggio");
      drawRich(
        plain(
          "Se desideri prenotare un posto auto a prezzi convenzionati, prenota al link dedicato:"
        ),
        11,
        15,
        INK
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(RED[0], RED[1], RED[2]);
      pageBreak(14);
      doc.textWithLink(PARKING_URL, marginX, y, { url: PARKING_URL });
      y += 16;
    }

    // --- Note finali (in grassetto) ---
    if (conv.notes?.length) {
      y += 6;
      drawRich([{ text: clean(conv.notes.join(" ")), bold: true }], 10, 14, INK);
    }

    doc.save(filename);
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
        Scarica la convocazione (PDF)
      </button>
    </div>
  );
}
