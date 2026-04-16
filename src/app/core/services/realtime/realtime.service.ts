import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { JobRequest } from '../../models/job-request.model';
import { Notification } from '../../models/notification.model';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private supabaseService = inject(SupabaseService);

  jobUpdated$       = new Subject<JobRequest>();
  newNotification$  = new Subject<Notification>();
  escalationAlert$  = new Subject<unknown>();
  vehicleUpdated$   = new Subject<unknown>();
  branchUpdated$    = new Subject<unknown>();

  private channels: ReturnType<typeof this.supabaseService.supabase.channel>[] = [];

  initJobSubscription(): void {
    const channel = this.supabaseService.realtime
      .channel('job-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_requests' },
        (payload) => { this.jobUpdated$.next(payload.new as JobRequest); }
      )
      .subscribe();
    this.channels.push(channel);
  }

  initNotificationSubscription(userId: string): void {
    const channel = this.supabaseService.realtime
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => { this.newNotification$.next(payload.new as Notification); }
      )
      .subscribe();
    this.channels.push(channel);
  }

  initEscalationSubscription(): void {
    const channel = this.supabaseService.realtime
      .channel('escalations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'escalations' },
        (payload) => { this.escalationAlert$.next(payload.new); }
      )
      .subscribe();
    this.channels.push(channel);
  }

  initVehicleSubscription(): void {
    const channel = this.supabaseService.realtime
      .channel('vehicles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vehicles' },
        (payload) => { this.vehicleUpdated$.next(payload.new); }
      )
      .subscribe();
    this.channels.push(channel);
  }

  initBranchSubscription(): void {
    const channel = this.supabaseService.realtime
      .channel('branches')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'branches' },
        (payload) => { this.branchUpdated$.next(payload.new); }
      )
      .subscribe();
    this.channels.push(channel);
  }

  unsubscribeAll(): void {
    this.channels.forEach(channel => {
      this.supabaseService.supabase.removeChannel(channel);
    });
    this.channels = [];
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }
}