import { Injectable, inject } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../supabase/supabase.service';
import { APP } from '../../constants/app.constants';

export type StorageBucket = 'avatars' | 'prescriptions' | 'reports' | 'documents';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabaseService = inject(SupabaseService);

  uploadFile(bucket: StorageBucket, path: string, file: File): Observable<string> {
    if (file.size > APP.MAX_FILE_SIZE_BYTES) {
      return throwError(() => new Error(`File size exceeds ${APP.MAX_FILE_SIZE_MB}MB limit`));
    }

    return from(
      this.supabaseService.storage
        .from(bucket)
        .upload(path, file, { upsert: true })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) return throwError(() => error);
        return from(
          Promise.resolve(
            this.supabaseService.storage
              .from(bucket)
              .getPublicUrl(data.path).data.publicUrl
          )
        );
      })
    );
  }

  deleteFile(bucket: StorageBucket, path: string): Observable<void> {
    return from(
      this.supabaseService.storage.from(bucket).remove([path])
    ).pipe(
      switchMap(({ error }) => {
        if (error) return throwError(() => error);
        return from(Promise.resolve(undefined));
      })
    );
  }

  getPublicUrl(bucket: StorageBucket, path: string): string {
    return this.supabaseService.storage
      .from(bucket)
      .getPublicUrl(path).data.publicUrl;
  }
}