import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ModalService {

  // ── Toast ─────────────────────────────────────────────────────────
  toasts = signal<ToastItem[]>([]);
  private toastCounter = 0;

  toast(opts: ToastOptions): void {
    const id = ++this.toastCounter;
    const item: ToastItem = { id, type: 'success', duration: 4000, ...opts };
    this.toasts.update(t => [...t, item]);
    setTimeout(() => this.dismissToast(id), item.duration);
  }

  success(message: string): void { this.toast({ message, type: 'success' }); }
  error(message: string): void   { this.toast({ message, type: 'error',   duration: 6000 }); }
  warning(message: string): void { this.toast({ message, type: 'warning' }); }
  info(message: string): void    { this.toast({ message, type: 'info' }); }

  dismissToast(id: number): void {
    this.toasts.update(t => t.filter(item => item.id !== id));
  }

  // ── Confirm Dialog ────────────────────────────────────────────────
  confirmOptions = signal<ConfirmOptions | null>(null);
  private confirmSubject: Subject<boolean> | null = null;

  confirm(opts: ConfirmOptions): Observable<boolean> {
    this.confirmOptions.set(opts);
    this.confirmSubject = new Subject<boolean>();
    return this.confirmSubject.asObservable();
  }

  resolveConfirm(result: boolean): void {
    this.confirmSubject?.next(result);
    this.confirmSubject?.complete();
    this.confirmSubject = null;
    this.confirmOptions.set(null);
  }
}