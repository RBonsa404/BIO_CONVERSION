import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MarketplaceService, ProducteurProfile, Produit } from '../../../core/services/marketplace.service';

@Component({
  selector: 'app-producteur-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream">
      <nav class="bg-white shadow-lg border-b border-line px-6 py-5">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/marketplace" class="text-2xl font-serif text-wine font-bold">BioConversion</a>
          <a routerLink="/marketplace" class="text-wine font-semibold">Retour à la marketplace</a>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 py-12">
        <div *ngIf="isLoading" role="status" class="text-center text-text py-12">
          Chargement de la fiche producteur...
        </div>
        <div *ngIf="errorMessage" role="alert" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadProducteur()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <ng-container *ngIf="!isLoading && !errorMessage && producteur as currentProducteur">
          <section class="bg-white rounded-3xl shadow-lg p-8 mb-10">
            <h1 class="text-4xl font-serif text-wine font-bold mb-3">
              {{ currentProducteur.nomExploitation }}
            </h1>
            <p class="text-text text-lg mb-5">
              {{ currentProducteur.prenom }} {{ currentProducteur.nom }}
              <span *ngIf="currentProducteur.ville"> · {{ currentProducteur.ville }}</span>
              <span *ngIf="currentProducteur.province">, {{ currentProducteur.province }}</span>
            </p>
            <p class="text-text">
              Capacité de production : {{ currentProducteur.capaciteProduction }} kg/mois
            </p>
          </section>

          <section>
            <h2 class="text-3xl font-serif text-wine font-semibold mb-8">Catalogue des produits</h2>
            <p *ngIf="produits.length === 0" class="bg-white rounded-xl p-6 text-text">
              Aucun produit disponible pour ce producteur.
            </p>
            <div *ngIf="produits.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <article *ngFor="let produit of produits" class="bg-white rounded-3xl shadow-lg p-8 border border-line">
                <p class="text-sm text-green font-semibold mb-2">{{ produit.typeProduit }}</p>
                <h3 class="text-xl font-serif text-wine font-semibold mb-5">{{ produit.nomProduit }}</h3>
                <div class="flex justify-between items-center py-3 bg-green-soft rounded-xl px-4 mb-6">
                  <span class="text-xl font-serif text-wine font-bold">{{ produit.prix | number:'1.0-2' }} FCFA</span>
                  <span class="text-text text-sm">Stock : {{ produit.quantiteStock }} kg</span>
                </div>
                <a [routerLink]="['/commande']"
                   [queryParams]="{ produitId: produit.idProduit, quantite: 1 }"
                   class="block text-center bg-wine text-white py-3 rounded-xl font-semibold hover:bg-wine-dark">
                  Commander
                </a>
              </article>
            </div>
          </section>
        </ng-container>
      </main>
    </div>
  `
})
export class ProducteurDetailComponent implements OnInit {
  producteur: ProducteurProfile | null = null;
  produits: Produit[] = [];
  isLoading = false;
  errorMessage = '';
  private producteurId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private marketplaceService: MarketplaceService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage = 'Identifiant de producteur invalide.';
      return;
    }
    this.producteurId = id;
    this.loadProducteur();
  }

  loadProducteur(): void {
    if (this.producteurId === null) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      producteur: this.marketplaceService.obtenirProducteur(this.producteurId),
      catalogue: this.marketplaceService.consulterCatalogueProducteur(this.producteurId)
    }).subscribe({
      next: response => {
        this.producteur = response.producteur.data;
        this.produits = response.catalogue.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cette fiche producteur. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
      }
    });
  }
}
