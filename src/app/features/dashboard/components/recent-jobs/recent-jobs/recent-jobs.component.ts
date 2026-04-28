import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardRecentJob } from '../../../services/dashboard/dashboard.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago/time-ago.pipe';

@Component({
  selector: 'app-recent-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  templateUrl: './recent-jobs.component.html',
  styleUrl: './recent-jobs.component.scss'
})
export class RecentJobsComponent {
  jobs = input<DashboardRecentJob[]>([]);

  statusStyle(status: string): { background: string; color: string } {
    const map: Record<string, { background: string; color: string }> = {
      pending:   { background: 'var(--sab)', color: 'var(--sat)' },
      en_route:  { background: 'var(--sbb)', color: 'var(--sbt)' },
      allocated: { background: 'var(--accent-gl)', color: 'var(--accent-d)' },
      completed: { background: 'var(--sgb)', color: 'var(--sgt)' },
      cancelled: { background: 'var(--srb)', color: 'var(--srt)' },
    };
    return map[status] ?? { background: 'var(--b1)', color: 'var(--t4)' };
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      pending: 'Pending', en_route: 'En Route', allocated: 'Allocated',
      completed: 'Completed', cancelled: 'Cancelled', dispatched: 'Dispatched'
    };
    return m[status] ?? status;
  }
}