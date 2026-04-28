import { Directive, input, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appRoleVisible]', standalone: true })
export class RoleVisibleDirective {
  private tpl = inject(TemplateRef);
  private vcr = inject(ViewContainerRef);

  appRoleVisible = input<string[]>([]);

  constructor() {
    effect(() => {
      const allowed = this.appRoleVisible();
      const userRole = this.getUserRole();
      this.vcr.clear();
      if (!allowed.length || allowed.includes(userRole)) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }

  private getUserRole(): string {
    try {
      const raw = localStorage.getItem('asiri_user');
      return raw ? JSON.parse(raw).role : '';
    } catch {
      return '';
    }
  }
}