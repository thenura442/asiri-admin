import { Component, signal, inject, AfterViewInit, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ModalService } from '@shared/services/modal/modal.service';

type ChartPeriod = 'daily' | 'weekly' | 'monthly';
type RevPeriod   = 'month' | 'quarter' | 'year';

interface Stat { label: string; value: string; change: string; up: boolean; iconColor: string; bgColor: string; }

interface ExportCard { title: string; desc: string; color: string; bgColor: string; borderColor: string; }

interface TurnaroundRow { label: string; value: string; unit: string; total?: boolean; }

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private modal      = inject(ModalService);

  bookingPeriod = signal<ChartPeriod>('daily');
  revPeriod     = signal<RevPeriod>('month');
  dateLabel     = signal('Select date range...');

  stats: Stat[] = [
    { label: 'Total Bookings',    value: '2,847',    change: '+12%', up: true,  iconColor: 'var(--sbl)', bgColor: 'var(--sblb)', borderColor: 'rgba(59,130,246,.1)' } as any,
    { label: 'Completed Jobs',    value: '2,614',    change: '+8%',  up: true,  iconColor: 'var(--sg)',  bgColor: 'var(--sgb)',  borderColor: 'rgba(16,185,129,.1)'  } as any,
    { label: 'Cancelled',         value: '233',      change: '-3%',  up: false, iconColor: 'var(--sr)',  bgColor: 'var(--srb)',  borderColor: 'rgba(239,68,68,.1)'   } as any,
    { label: 'Revenue Generated', value: 'Rs. 4.2M', change: '+18%', up: true,  iconColor: 'var(--sa)',  bgColor: 'var(--sab)',  borderColor: 'rgba(234,179,8,.1)'   } as any,
  ];

  exportCards: ExportCard[] = [
    { title: 'Export as CSV',   desc: 'Download raw booking data for spreadsheet analysis',   color: 'var(--sg)',  bgColor: 'var(--sgb)',  borderColor: 'rgba(16,185,129,.1)'  },
    { title: 'Export as PDF',   desc: 'Generate a formatted report for management review',    color: 'var(--sr)',  bgColor: 'var(--srb)',  borderColor: 'rgba(239,68,68,.1)'   },
    { title: 'Export as Excel', desc: 'Full data export with charts and pivot tables',        color: 'var(--sbl)', bgColor: 'var(--sblb)', borderColor: 'rgba(59,130,246,.1)'  },
  ];

  turnaround: TurnaroundRow[] = [
    { label: 'Sample Collection',  value: '28',  unit: 'min' },
    { label: 'Transport to Lab',   value: '45',  unit: 'min' },
    { label: 'Lab Processing',     value: '3.2', unit: 'hrs' },
    { label: 'Report Delivery',    value: '15',  unit: 'min' },
    { label: 'Total End-to-End',   value: '4.7', unit: 'hrs', total: true },
  ];

  // Booking chart data
  private bookingData: Record<ChartPeriod, { labels: string[]; completed: number[]; cancelled: number[] }> = {
    daily:   { labels: ['Oct 1','Oct 5','Oct 9','Oct 13','Oct 17','Oct 21','Oct 25','Oct 29'], completed: [78,92,88,105,95,112,108,120], cancelled: [8,6,10,7,12,5,9,6] },
    weekly:  { labels: ['W1','W2','W3','W4','W5','W6','W7','W8'],                             completed: [420,512,498,603,551,634,598,720], cancelled: [40,36,54,37,60,25,45,30] },
    monthly: { labels: ['May','Jun','Jul','Aug','Sep','Oct'],                                   completed: [1820,2010,2190,2340,2510,2614], cancelled: [180,170,210,180,230,233] },
  };

  private bookingChart: any;
  private revenueChart: any;
  private completionChart: any;
  private testsChart: any;
  private branchChart: any;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Dynamic import of Chart.js to avoid SSR issues
    import('chart.js/auto').then(({ Chart }) => {
      this.initBookingChart(Chart);
      this.initCompletionChart(Chart);
      this.initTestsChart(Chart);
      this.initRevenueChart(Chart);
      this.initBranchChart(Chart);
    }).catch(() => {
      // Chart.js not available — charts render as placeholder skeletons
    });
  }

  private chartDefaults() {
    return {
      font: { family: 'Plus Jakarta Sans', weight: '500' },
      gridColor: 'rgba(0,43,76,.04)',
      tickColor: '#94a7b8'
    };
  }

  private initBookingChart(Chart: any): void {
    const el = document.getElementById('bookingChart') as HTMLCanvasElement;
    if (!el) return;
    const { font, gridColor, tickColor } = this.chartDefaults();
    const d = this.bookingData.daily;
    this.bookingChart = new Chart(el, {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: [
          { label: 'Completed', data: d.completed, borderColor: '#3FBCB9', backgroundColor: 'rgba(63,188,185,.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: '#3FBCB9', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2 },
          { label: 'Cancelled', data: d.cancelled, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: '#ef4444', borderDash: [4,4] },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: { legend: { display: true, position: 'top', align: 'end', labels: { font: { ...font, size: 12 }, color: tickColor, usePointStyle: true, pointStyle: 'circle', padding: 20, boxWidth: 8 } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { ...font, size: 11 }, color: tickColor, maxRotation: 0 }, border: { display: false } },
          y: { grid: { color: gridColor }, ticks: { font: { ...font, size: 11 }, color: tickColor, padding: 8 }, border: { display: false }, beginAtZero: true }
        }
      }
    });
  }

  private initCompletionChart(Chart: any): void {
    const el = document.getElementById('completionChart') as HTMLCanvasElement;
    if (!el) return;
    const { font, tickColor } = this.chartDefaults();
    this.completionChart = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Cancelled', 'In Progress'],
        datasets: [{ data: [91.8, 5.2, 3], backgroundColor: ['#3FBCB9', '#ef4444', '#002B4C'], borderWidth: 0, borderRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: {
          legend: { display: true, position: 'bottom', labels: { font: { ...font, size: 12 }, color: tickColor, usePointStyle: true, pointStyle: 'circle', padding: 16, boxWidth: 8 } },
          tooltip: { callbacks: { label: (c: any) => c.label + ': ' + c.parsed + '%' } }
        }
      }
    });
  }

  private initTestsChart(Chart: any): void {
    const el = document.getElementById('testsChart') as HTMLCanvasElement;
    if (!el) return;
    const { font, gridColor, tickColor } = this.chartDefaults();
    this.testsChart = new Chart(el, {
      type: 'bar',
      data: {
        labels: ['Full Blood Count', 'Lipid Profile', 'FBS', 'HBA1C', 'Thyroid Panel', 'Urine FR'],
        datasets: [{ data: [420, 380, 310, 280, 190, 150], backgroundColor: 'rgba(0,43,76,.08)', hoverBackgroundColor: '#3FBCB9', borderRadius: 6, borderSkipped: false, barThickness: 24 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { font: { ...font, size: 11 }, color: tickColor }, border: { display: false }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { font: { ...font, size: 12 }, color: '#3d5a73' }, border: { display: false } }
        }
      }
    });
  }

  private initRevenueChart(Chart: any): void {
    const el = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!el) return;
    const { font, gridColor, tickColor } = this.chartDefaults();
    this.revenueChart = new Chart(el, {
      type: 'bar',
      data: {
        labels: ['Asiri Central', 'Asiri Surgical', 'Colombo 03', 'Nugegoda', 'Dehiwala', 'Kandy', 'Matara'],
        datasets: [{
          label: 'Revenue (Rs.)',
          data: [1250000, 980000, 720000, 540000, 380000, 210000, 120000],
          backgroundColor: ['rgba(63,188,185,.8)','rgba(63,188,185,.65)','rgba(63,188,185,.5)','rgba(63,188,185,.4)','rgba(63,188,185,.3)','rgba(63,188,185,.22)','rgba(63,188,185,.15)'],
          borderRadius: 8, borderSkipped: false, barThickness: 36
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => 'Rs. ' + (c.parsed.y / 1000).toFixed(0) + 'K' } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { ...font, size: 11 }, color: tickColor, maxRotation: 30 }, border: { display: false } },
          y: { grid: { color: gridColor }, ticks: { font: { ...font, size: 11 }, color: tickColor, padding: 8, callback: (v: number) => 'Rs. ' + (v / 1000000).toFixed(1) + 'M' }, border: { display: false }, beginAtZero: true }
        }
      }
    });
  }

  private initBranchChart(Chart: any): void {
    const el = document.getElementById('branchChart') as HTMLCanvasElement;
    if (!el) return;
    const { font, gridColor, tickColor } = this.chartDefaults();
    this.branchChart = new Chart(el, {
      type: 'radar',
      data: {
        labels: ['Speed', 'Quality', 'Volume', 'Satisfaction', 'Efficiency'],
        datasets: [
          { label: 'Asiri Central', data: [85,92,95,88,80], borderColor: '#3FBCB9', backgroundColor: 'rgba(63,188,185,.12)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#3FBCB9' },
          { label: 'Colombo 03',    data: [90,78,70,85,92], borderColor: '#002B4C', backgroundColor: 'rgba(0,43,76,.06)',   borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#002B4C' },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'bottom', labels: { font: { ...font, size: 11 }, color: tickColor, usePointStyle: true, pointStyle: 'circle', padding: 16, boxWidth: 8 } } },
        scales: { r: { grid: { color: gridColor }, ticks: { display: false }, pointLabels: { font: { ...font, size: 11 }, color: '#3d5a73' } } }
      }
    });
  }

  switchBookingPeriod(p: ChartPeriod): void {
    this.bookingPeriod.set(p);
    if (!this.bookingChart) return;
    const d = this.bookingData[p];
    this.bookingChart.data.labels = d.labels;
    this.bookingChart.data.datasets[0].data = d.completed;
    this.bookingChart.data.datasets[1].data = d.cancelled;
    this.bookingChart.update();
  }

  exportData(format: string): void {
    this.modal.success(`Exporting data as ${format}...`);
  }
}