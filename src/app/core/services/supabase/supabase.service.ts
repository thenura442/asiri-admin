import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  // Auth helpers — these are the ONLY Supabase operations allowed on frontend
  get auth() {
    return this.client.auth;
  }

  // Realtime helpers
  get realtime() {
    return this.client;
  }

  // Storage helpers
  get storage() {
    return this.client.storage;
  }
}