import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuditService {
  log(action: string, resource: string, details?: Record<string, unknown>): void {
    console.debug(`[Audit] ${action} on ${resource}`, details ?? '');
  }
}