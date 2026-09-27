import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketplaceService, ProducteurLocalise, Produit } from '../../core/services/marketplace.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream">
      <nav class="sticky top-0 z-50 border-b border-line bg-white px-5 py-3 md:px-8">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <a routerLink="/marketplace" class="flex shrink-0 items-center gap-3 font-serif text-2xl font-bold text-wine">
            <img src="/logo.png" alt="" class="h-14 w-14 object-contain">
            BioConversion
          </a>
          <div class="hidden items-center gap-12 text-text md:flex">
            <a routerLink="/marketplace" class="border-b-2 border-green px-2 py-4 font-semibold text-green">Rechercher</a>
            <span class="px-2 py-4 text-gray-400">Mes commandes</span>
            <span class="px-2 py-4 text-gray-400">Historique</span>
          </div>
          <span class="grid h-12 w-12 place-items-center rounded-full bg-green-soft text-green" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
            </svg>
          </span>
        </div>
      </nav>

      <section class="px-5 pt-3 md:px-8">
        <p class="mb-3 text-center font-script text-xl italic text-green md:text-2xl">❧ &nbsp; Trouvez le producteur le plus proche de chez vous &nbsp; ❧</p>
        <div class="mx-auto max-w-7xl">
          <form (ngSubmit)="applySearch()" class="flex flex-col gap-3 md:flex-row">
            <label class="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-white px-5 py-3">
              <span class="text-2xl text-green" aria-hidden="true">⌕</span>
              <input name="searchTerm" [(ngModel)]="searchInput" type="search"
                     placeholder="Rechercher un producteur, un produit, une région..."
                     class="w-full border-0 bg-transparent text-text outline-none">
            </label>
            <label class="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-text">
              <span class="text-green" aria-hidden="true">⌖</span>
              <span class="whitespace-nowrap">Trier :</span>
              <select name="sort" [(ngModel)]="sortBy" class="min-w-32 bg-transparent font-medium outline-none">
                <option value="distance">distance</option>
                <option value="prix">prix</option>
                <option value="stock">stock</option>
              </select>
            </label>
          </form>
          <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-text">
            <label for="rayon" class="flex items-center gap-2 font-medium">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-green-soft text-green" aria-hidden="true">⌖</span>
              Rayon de recherche
            </label>
            <input id="rayon" name="rayon" type="range" min="1" max="50" step="1"
                   [(ngModel)]="rayonKm" (change)="chargerProducteurs()"
                   class="min-w-40 flex-1 accent-green">
            <span class="min-w-16 font-semibold">{{ rayonKm }} km</span>
          </div>
        </div>
      </section>

      <main class="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-5 md:px-8 lg:grid-cols-[.85fr_1.15fr]">
        <section class="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <h1 class="font-serif text-xl font-semibold text-green">Carte des producteurs</h1>
          <p class="mb-3 text-sm text-text">Producteurs localisés dans un rayon de {{ rayonKm }} km</p>
          <div class="producer-map" role="group" aria-label="Aperçu des emplacements des producteurs autour de Ouagadougou">
            <span class="map-city">Ouagadougou</span>
            <span class="map-radius" aria-hidden="true"></span>
            <span class="map-home" title="Ouagadougou" aria-label="Votre zone de recherche"></span>
            <button *ngFor="let producteur of producteurs"
                    type="button" class="map-marker"
                    [ngStyle]="markerStyle(producteur)"
                    [attr.aria-label]="'Producteur ' + producteur.nomExploitation"
                    [title]="producteur.nomExploitation + ' · ' + (producteur.distanceKm | number:'1.0-1') + ' km'"
                    [routerLink]="['/producteur', producteur.producteurId]">●</button>
            <div *ngIf="!isLoadingMap && !mapError && producteurs.length === 0" class="map-empty">
              Aucun producteur trouvé dans cette zone.
            </div>
            <div *ngIf="isLoadingMap" class="map-empty" role="status">Recherche des producteurs...</div>
            <div *ngIf="mapError" class="map-empty text-red-700" role="alert">
              {{ mapError }}
              <button type="button" (click)="chargerProducteurs()" class="ml-2 underline">Réessayer</button>
            </div>
          </div>
          <p class="mt-3 text-xs text-text">Les repères correspondent aux coordonnées des producteurs retournées par le service.</p>
        </section>

        <section aria-label="Produits disponibles" class="space-y-3">
          <div *ngIf="isLoading" role="status" class="rounded-xl bg-white p-6 text-center text-text">Chargement des produits...</div>
          <div *ngIf="errorMessage" role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage }}
            <button type="button" (click)="loadProduits()" class="ml-3 font-semibold underline">Réessayer</button>
          </div>
          <p *ngIf="!isLoading && !errorMessage && filteredProducts.length === 0" class="rounded-xl bg-white p-8 text-center text-text">
            Aucun produit ne correspond à votre recherche.
          </p>
          <article *ngFor="let produit of filteredProducts"
                   class="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-3 shadow-sm sm:flex-nowrap">
            <img src="/larvae-hero.png" alt="" class="h-28 w-36 shrink-0 rounded-lg object-cover">
            <div class="min-w-0 flex-1">
              <h2 class="font-serif text-xl font-semibold text-wine">{{ produit.nomExploitation }}</h2>
              <p class="mt-1 text-sm text-text">{{ produit.nomProduit }}</p>
              <p class="mt-2 text-sm text-text">
                <span class="text-green">⌖</span> {{ producerDistance(produit.producteurId) }}
                <span class="mx-2 text-line">·</span>
                <span class="font-medium">Stock disponible :</span>
                <span class="text-green">{{ produit.quantiteStock }} kg</span>
              </p>
              <p class="mt-1 font-serif text-2xl font-bold text-wine">{{ produit.prix | number:'1.0-2' }} <small class="text-base">FCFA/kg</small></p>
            </div>
            <a [routerLink]="['/producteur', produit.producteurId]"
               class="flex min-w-28 items-center justify-center gap-2 rounded-lg bg-wine px-4 py-3 font-semibold text-white hover:bg-wine-dark">
              Voir <span aria-hidden="true">→</span>
            </a>
          </article>
        </section>
      </main>
    </div>
  `,
  styles: `
    .producer-map {
      position: relative;
      min-height: 520px;
      overflow: hidden;
      border: 1px solid #e4e5dc;
      border-radius: 12px;
      background-color: #f1f3e9;
      background-image:
        linear-gradient(25deg, transparent 47%, #fff 48%, #fff 50%, transparent 51%),
        linear-gradient(152deg, transparent 44%, #fff 45%, #fff 47%, transparent 48%),
        linear-gradient(78deg, transparent 39%, #e2ead7 40%, #e2ead7 48%, transparent 49%),
        linear-gradient(5deg, transparent 62%, #fff 63%, #fff 64%, transparent 65%),
        repeating-linear-gradient(0deg, transparent 0 62px, #e1e7d9 63px 64px),
        repeating-linear-gradient(90deg, transparent 0 74px, #e1e7d9 75px 76px);
    }
    .map-city { position: absolute; left: 43%; top: 53%; z-index: 2; padding: 4px 7px; border-radius: 4px; background: #f1f3e9dd; color: #3f4a57; font-weight: 700; }
    .map-radius { position: absolute; left: 50%; top: 50%; width: 58%; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px solid #4e7d3f88; border-radius: 50%; background: #e8f0df35; }
    .map-home { position: absolute; left: 50%; top: 50%; z-index: 3; width: 15px; height: 15px; transform: translate(-50%, -50%); border: 3px solid white; border-radius: 50%; background: #3b82c4; box-shadow: 0 1px 4px #3f4a5780; }
    .map-marker { position: absolute; z-index: 4; width: 27px; height: 31px; transform: translate(-50%, -100%); border: 0; border-radius: 50% 50% 50% 0; background: #64102f; color: white; font-size: 11px; line-height: 27px; text-align: center; cursor: pointer; box-shadow: 0 2px 4px #3f08204a; }
    .map-marker:hover, .map-marker:focus-visible { z-index: 5; background: #3f0820; outline: 2px solid white; }
    .map-empty { position: absolute; inset: auto 16px 16px; z-index: 6; border-radius: 8px; background: white; padding: 10px 12px; color: #3f4a57; font-size: 13px; box-shadow: 0 1px 4px #3f08201a; }
    @media (max-width: 1023px) { .producer-map { min-height: 360px; } }
  `
})
export class MarketplaceComponent implements OnInit {
  produits: Produit[] = [];
  producteurs: ProducteurLocalise[] = [];
  searchInput = '';
  searchTerm = '';
  rayonKm = 10;
  sortBy: 'distance' | 'prix' | 'stock' = 'distance';
  isLoading = false;
  errorMessage = '';
  isLoadingMap = false;
  mapError = '';
  private readonly latitude = 12.3714;
  private readonly longitude = -1.5197;

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit(): void {
    this.loadProduits();
    this.chargerProducteurs();
  }

  get filteredProducts(): Produit[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    const matches = this.produits.filter(produit =>
      !term || `${produit.nomProduit} ${produit.nomExploitation} ${produit.typeProduit}`
        .toLocaleLowerCase()
        .includes(term)
    );
    return matches.sort((left, right) => {
      if (this.sortBy === 'prix') return left.prix - right.prix;
      if (this.sortBy === 'stock') return right.quantiteStock - left.quantiteStock;
      return this.distanceFor(left.producteurId) - this.distanceFor(right.producteurId);
    });
  }

  applySearch(): void {
    this.searchTerm = this.searchInput;
  }

  loadProduits(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.marketplaceService.listerProduits().subscribe({
      next: response => {
        this.produits = response.data.content;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les produits. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
      }
    });
  }

  chargerProducteurs(): void {
    this.isLoadingMap = true;
    this.mapError = '';
    this.marketplaceService.rechercherProducteursParRayon(
      this.latitude,
      this.longitude,
      this.rayonKm
    ).subscribe({
      next: response => {
        this.producteurs = response.data;
        this.isLoadingMap = false;
      },
      error: () => {
        this.mapError = 'Impossible de charger les producteurs autour de cette zone.';
        this.isLoadingMap = false;
      }
    });
  }

  markerStyle(producteur: ProducteurLocalise): Record<string, string> {
    const latitudeDeltaKm = (producteur.latitude - this.latitude) * 111;
    const longitudeDeltaKm = (producteur.longitude - this.longitude) * 111 * Math.cos(this.latitude * Math.PI / 180);
    const scale = Math.max(this.rayonKm, 1);
    const left = Math.max(7, Math.min(93, 50 + longitudeDeltaKm / scale * 43));
    const top = Math.max(8, Math.min(92, 50 - latitudeDeltaKm / scale * 43));
    return { left: `${left}%`, top: `${top}%` };
  }

  producerDistance(producteurId: number): string {
    const producer = this.producteurs.find(item => item.producteurId === producteurId);
    return producer ? `${producer.distanceKm.toFixed(1)} km` : 'Distance indisponible';
  }

  private distanceFor(producteurId: number): number {
    return this.producteurs.find(item => item.producteurId === producteurId)?.distanceKm ?? Number.POSITIVE_INFINITY;
  }

}
