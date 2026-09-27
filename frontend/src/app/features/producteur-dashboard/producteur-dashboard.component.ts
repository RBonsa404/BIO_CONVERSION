import { Component, OnInit } from '@angular/core';
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
    <main class="min-h-screen bg-cream p-8">
      <div class="max-w-6xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-serif text-wine font-bold mb-2">Tableau de bord</h1>
          <p class="text-text">
            {{ producteur ? 'Bienvenue, ' + producteur.prenom + ' — ' + producteur.nomExploitation : 'Espace producteur' }}
          </p>
        </header>

        <div *ngIf="isLoading" role="status" class="bg-white rounded-2xl p-6 text-text mb-8">
          Chargement de votre tableau de bord...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadDashboard()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <div *ngIf="actionMessage" role="status" class="mb-6 p-4 bg-green-soft rounded-xl text-green">
          {{ actionMessage }}
        </div>

        <ng-container *ngIf="!isLoading && producteur">
          <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <article class="bg-white rounded-2xl shadow-sm p-6">
              <p class="text-text text-sm mb-2">Capacité de production</p>
              <p class="text-2xl font-serif text-wine font-bold">
                {{ producteur.capaciteProduction }} kg/mois
              </p>
            </article>
            <article class="bg-white rounded-2xl shadow-sm p-6">
              <p class="text-text text-sm mb-2">Paiements confirmés</p>
              <p class="text-2xl font-serif text-wine font-bold">
                {{ totalPaiementsConfirmes | number:'1.0-2' }} FCFA
              </p>
            </article>
            <article class="bg-white rounded-2xl shadow-sm p-6">
              <p class="text-text text-sm mb-2">Commandes à traiter</p>
              <p class="text-2xl font-serif text-wine font-bold">{{ commandesEnAttente.length }}</p>
            </article>
          </section>

          <section class="bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-serif text-wine font-medium mb-6">Commandes en attente</h2>
            <p *ngIf="commandesEnAttente.length === 0" class="text-text py-6">
              Aucune commande en attente de validation.
            </p>
            <div *ngFor="let commande of commandesEnAttente"
                 class="flex flex-wrap items-center justify-between gap-4 p-4 bg-cream rounded-lg mb-4">
              <div>
                <p class="text-wine font-semibold">{{ commande.numeroCommande }}</p>
                <p class="text-text text-sm">{{ commande.nomEleveur }} · {{ commande.dateCommande | date:'short' }}</p>
                <p *ngFor="let ligne of commande.lignes" class="text-text text-sm">
                  {{ ligne.nomProduit }} — {{ ligne.quantite }} kg
                </p>
                <p class="text-wine font-semibold">{{ commande.montantTotal | number:'1.0-2' }} FCFA</p>
              </div>
              <div class="flex gap-2">
                <button type="button" (click)="traiterCommande(commande, true)"
                        [disabled]="processingId === commande.idCommande"
                        class="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  Valider
                </button>
                <button type="button" (click)="traiterCommande(commande, false)"
                        [disabled]="processingId === commande.idCommande"
                        class="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50">
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
    private paiementService: PaiementService
  ) {}

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
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le tableau de bord. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
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
      },
      error: () => {
        this.errorMessage = `Impossible de ${approuve ? 'valider' : 'refuser'} la commande ${commande.numeroCommande}. Réessayez.`;
        this.processingId = null;
      }
    });
  }
}
