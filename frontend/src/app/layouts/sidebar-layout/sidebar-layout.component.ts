import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type DashboardArea = 'producer' | 'admin';

interface SidebarLink {
  label: string;
  route: string;
  icon: 'dashboard' | 'marketplace' | 'sensors' | 'users';
}

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream md:flex">
      <aside class="bg-wine-dark text-white md:min-h-screen md:w-64 md:shrink-0">
        <div class="flex items-center gap-3 border-b border-white/15 px-6 py-5">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 4c-7 0-13 3-13 9a5 5 0 0 0 5 5c6 0 8-7 8-14Z" />
              <path d="M4 21c2-5 5-8 10-11" />
            </svg>
          </span>
          <span class="font-serif text-lg font-bold">BioConversion</span>
        </div>

        <nav aria-label="Navigation principale" class="flex gap-2 overflow-x-auto p-3 md:block md:space-y-2 md:p-4">
          <a *ngFor="let link of links"
             [routerLink]="link.route"
             routerLinkActive="bg-white/15 text-white"
             [routerLinkActiveOptions]="{ exact: true }"
             class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white">
            <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor"
                 stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <ng-container [ngSwitch]="link.icon">
                <ng-container *ngSwitchCase="'dashboard'">
                  <rect x="3" y="3" width="8" height="8" rx="1" />
                  <rect x="13" y="3" width="8" height="5" rx="1" />
                  <rect x="13" y="10" width="8" height="11" rx="1" />
                  <rect x="3" y="13" width="8" height="8" rx="1" />
                </ng-container>
                <ng-container *ngSwitchCase="'marketplace'">
                  <path d="M3 10h18l-2-6H5l-2 6Z" />
                  <path d="M5 10v10h14V10M9 20v-6h6v6" />
                </ng-container>
                <ng-container *ngSwitchCase="'sensors'">
                  <path d="M12 18v3m-4-3a6 6 0 0 1 8 0m-11-3a10 10 0 0 1 14 0m-17-4a14 14 0 0 1 20 0" />
                  <circle cx="12" cy="20" r="1" />
                </ng-container>
                <ng-container *ngSwitchCase="'users'">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </ng-container>
              </ng-container>
            </svg>
            <span>{{ link.label }}</span>
          </a>
        </nav>
      </aside>

      <div class="min-w-0 flex-1">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SidebarLayoutComponent {
  @Input() area: DashboardArea = 'producer';

  get links(): SidebarLink[] {
    return this.area === 'admin'
      ? [
          { label: 'Validation', route: '/admin', icon: 'users' },
          { label: 'Marketplace', route: '/marketplace', icon: 'marketplace' }
        ]
      : [
          { label: 'Tableau de bord', route: '/dashboard/producteur', icon: 'dashboard' },
          { label: 'Marketplace', route: '/marketplace', icon: 'marketplace' },
          { label: 'Capteurs IoT', route: '/iot', icon: 'sensors' }
        ];
  }
}
