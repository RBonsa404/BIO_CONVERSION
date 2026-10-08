import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Commande, MarketplaceService, ProducteurProfile } from '../../core/services/marketplace.service';
import { PaiementService } from '../../core/services/paiement.service';

@Component({
  selector: 'app-producteur-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-7xl">
        <header class="mb-6 flex items-center gap-4 border-b border-line pb-5">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-green-soft text-green" aria-hidden="true">♧</span>
          <div class="min-w-0 flex-1">
            <h1 class="font-serif text-2xl font-bold text-wine md:text-4xl">
              Bonjour{{ producteur ? ', ' + producteur.nomExploitation : '' }}
            </h1>
            <p class="mt-1 text-text">Votre production fait la différence</p>
          </div>
          <span class="hidden rounded-full bg-green-soft px-4 py-2 text-sm font-semibold text-green sm:inline">
            Espace producteur
          </span>
        </header>

        <div *ngIf="isLoading" role="status" class="bg-white rounded-2xl p-6 text-text mb-8">
          Chargement de votre tableau de bord...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadDashboard()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <div *ngIf="!isLoading && commandesEnAttente.length > 0" class="mb-6 flex items-center gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-xl" aria-hidden="true">!</span>
          <p class="flex-1"><strong>Nouvelle commande</strong> — {{ commandesEnAttente.length }} commande(s) à confirmer.</p>
          <button type="button" (click)="scrollToOrders()" class="font-semibold underline">Voir</button>
        </div>
        <div *ngIf="actionMessage" role="status" class="mb-6 rounded-xl bg-green-soft p-4 text-green">
          {{ actionMessage }}
        </div>

        <ng-container *ngIf="!isLoading && producteur">
          <section id="stats" class="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span class="mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-soft text-2xl text-green" aria-hidden="true">♧</span>
              <p class="mb-2 text-sm text-text">Capacité de production</p>
              <p class="font-serif text-3xl font-bold text-wine">
                {{ producteur.capaciteProduction }} kg/mois
              </p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span class="mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-soft text-2xl text-green" aria-hidden="true">◉</span>
              <p class="mb-2 text-sm text-text">Paiements confirmés</p>
              <p class="font-serif text-3xl font-bold text-wine">
                {{ totalPaiementsConfirmes | number:'1.0-2' }} FCFA
              </p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span class="mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-soft text-2xl text-green" aria-hidden="true">▤</span>
              <p class="mb-2 text-sm text-text">Commandes à traiter</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ commandesEnAttente.length }}</p>
            </article>
          </section>

          <section #ordersSection id="commandes" class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-6 flex items-center gap-3 font-serif text-2xl font-semibold text-wine">
              <span class="grid h-12 w-12 place-items-center rounded-full bg-green-soft text-xl text-green" aria-hidden="true">▤</span>
              Commandes en attente de validation
            </h2>
            <p *ngIf="commandesEnAttente.length === 0" class="text-text py-6">
              Aucune commande en attente de validation.
            </p>
            <div *ngFor="let commande of commandesEnAttente"
                 class="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-cream/60 p-4">
              <div>
                <p class="inline-flex rounded-lg bg-green-soft px-3 py-1 font-semibold text-green">{{ commande.numeroCommande }}</p>
                <p class="mt-2 text-sm text-text">{{ commande.nomEleveur }} · {{ commande.dateCommande | date:'short' }}</p>
                <p *ngFor="let ligne of commande.lignes" class="text-text text-sm">
                  {{ ligne.nomProduit }} — {{ ligne.quantite }} kg
                </p>
                <p class="mt-2 font-semibold text-wine">{{ commande.montantTotal | number:'1.0-2' }} FCFA</p>
              </div>
              <div class="flex gap-2">
                <button type="button" (click)="traiterCommande(commande, true)"
                        [disabled]="processingId === commande.idCommande"
                        class="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  Valider
                </button>
                <button type="button" (click)="traiterCommande(commande, false)"
                        [disabled]="processingId === commande.idCommande"
                        class="rounded-lg border border-wine bg-white px-5 py-2.5 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                  Refuser
                </button>
              </div>
            </div>
          </section>
        </ng-container>
      </div>
    </main>
  `
})
export class ProducteurDashboardComponent implements OnInit {
  @ViewChild('ordersSection') private ordersSection?: ElementRef<HTMLElement>;

  producteur: ProducteurProfile | null = null;
  commandes: Commande[] = [];
  totalPaiementsConfirmes = 0;
  isLoading = false;
  errorMessage = '';
  actionMessage = '';
  processingId: number | null = null;

  constructor(
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  get commandesEnAttente(): Commande[] {
    return this.commandes.filter(commande => commande.statut === 'EN_ATTENTE');
  }

  loadDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'PRODUCTEUR') {
      this.errorMessage = 'Connectez-vous avec un compte producteur pour consulter ce tableau de bord.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      producteur: this.marketplaceService.obtenirProducteur(user.idUtilisateur),
      commandes: this.marketplaceService.listerCommandesProducteur(user.idUtilisateur),
      paiements: this.paiementService.totalPaiementsConfirmes(user.idUtilisateur)
    }).subscribe({
      next: result => {
        this.producteur = result.producteur.data;
        this.commandes = result.commandes.data.content;
        this.totalPaiementsConfirmes = result.paiements.data;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le tableau de bord. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  traiterCommande(commande: Commande, approuve: boolean): void {
    this.processingId = commande.idCommande;
    this.errorMessage = '';
    this.actionMessage = '';
    const request = approuve
      ? this.marketplaceService.confirmerCommande(commande.idCommande)
      : this.marketplaceService.refuserCommande(commande.idCommande);
    request.subscribe({
      next: response => {
        this.commandes = this.commandes.map(item =>
          item.idCommande === commande.idCommande ? response.data : item
        );
        this.actionMessage = approuve
          ? `La commande ${commande.numeroCommande} a été validée.`
          : `La commande ${commande.numeroCommande} a été refusée.`;
        this.processingId = null;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = `Impossible de ${approuve ? 'valider' : 'refuser'} la commande ${commande.numeroCommande}. Réessayez.`;
        this.processingId = null;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  scrollToOrders(): void {
    this.ordersSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}