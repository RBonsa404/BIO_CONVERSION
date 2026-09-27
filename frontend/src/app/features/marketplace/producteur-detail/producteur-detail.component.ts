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
      <nav class="border-b border-line bg-white px-5 py-3 md:px-8">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <a routerLink="/marketplace" class="flex items-center gap-3 font-serif text-2xl font-bold text-wine">
            <img src="/logo.png" alt="" class="h-14 w-14 object-contain">
            BioConversion
          </a>
          <a routerLink="/marketplace" class="font-semibold text-green hover:text-wine">← Retour à la recherche</a>
        </div>
      </nav>

      <main class="mx-auto max-w-7xl px-5 py-7 md:px-8">
        <div *ngIf="isLoading" role="status" class="text-center text-text py-12">
          Chargement de la fiche producteur...
        </div>
        <div *ngIf="errorMessage" role="alert" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadProducteur()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <ng-container *ngIf="!isLoading && !errorMessage && producteur as currentProducteur">
          <section class="mb-8 grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:grid-cols-[minmax(220px,.8fr)_1.2fr]">
            <img src="/larvae-hero.png" alt="Larves produites dans un panier" class="h-48 w-full object-cover md:h-full">
            <div class="flex flex-col justify-center p-6 md:p-8">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h1 class="font-serif text-3xl font-bold text-wine md:text-4xl">{{ currentProducteur.nomExploitation }}</h1>
                <span *ngIf="currentProducteur.statut === 'ACTIF'" class="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white">✓ Compte validé</span>
              </div>
              <p class="text-lg text-text">
                {{ currentProducteur.prenom }} {{ currentProducteur.nom }}
                <span *ngIf="currentProducteur.ville"> · {{ currentProducteur.ville }}</span>
                <span *ngIf="currentProducteur.province">, {{ currentProducteur.province }}</span>
              </p>
              <p class="mt-3 text-sm text-text">Capacité de production : <strong class="text-wine">{{ currentProducteur.capaciteProduction }} kg/mois</strong></p>
            </div>
          </section>

          <section>
            <h2 class="mb-5 flex items-center gap-3 font-serif text-3xl font-semibold text-wine">
              <span class="grid h-12 w-12 place-items-center rounded-full bg-green-soft text-2xl text-green" aria-hidden="true">♧</span>
              Catalogue disponible
            </h2>
            <p *ngIf="produits.length === 0" class="rounded-xl border border-line bg-white p-6 text-text">
              Aucun produit disponible pour ce producteur.
            </p>
            <div *ngIf="produits.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article *ngFor="let produit of produits" class="grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm sm:grid-cols-[180px_1fr]">
                <div class="relative">
                  <img src="/larvae-hero.png" alt="" class="h-40 w-full object-cover sm:h-full">
                  <span class="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-green-soft text-green" aria-hidden="true">♧</span>
                </div>
                <div class="flex flex-col p-4">
                  <p class="text-sm font-semibold text-green">{{ produit.typeProduit }}</p>
                  <h3 class="mt-1 font-serif text-xl font-semibold text-wine">{{ produit.nomProduit }}</h3>
                  <p class="mt-3 text-sm text-text">Stock : {{ produit.quantiteStock }} kg disponibles</p>
                  <p class="mt-2 font-serif text-2xl font-bold text-wine">{{ produit.prix | number:'1.0-2' }} <small class="text-base">FCFA/kg</small></p>
                  <a *ngIf="produit.disponibilite && produit.quantiteStock > 0"
                     [routerLink]="['/commande']"
                   [queryParams]="{ produitId: produit.idProduit, quantite: 1 }"
                   class="mt-4 block rounded-lg bg-wine py-3 text-center font-semibold text-white hover:bg-wine-dark">
                  Commander
                  </a>
                  <button *ngIf="!produit.disponibilite || produit.quantiteStock <= 0" type="button" disabled
                          class="mt-4 rounded-lg bg-gray-200 py-3 font-medium text-gray-500">Indisponible</button>
                </div>
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
