import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IsActiveMatchOptions, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { libelleRole } from '../../core/utils/statuts';

export type DashboardArea = 'producer' | 'admin' | 'breeder';

type SidebarIcon =
  | 'dashboard' | 'marketplace' | 'sensors' | 'users' | 'orders' | 'chart'
  | 'history' | 'products' | 'profile' | 'home' | 'switch' | 'logout';

interface SidebarLink {
  label: string;
  route: string;
  icon: SidebarIcon;
}

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-template #icone let-icon>
      <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor"
           stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        @switch (icon) {
          @case ('dashboard') {
            <rect x="3" y="3" width="8" height="8" rx="1" />
            <rect x="13" y="3" width="8" height="5" rx="1" />
            <rect x="13" y="10" width="8" height="11" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" />
          }
          @case ('orders') {
            <path d="M7 3h10l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            <path d="M17 3v5h5M9 12h7m-7 4h7" />
          }
          @case ('products') {
            <path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z" />
            <path d="m3 8 9 5 9-5M12 13v8" />
          }
          @case ('chart') {
            <path d="M4 20V11h4v9H4Zm6 0V5h4v15h-4Zm6 0v-8h4v8h-4Z" />
          }
          @case ('marketplace') {
            <path d="M3 10h18l-2-6H5l-2 6Z" />
            <path d="M5 10v10h14V10M9 20v-6h6v6" />
          }
          @case ('sensors') {
            <path d="M12 18v3m-4-3a6 6 0 0 1 8 0m-11-3a10 10 0 0 1 14 0m-17-4a14 14 0 0 1 20 0" />
            <circle cx="12" cy="20" r="1" />
          }
          @case ('users') {
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          }
          @case ('history') {
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          }
          @case ('profile') {
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          }
          @case ('home') {
            <path d="m3 11 9-8 9 8" />
            <path d="M5 10v10h5v-6h4v6h5V10" />
          }
          @case ('switch') {
            <path d="M16 3l4 4-4 4M20 7H8M8 21l-4-4 4-4M4 17h12" />
          }
          @case ('logout') {
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5M21 12H9" />
          }
        }
      </svg>
    </ng-template>

    <div class="min-h-screen bg-cream md:flex">
      <aside class="relative flex flex-col overflow-hidden bg-wine-dark text-white transition-[width] duration-300 md:sticky md:top-0 md:h-screen md:shrink-0 md:self-start"
             [ngClass]="collapsed ? 'md:w-20' : 'md:w-72'">
        <a routerLink="/accueil" aria-label="BioConversion, retour à l’accueil"
           class="flex items-center gap-3 border-b border-white/15 px-4 py-3 md:flex-col md:gap-2 md:px-5 md:py-6"
           [ngClass]="collapsed ? 'md:px-2 md:py-5' : ''">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white transition-all duration-300"
                [ngClass]="collapsed ? '' : 'md:h-20 md:w-20'">
            <img src="/logo.webp" alt="" class="h-full w-full object-contain">
          </span>
          <span class="font-serif text-2xl font-bold" [ngClass]="collapsed ? 'md:hidden' : ''">BioConversion</span>
        </a>

        <!-- Bouton rétracter (ordinateur uniquement) -->
        <div class="hidden px-4 pt-3 md:flex" [ngClass]="collapsed ? 'md:justify-center' : 'md:justify-end'">
          <button type="button" (click)="toggle()"
                  class="grid h-9 w-9 place-items-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  [attr.aria-expanded]="!collapsed"
                  [attr.aria-label]="collapsed ? 'Déployer le menu' : 'Réduire le menu'"
                  [title]="collapsed ? 'Déployer le menu' : 'Réduire le menu'">
            <svg viewBox="0 0 24 24" class="h-5 w-5 transition-transform duration-300" [class.rotate-180]="collapsed"
                 fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
        </div>

        <nav aria-label="Navigation principale"
             class="relative z-10 flex gap-2 overflow-x-auto p-3 md:block md:flex-1 md:space-y-1.5 md:overflow-y-auto md:overflow-x-hidden md:p-4"
             [ngClass]="collapsed ? 'md:px-2' : ''">
          @for (link of links; track link.route) {
            <a [routerLink]="link.route"
               routerLinkActive="bg-white/15 text-white"
               [routerLinkActiveOptions]="activeOptions"
               [title]="collapsed ? link.label : ''"
               [attr.aria-label]="link.label"
               class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
               [ngClass]="collapsed ? 'md:justify-center md:px-0' : ''">
              <ng-container *ngTemplateOutlet="icone; context: { $implicit: link.icon }"></ng-container>
              <span [ngClass]="collapsed ? 'md:hidden' : ''">{{ link.label }}</span>
            </a>
          }
        </nav>

        <!-- Compte : profil, accueil, changement de compte, déconnexion -->
        <div class="relative z-10 border-t border-white/20 md:mt-auto">
          @if (!collapsed) {
            <div class="hidden px-6 pt-4 md:block">
              <p class="truncate font-semibold">{{ userName() }}</p>
              <p class="text-sm text-white/65">{{ roleLabel() }}</p>
            </div>
          }
          <div class="flex gap-2 overflow-x-auto p-3 md:block md:space-y-1 md:overflow-x-hidden md:p-4"
               [ngClass]="collapsed ? 'md:px-2' : ''">
            <a routerLink="/profil" routerLinkActive="bg-white/15 text-white"
               [title]="collapsed ? 'Profil' : ''" aria-label="Profil"
               class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
               [ngClass]="collapsed ? 'md:justify-center md:px-0' : ''">
              <ng-container *ngTemplateOutlet="icone; context: { $implicit: 'profile' }"></ng-container>
              <span [ngClass]="collapsed ? 'md:hidden' : ''">Profil</span>
            </a>
            <a routerLink="/accueil"
               [title]="collapsed ? 'Accueil' : ''" aria-label="Accueil"
               class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
               [ngClass]="collapsed ? 'md:justify-center md:px-0' : ''">
              <ng-container *ngTemplateOutlet="icone; context: { $implicit: 'home' }"></ng-container>
              <span [ngClass]="collapsed ? 'md:hidden' : ''">Accueil</span>
            </a>
            <button type="button" (click)="changerDeProfil()"
                    [title]="collapsed ? 'Changer de profil' : ''" aria-label="Changer de profil"
                    class="flex w-auto shrink-0 items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white md:w-full"
                    [ngClass]="collapsed ? 'md:justify-center md:px-0' : ''">
              <ng-container *ngTemplateOutlet="icone; context: { $implicit: 'switch' }"></ng-container>
              <span class="whitespace-nowrap" [ngClass]="collapsed ? 'md:hidden' : ''">Changer de profil</span>
            </button>
            <button type="button" (click)="seDeconnecter()"
                    [title]="collapsed ? 'Se déconnecter' : ''" aria-label="Se déconnecter"
                    class="flex w-auto shrink-0 items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white md:w-full"
                    [ngClass]="collapsed ? 'md:justify-center md:px-0' : ''">
              <ng-container *ngTemplateOutlet="icone; context: { $implicit: 'logout' }"></ng-container>
              <span class="whitespace-nowrap" [ngClass]="collapsed ? 'md:hidden' : ''">Se déconnecter</span>
            </button>
          </div>
        </div>
        <svg class="pointer-events-none absolute -bottom-4 -left-5 hidden h-56 w-40 text-green/80 opacity-30 md:block"
             [ngClass]="collapsed ? 'md:hidden' : ''" viewBox="0 0 120 180" fill="none" aria-hidden="true">
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
  private static readonly storageKey = 'bioconversion.sidebar.collapsed';

  /* Une route distincte par onglet : un seul lien est surligné à la fois */
  private static readonly producerLinks: SidebarLink[] = [
    { label: 'Tableau de bord', route: '/dashboard/producteur', icon: 'dashboard' },
    { label: 'Commandes', route: '/dashboard/commandes', icon: 'orders' },
    { label: 'Mes produits', route: '/dashboard/produits', icon: 'products' },
    { label: 'Capteurs IoT', route: '/iot', icon: 'sensors' },
    { label: 'Statistiques', route: '/dashboard/statistiques', icon: 'chart' },
    { label: 'Marketplace', route: '/marketplace', icon: 'marketplace' }
  ];

  private static readonly breederLinks: SidebarLink[] = [
    { label: 'Marketplace', route: '/marketplace', icon: 'marketplace' },
    { label: 'Mes commandes', route: '/mes-commandes', icon: 'orders' },
    { label: 'Historique', route: '/historique', icon: 'history' }
  ];

  private static readonly adminLinks: SidebarLink[] = [
    { label: 'Tableau de bord', route: '/admin', icon: 'dashboard' },
    { label: 'Utilisateurs', route: '/admin/utilisateurs', icon: 'users' },
    { label: 'Marketplace', route: '/marketplace', icon: 'marketplace' }
  ];

  @Input() area: DashboardArea = 'producer';

  readonly activeOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored'
  };

  /* État rétracté, mémorisé entre les pages et les rechargements */
  collapsed = this.readStoredState();

  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  });

  readonly roleLabel = computed(() => {
    const user = this.authService.currentUser();
    return libelleRole(user?.role, user?.typeElevage);
  });

  constructor(private authService: AuthService, private router: Router) {}

  get links(): SidebarLink[] {
    switch (this.area) {
      case 'admin': return SidebarLayoutComponent.adminLinks;
      case 'breeder': return SidebarLayoutComponent.breederLinks;
      default: return SidebarLayoutComponent.producerLinks;
    }
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
    try {
      localStorage.setItem(SidebarLayoutComponent.storageKey, String(this.collapsed));
    } catch { /* stockage indisponible : on ignore */ }
  }

  /* Déconnecte puis ramène à la connexion pour entrer avec un autre compte */
  changerDeProfil(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }

  seDeconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }

  private readStoredState(): boolean {
    try {
      return localStorage.getItem(SidebarLayoutComponent.storageKey) === 'true';
    } catch {
      return false;
    }
  }
}
