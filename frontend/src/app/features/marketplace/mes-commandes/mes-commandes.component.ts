import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Commande, MarketplaceService } from '../../../core/services/marketplace.service';
import { UiBadgeComponent, UiCardComponent } from '../../../shared/components';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, UiCardComponent, UiBadgeComponent],
  template: `
    <div class="min-h-screen bg-cream">
      <nav class="sticky top-0 z-50 border-b border-line bg-white px-5 py-3 md:px-8">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <a routerLink="/marketplace" class="flex shrink-0 items-center gap-3 font-serif text-2xl font-bold text-wine">
            <img src="/logo.png" alt="" class="h-14 w-14 object-contain">
            BioConversion
          </a>
          <div class="hidden items-center gap-6 text-text md:flex">
            <a routerLink="/marketplace" routerLinkActive="border-b-2 border-green text-green"
               [routerLinkActiveOptions]="{ exact: true }" class="px-2 py-4 font-semibold hover:text-green">Rechercher</a>
            <a routerLink="/mes-commandes" routerLinkActive="border-b-2 border-green text-green"
               [routerLinkActiveOptions]="{ exact: true }" class="px-2 py-4 font-semibold hover:text-green">Mes commandes</a>
            <a routerLink="/historique" routerLinkActive="border-b-2 border-green text-green"
               [routerLinkActiveOptions]="{ exact: true }" class="px-2 py-4 font-semibold hover:text-green">Historique</a>
          </div>
        </div>
      </nav>

      <main class="mx-auto max-w-5xl px-5 py-8 md:px-8">
        <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-sm font-semibold uppercase text-green">Espace éleveur</p>
            <h1 class="mt-1 font-serif text-3xl font-bold text-wine">Mes commandes</h1>
          </div>
          <a routerLink="/marketplace" class="font-semibold text-green hover:underline">Rechercher des produits</a>
        </header>

        <p *ngIf="isLoading" role="status" class="py-8 text-center text-text">Chargement des commandes...</p>
        <div *ngIf="errorMessage" role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadCommandes()" class="ml-2 font-semibold underline">Réessayer</button>
        </div>
        <p *ngIf="!isLoading && !errorMessage && commandes.length === 0" class="rounded-xl border border-line bg-white p-8 text-center text-text">
          Aucune commande en cours sur cette page.
        </p>

        <div class="space-y-4">
          <app-ui-card *ngFor="let commande of commandes">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="font-serif text-xl font-semibold text-wine">{{ commande.numeroCommande }}</h2>
                <p class="mt-1 text-sm text-text">{{ commande.nomExploitation }} · {{ commande.dateCommande | date:'mediumDate' }}</p>
              </div>
              <app-ui-badge [variant]="badgeVariant(commande.statut)">{{ statutLabel(commande.statut) }}</app-ui-badge>
            </div>
            <div class="mt-4 space-y-1 border-t border-line pt-3">
              <p *ngFor="let ligne of commande.lignes" class="text-sm text-text">{{ ligne.nomProduit }} · {{ ligne.quantite }} kg</p>
              <p class="pt-2 font-semibold text-wine">{{ commande.montantTotal | number:'1.0-2' }} FCFA</p>
            </div>
          </app-ui-card>
        </div>

        <nav *ngIf="totalPages > 1" aria-label="Pagination des commandes" class="mt-6 flex items-center justify-between">
          <button type="button" (click)="changePage(page - 1)" [disabled]="page === 0"
                  class="rounded-lg border border-line bg-white px-4 py-2 font-semibold text-text disabled:opacity-40">Précédent</button>
          <span class="text-sm text-text">Page {{ page + 1 }} sur {{ totalPages }}</span>
          <button type="button" (click)="changePage(page + 1)" [disabled]="page + 1 >= totalPages"
                  class="rounded-lg border border-line bg-white px-4 py-2 font-semibold text-text disabled:opacity-40">Suivant</button>
        </nav>
      </main>
    </div>
  `
})
export class MesCommandesComponent implements OnInit {
  private readonly activeStatuses = new Set(['EN_ATTENTE', 'CONFIRME', 'PAYE', 'EXPEDIE']);
  commandes: Commande[] = [];
  page = 0;
  totalPages = 0;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(page = 0): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'ELEVEUR') {
      this.errorMessage = 'Connectez-vous avec un compte éleveur pour consulter vos commandes.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.marketplaceService.listerCommandesEleveur(user.idUtilisateur, page).subscribe({
      next: response => {
        this.commandes = response.data.content.filter(commande => this.activeStatuses.has(commande.statut));
        this.page = response.data.number;
        this.totalPages = response.data.totalPages;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos commandes. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  changePage(page: number): void {
    this.loadCommandes(page);
  }

  statutLabel(statut: string): string {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      CONFIRME: 'Confirmée',
      PAYE: 'Payée',
      EXPEDIE: 'Expédiée'
    };
    return labels[statut] ?? statut;
  }

  badgeVariant(statut: string): 'warning' | 'success' | 'gray' | 'orange' {
    if (statut === 'PAYE' || statut === 'EXPEDIE') return 'success';
    if (statut === 'CONFIRME') return 'orange';
    return 'warning';
  }
}