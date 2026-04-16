import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  // ── CSV Export ────────────────────────────────────────────

  exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(header => {
          const value = row[header];
          const str = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma, quote or newline
          return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(filename + '.csv', csvContent, 'text/csv;charset=utf-8;');
  }

  // ── Excel Export (via ExcelJS — implemented in B23 polish) ──

  exportToExcel(filename: string, rows: Record<string, unknown>[], sheetName = 'Sheet1'): void {
    // Full ExcelJS implementation added in Batch 23
    // Fallback to CSV for now
    this.exportToCsv(filename, rows);
  }

  // ── PDF Export (via jsPDF — implemented in B23 polish) ──────

  exportToPdf(filename: string, title: string, rows: Record<string, unknown>[]): void {
    // Full jsPDF implementation added in Batch 23
    // Fallback to CSV for now
    this.exportToCsv(filename, rows);
  }

  // ── Helper ────────────────────────────────────────────────

  private downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL after download
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}