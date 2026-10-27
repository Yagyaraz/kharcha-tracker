"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";
import { format } from "date-fns";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import clsx from "clsx";

interface ExportButtonProps {
  expenses: Expense[];        // the already-filtered list
  summary: {
    filteredYagya: number;
    filteredRamesh: number;
    filteredTotal: number;
    yagyaPct: number;
    rameshPct: number;
    settlement: number;
    yagyaOwes: boolean;
  };
  fromDate?: string;
  toDate?: string;
}

/* ─────────────── helpers ─────────────── */

/** Load an image URL as a base64 data-URI (bypasses cross-origin via a canvas proxy) */
async function urlToDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function settlementText(s: ExportButtonProps["summary"]): string {
  if (s.filteredTotal === 0) return "No expenses";
  if (s.settlement < 1) return "All settled up ✓";
  const amt = s.settlement.toLocaleString("en-NP", { maximumFractionDigits: 2 });
  return s.yagyaOwes
    ? `Yagya pays Ramesh  Rs.${amt}`
    : `Ramesh pays Yagya  Rs.${amt}`;
}

/* ─────────────── Excel export ─────────────── */

async function exportExcel(
  expenses: Expense[],
  summary: ExportButtonProps["summary"],
  fromDate?: string,
  toDate?: string
) {
  const { utils, writeFile } = await import("xlsx");

  // Sheet 1 – Expense list
  const listRows = expenses.map((e, i) => ({
    "#": i + 1,
    Date: format(new Date(e.date), "MMM d, yyyy"),
    Title: e.title,
    "Amount (Rs.)": Number(e.amount),
    "Spent By": e.spend_by,
    Edited: e.is_edited ? "Yes" : "No",
    "Edit Reason": e.edit_reason || "",
    "Receipt URL": e.photo_url || "",
  }));

  const ws1 = utils.json_to_sheet(listRows);
  // Column widths
  ws1["!cols"] = [
    { wch: 4 }, { wch: 14 }, { wch: 36 }, { wch: 14 },
    { wch: 12 }, { wch: 8 }, { wch: 30 }, { wch: 60 },
  ];

  // Sheet 2 – Summary
  const dateRange =
    fromDate || toDate
      ? `${fromDate || "start"} → ${toDate || "today"}`
      : "All time";
  const summaryRows = [
    { Metric: "Date Range", Value: dateRange },
    { Metric: "Total Expenses", Value: expenses.length },
    { Metric: "Grand Total (Rs.)", Value: summary.filteredTotal },
    { Metric: "Yagya Total (Rs.)", Value: summary.filteredYagya },
    { Metric: "Ramesh Total (Rs.)", Value: summary.filteredRamesh },
    { Metric: "Yagya Share (%)", Value: summary.yagyaPct },
    { Metric: "Ramesh Share (%)", Value: summary.rameshPct },
    { Metric: "50/50 Settlement", Value: settlementText(summary) },
  ];
  const ws2 = utils.json_to_sheet(summaryRows);
  ws2["!cols"] = [{ wch: 24 }, { wch: 40 }];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws1, "Expenses");
  utils.book_append_sheet(wb, ws2, "Summary");

  const fileName = `kharcha-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  writeFile(wb, fileName);
}

/* ─────────────── PDF export ─────────────── */

async function exportPdf(
  expenses: Expense[],
  summary: ExportButtonProps["summary"],
  fromDate?: string,
  toDate?: string
) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210; // A4 width mm
  const MARGIN = 14;
  const CW = PW - MARGIN * 2; // content width
  let y = 14;

  const colors = {
    primary: [37, 99, 235] as [number, number, number],     // blue-600
    yagya:   [79, 70, 229] as [number, number, number],     // indigo-600
    ramesh:  [16, 185, 129] as [number, number, number],    // emerald-500
    amber:   [217, 119, 6] as [number, number, number],     // amber-600
    text:    [30, 41, 59] as [number, number, number],      // slate-800
    muted:   [100, 116, 139] as [number, number, number],   // slate-500
    border:  [226, 232, 240] as [number, number, number],   // slate-200
    bg:      [248, 250, 252] as [number, number, number],   // slate-50
  };

  const addPage = () => {
    doc.addPage();
    y = 14;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > 282) addPage();
  };

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, PW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Kharcha Tracker – Expense Report", MARGIN, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateRange =
    fromDate || toDate
      ? `Period: ${fromDate || "start"} → ${toDate || "today"}`
      : "Period: All time";
  doc.text(
    `${dateRange}    |    Exported: ${format(new Date(), "MMM d, yyyy HH:mm")}`,
    MARGIN,
    20
  );
  y = 36;

  // ── Investment Summary cards ─────────────────────────────────────────────
  doc.setTextColor(...colors.text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Investment Summary", MARGIN, y);
  y += 6;

  const cardW = (CW - 6) / 3;
  const cardH = 28;

  const drawSummaryCard = (
    x: number,
    label: string,
    value: string,
    sub: string,
    color: [number, number, number]
  ) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(label, x + 4, y + 6);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + 4, y + 16);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(sub, x + 4, y + 23);
  };

  drawSummaryCard(
    MARGIN,
    "YAGYA",
    `Rs.${summary.filteredYagya.toLocaleString()}`,
    `${summary.yagyaPct}% of total`,
    colors.yagya
  );
  drawSummaryCard(
    MARGIN + cardW + 3,
    "RAMESH",
    `Rs.${summary.filteredRamesh.toLocaleString()}`,
    `${summary.rameshPct}% of total`,
    colors.ramesh
  );
  drawSummaryCard(
    MARGIN + (cardW + 3) * 2,
    "50/50 SETTLEMENT",
    summary.settlement < 1
      ? "Settled \u2713"
      : `Rs.${summary.settlement.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    summary.settlement < 1 ? "" : (summary.yagyaOwes ? "Yagya \u2192 Ramesh" : "Ramesh \u2192 Yagya"),
    colors.amber
  );
  y += cardH + 4;

  // ── Grand total line ─────────────────────────────────────────────────────
  doc.setFillColor(...colors.bg);
  doc.rect(MARGIN, y, CW, 8, "F");
  doc.setDrawColor(...colors.border);
  doc.rect(MARGIN, y, CW, 8, "S");
  doc.setTextColor(...colors.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Grand Total: Rs.${summary.filteredTotal.toLocaleString()}  |  ${expenses.length} expense(s)`, MARGIN + 3, y + 5.5);
  y += 12;

  // ── Table header ─────────────────────────────────────────────────────────
  const COL = {
    no:      { x: MARGIN,           w: 8 },
    date:    { x: MARGIN + 8,       w: 22 },
    title:   { x: MARGIN + 30,      w: 60 },
    amount:  { x: MARGIN + 90,      w: 26 },
    spender: { x: MARGIN + 116,     w: 22 },
    edited:  { x: MARGIN + 138,     w: 14 },
    img:     { x: MARGIN + 152,     w: 30 },
  };
  const ROW_H = 7;

  const drawTableHeader = () => {
    doc.setFillColor(...colors.primary);
    doc.rect(MARGIN, y, CW, ROW_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const hy = y + 5;
    doc.text("#",       COL.no.x + 1,      hy);
    doc.text("Date",    COL.date.x + 1,    hy);
    doc.text("Title",   COL.title.x + 1,   hy);
    doc.text("Amount",  COL.amount.x + 1,  hy);
    doc.text("By",      COL.spender.x + 1, hy);
    doc.text("Edited",  COL.edited.x + 1,  hy);
    doc.text("Receipt", COL.img.x + 1,     hy);
    y += ROW_H;
  };

  drawTableHeader();

  // ── Expense rows ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");

  for (let i = 0; i < expenses.length; i++) {
    const exp = expenses[i];
    const isEven = i % 2 === 0;

    // How tall is this row? If it has a photo, taller.
    let imgDataUri: string | null = null;
    if (exp.photo_url) {
      imgDataUri = await urlToDataUri(exp.photo_url);
    }
    const IMG_H = imgDataUri ? 24 : 0;
    const rowH = Math.max(ROW_H, IMG_H + 4);

    ensureSpace(rowH + 2);

    // Re-draw header if we just added a page
    if (y === 14) drawTableHeader();

    // Row background
    if (isEven) {
      doc.setFillColor(...colors.bg);
      doc.rect(MARGIN, y, CW, rowH, "F");
    }
    doc.setDrawColor(...colors.border);
    doc.line(MARGIN, y + rowH, MARGIN + CW, y + rowH);

    doc.setTextColor(...colors.text);
    doc.setFontSize(7.5);
    const ty = y + 5;

    doc.text(String(i + 1), COL.no.x + 1, ty);
    doc.text(format(new Date(exp.date), "MMM d, yyyy"), COL.date.x + 1, ty);

    // Truncate long titles
    const titleLines = doc.splitTextToSize(exp.title, COL.title.w - 2);
    doc.text(titleLines.slice(0, 2), COL.title.x + 1, ty);

    doc.setFont("helvetica", "bold");
    doc.text(`Rs.${Number(exp.amount).toLocaleString()}`, COL.amount.x + 1, ty);
    doc.setFont("helvetica", "normal");

    // Spender badge
    const spendColor = exp.spend_by === "Yagya" ? colors.yagya : colors.ramesh;
    doc.setFillColor(...spendColor);
    doc.roundedRect(COL.spender.x + 1, y + 2, 18, 4.5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text(exp.spend_by, COL.spender.x + 3, y + 5.5);
    doc.setTextColor(...colors.text);
    doc.setFontSize(7.5);

    if (exp.is_edited) {
      doc.setTextColor(...colors.amber);
      doc.setFontSize(6);
      doc.text("EDITED", COL.edited.x + 1, ty);
      doc.setTextColor(...colors.text);
      doc.setFontSize(7.5);
    }

    // Receipt image
    if (imgDataUri) {
      try {
        const imgW = COL.img.w - 2;
        const imgH = IMG_H;
        doc.addImage(imgDataUri, "JPEG", COL.img.x + 1, y + 2, imgW, imgH);
      } catch {
        doc.setTextColor(...colors.muted);
        doc.setFontSize(6);
        doc.text("(img error)", COL.img.x + 1, ty);
        doc.setFontSize(7.5);
        doc.setTextColor(...colors.text);
      }
    } else if (exp.photo_url) {
      doc.setTextColor(...colors.muted);
      doc.setFontSize(6);
      doc.text("(unavail.)", COL.img.x + 1, ty);
      doc.setFontSize(7.5);
      doc.setTextColor(...colors.text);
    }

    y += rowH + 1;
  }

  // ── Footer on each page ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPages = (doc as any).internal.getNumberOfPages() as number;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...colors.border);
    doc.line(MARGIN, 291, PW - MARGIN, 291);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.muted);
    doc.text("Kharcha Tracker", MARGIN, 296);
    doc.text(`Page ${p} of ${totalPages}`, PW - MARGIN, 296, { align: "right" });
  }

  const fileName = `kharcha-export-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

/* ─────────────── Component ─────────────── */

export function ExportButton({ expenses, summary, fromDate, toDate }: ExportButtonProps) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);
  const [open, setOpen] = useState(false);

  const handleExport = async (type: "excel" | "pdf") => {
    setLoading(type);
    setOpen(false);
    try {
      if (type === "excel") {
        await exportExcel(expenses, summary, fromDate, toDate);
      } else {
        await exportPdf(expenses, summary, fromDate, toDate);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isLoading || expenses.length === 0}
        className={clsx(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
          isLoading || expenses.length === 0
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30"
        )}
        title={expenses.length === 0 ? "No expenses to export" : "Export expenses"}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loading === "pdf" ? "Building PDF…" : "Building Excel…"}
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export ({expenses.length})
          </>
        )}
      </button>

      {open && !isLoading && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* dropdown */}
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500">Export {expenses.length} expense(s)</p>
            </div>
            <button
              onClick={() => handleExport("excel")}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Excel (.xlsx)</p>
                <p className="text-xs text-slate-400">Data + Summary sheet</p>
              </div>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-t border-slate-100 dark:border-slate-800"
            >
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/20">
                <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium">PDF (.pdf)</p>
                <p className="text-xs text-slate-400">Includes receipt images</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
