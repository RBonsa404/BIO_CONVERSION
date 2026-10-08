import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MarketplaceService, ProducteurProfile, Produit } from '../../../core/services/marketplace.service';
import { messageErreur } from '../../../core/utils/http-error';
import { libelleTypeProduit } from '../../../core/utils/statuts';

@Component({
  selector: 'app-producteur-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen bg-cream px-5 py-7 md:px-8">
      <div class="mx-auto max-w-7xl">
        <a routerLink="/marketplace" class="mb-5 inline-block font-semibold text-green hover:text-wine">← Retour à la recherche</a>

        @if (isLoading()) {
          <div role="status" class="py-12 text-center text-text">Chargement de la fiche producteur...</div>
        }
        @if (errorMessage()) {
          <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            @if (producteurId !== null) {
              <button type="button" (click)="loadProducteur()" class="ml-3 font-semibold underline">Réessayer</button>
            }
          </div>
        }
        @if (!isLoading() && !errorMessage() && producteur(); as currentProducteur) {
          <section class="mb-8 grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:grid-cols-[minmax(220px,.8fr)_1.2fr]">
            <img src="/larvae-hero.webp" alt="Larves produites dans un panier" class="h-48 w-full object-cover md:h-full">
            <div class="flex flex-col justify-center p-6 md:p-8">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h1 class="font-serif text-3xl font-bold text-wine md:text-4xl">{{ currentProducteur.nomExploitation }}</h1>
                @if (currentProducteur.statut === 'ACTIF') {
                  <span class="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white">✓ Compte validé</span>
                }
              </div>
              <p class="text-lg text-text">
                {{ currentProducteur.prenom }} {{ currentProducteur.nom }}
                @if (currentProducteur.ville) { <span> · {{ currentProducteur.ville }}</span> }
                @if (currentProducteur.province) { <span>, {{ currentProducteur.province }}</span> }
              </p>
              <p class="mt-3 text-sm text-text">Capacité de production : <strong class="text-wine">{{ currentProducteur.capaciteProduction }} kg/mois</strong></p>
            </div>
          </section>

          <section>
            <h2 class="mb-5 font-serif text-3xl font-semibold text-wine">Catalogue disponible</h2>
            @if (!peutCommander()) {
              <p class="mb-4 rounded-xl border border-line bg-white p-4 text-sm text-text">
                La commande est réservée aux comptes éleveurs.
              </p>
            }
            @if (produits().length === 0) {
              <p class="rounded-xl border border-line bg-white p-6 text-text">Aucun produit disponible pour ce producteur.</p>
            }
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              @for (produit of produits(); track produit.idProduit) {
                <article class="grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm sm:grid-cols-[180px_1fr]">
                  <img src="/larvae-hero.webp" alt="" class="h-40 w-full object-cover sm:h-full">
                  <div class="flex flex-col p-4">
                    <p class="text-sm font-semibold text-green">{{ libelleType(produit.typeProduit) }}</p>
                    <h3 class="mt-1 font-serif text-xl font-semibold text-wine">{{ produit.nomProduit }}</h3>
                    <p class="mt-3 text-sm text-text">Stock : {{ produit.quantiteStock }} kg disponibles</p>
                    <p class="mt-2 font-serif text-2xl font-bold text-wine">{{ produit.prix | number:'1.0-0' }} <small class="text-base">FCFA/kg</small></p>
                    @if (produit.quantiteStock <= 0) {
                      <button type="button" disabled class="mt-4 rounded-lg bg-gray-200 py-3 font-medium text-gray-500">Stock épuisé</button>
                    } @else if (peutCommander()) {
                      <a [routerLink]="['/commande']" [queryParams]="{ produitId: produit.idProduit }"
                         class="mt-4 block rounded-lg bg-wine py-3 text-center font-semibold text-white hover:bg-wine-dark">
                        Commander
                      </a>
                    }
                  </div>
                </article>
              }
            </div>
          </section>
        }
      </div>
    </main>
  `
})
export class ProducteurDetailComponent implements OnInit {
  readonly producteur = signal<ProducteurProfile | null>(null);
  readonly produits = signal<Produit[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly peutCommander = computed(() => this.authService.currentUserRole() === 'ELEVEUR');
  producteurId: number | null = null;

  readonly libelleType = libelleTypeProduit;

  constructor(
    private route: ActivatedRoute,
    private marketplaceService: MarketplaceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage.set('Identifiant de producteur invalide.');
      return;
    }
    this.producteurId = id;
    this.loadProducteur();
  }

  loadProducteur(): void {
    if (this.producteurId === null) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      producteur: this.marketplaceService.obtenirProducteur(this.producteurId),
      catalogue: this.marketplaceService.consulterCatalogueProducteur(this.producteurId)
    }).subscribe({
      next: response => {
        this.producteur.set(response.producteur.data);
        this.produits.set(response.catalogue.data);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger cette fiche producteur. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }
}
