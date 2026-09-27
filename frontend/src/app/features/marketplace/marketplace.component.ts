import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketplaceService, Produit } from '../../core/services/marketplace.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream">
      <nav class="bg-white shadow-lg border-b border-line sticky top-0 z-50 px-6 py-5">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/marketplace" class="text-2xl font-serif text-wine font-bold">BioConversion</a>
          <a routerLink="/marketplace" class="text-wine font-semibold">Marketplace</a>
        </div>
      </nav>

      <section class="bg-white border-b border-line">
        <div class="max-w-7xl mx-auto px-6 py-12">
          <h1 class="text-4xl font-serif text-wine font-bold mb-4">Trouvez votre producteur</h1>
          <p class="text-text text-lg mb-8">Produits disponibles auprès des producteurs validés</p>
          <form (ngSubmit)="applySearch()" class="flex gap-4">
            <input
              name="searchTerm"
              [(ngModel)]="searchInput"
              type="search"
              placeholder="Rechercher un produit ou une exploitation..."
              class="flex-1 px-6 py-4 rounded-xl border-2 border-line focus:border-wine focus:outline-none text-text text-lg bg-cream">
            <button type="submit" class="bg-wine text-white px-8 py-4 rounded-xl font-semibold hover:bg-wine-dark">
              Rechercher
            </button>
          </form>
        </div>
      </section>

      <main class="max-w-7xl mx-auto px-6 py-12">
        <div *ngIf="isLoading" role="status" class="text-center text-text py-12">
          Chargement des produits...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadProduits()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <p *ngIf="!isLoading && !errorMessage && filteredProducts.length === 0" class="text-center text-text py-12">
          Aucun produit ne correspond à votre recherche.
        </p>
        <div *ngIf="!isLoading && !errorMessage && filteredProducts.length > 0"
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article *ngFor="let produit of filteredProducts" class="bg-white rounded-3xl shadow-lg p-8 border border-line">
            <p class="text-sm text-green font-semibold mb-2">{{ produit.typeProduit }}</p>
            <h2 class="text-xl font-serif text-wine font-semibold mb-2">{{ produit.nomProduit }}</h2>
            <p class="text-text mb-5">{{ produit.nomExploitation }}</p>
            <div class="flex justify-between items-center py-3 bg-green-soft rounded-xl px-4 mb-6">
              <span class="text-xl font-serif text-wine font-bold">{{ produit.prix | number:'1.0-2' }} FCFA</span>
              <span class="text-text text-sm">Stock : {{ produit.quantiteStock }} kg</span>
            </div>
            <a [routerLink]="['/producteur', produit.producteurId]"
               class="block text-center border-2 border-wine text-wine py-3 rounded-xl font-semibold hover:bg-wine hover:text-white">
              Voir le producteur
            </a>
          </article>
        </div>
      </main>
    </div>
  `
})
export class MarketplaceComponent implements OnInit {
  produits: Produit[] = [];
  searchInput = '';
  searchTerm = '';
  isLoading = false;
  errorMessage = '';

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  get filteredProducts(): Produit[] {
    const term = this.searchTerm.trim().toLocaleLowerCase();
    if (!term) {
      return this.produits;
    }
    return this.produits.filter(produit =>
      `${produit.nomProduit} ${produit.nomExploitation} ${produit.typeProduit}`
        .toLocaleLowerCase()
        .includes(term)
    );
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
}
