import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type DashboardArea = 'producer' | 'admin';

interface SidebarLink {
  label: string;
  route: string;
  icon: 'dashboard' | 'marketplace' | 'sensors' | 'users' | 'orders' | 'chart';
}

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream md:flex">
      <aside class="relative flex flex-col overflow-hidden bg-wine-dark text-white md:min-h-screen md:w-72 md:shrink-0">
        <div class="flex flex-col items-center gap-2 border-b border-white/15 px-5 py-7">
          <span class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white">
            <img src="/logo.png" alt="" class="h-full w-full object-contain">
          </span>
          <span class="font-serif text-3xl font-bold">BioConversion</span>
        </div>

        <nav aria-label="Navigation principale" class="relative z-10 flex gap-2 overflow-x-auto p-3 md:block md:space-y-3 md:p-4">
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
                <ng-container *ngSwitchCase="'orders'">
                  <path d="M7 3h10l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                  <path d="M17 3v5h5M9 12h7m-7 4h7" />
                </ng-container>
                <ng-container *ngSwitchCase="'chart'">
                  <path d="M4 20V11h4v9H4Zm6 0V5h4v15h-4Zm6 0v-8h4v8h-4Z" />
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

        <div class="relative z-10 mt-auto hidden border-t border-white/20 px-6 py-6 md:block">
          <p class="text-sm text-white/65">Connecté en tant que</p>
          <p class="mt-1 font-semibold">{{ area === 'admin' ? 'Administrateur' : 'Producteur' }}</p>
        </div>
        <svg class="pointer-events-none absolute -bottom-4 -left-5 h-56 w-40 text-green/80 opacity-80" viewBox="0 0 120 180" fill="none" aria-hidden="true">
          <path d="M8 170C38 126 48 83 83 25" stroke="currentColor" stroke-width="2"/>
          <path d="M38 125C4 124 4 96 10 78c24 3 38 19 28 47Zm17-31c-9-29 10-45 29-51 8 23-3 42-29 51Zm7 46c-1-26 19-36 40-36 2 24-13 38-40 36ZM25 151c-19-16-15-37-3-52 20 10 24 28 3 52Z" fill="currentColor" opacity=".7"/>
        </svg>
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
          { label: 'Commandes', route: '/dashboard/producteur#commandes', icon: 'orders' },
          { label: 'Capteurs IoT', route: '/iot', icon: 'sensors' },
          { label: 'Statistiques', route: '/dashboard/producteur#stats', icon: 'chart' }
        ];
  }
}
