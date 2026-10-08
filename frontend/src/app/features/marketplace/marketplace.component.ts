import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MarketplaceService, ProducteurLocalise, Produit } from '../../core/services/marketplace.service';
import { messageErreur } from '../../core/utils/http-error';
import { libelleTypeProduit } from '../../core/utils/statuts';
import { obtenirPosition } from '../../core/utils/validators';

/* Centre de Ouagadougou : point de départ tant que la position de l'utilisateur est inconnue */
const OUAGADOUGOU = { latitude: 12.3714, longitude: -1.5197 };

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream">
      <section class="px-5 pt-6 md:px-8">
        <p class="mb-4 text-center font-script text-xl italic text-green md:text-2xl">❧ &nbsp; Trouvez le producteur le plus proche de chez vous &nbsp; ❧</p>
        <div class="mx-auto max-w-7xl">
          <form (ngSubmit)="applySearch()" class="flex flex-col gap-3 md:flex-row">
            <label class="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-white px-5 py-3">
              <span class="text-2xl text-green" aria-hidden="true">⌕</span>
              <span class="sr-only">Rechercher</span>
              <input name="searchTerm" [(ngModel)]="searchInput" (ngModelChange)="searchTerm.set($event)" type="search"
                     placeholder="Rechercher un producteur ou un produit..."
                     class="w-full border-0 bg-transparent text-text outline-none">
            </label>
            <label class="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-text">
              <span class="whitespace-nowrap">Trier par :</span>
              <select name="sort" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)" class="min-w-32 bg-transparent font-medium outline-none">
                <option value="distance">distance</option>
                <option value="prix">prix</option>
                <option value="stock">stock</option>
              </select>
            </label>
          </form>
          <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-text">
            <label for="rayon" class="font-medium">Rayon de recherche</label>
            <input id="rayon" name="rayon" type="range" min="5" max="150" step="5"
                   [ngModel]="rayonKm()" (ngModelChange)="rayonKm.set($event)" (change)="chargerProducteurs()"
                   class="min-w-40 flex-1 accent-green">
            <span class="min-w-16 font-semibold">{{ rayonKm() }} km</span>
            <button type="button" (click)="utiliserMaPosition()" [disabled]="isLocating()"
                    class="rounded-lg border border-green px-3 py-2 font-semibold text-green hover:bg-green-soft disabled:opacity-50">
              {{ isLocating() ? 'Localisation...' : 'Autour de ma position' }}
            </button>
          </div>
          @if (positionMessage()) {
            <p class="mt-2 text-sm text-text" role="status">{{ positionMessage() }}</p>
          }
        </div>
      </section>

      <main class="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-5 md:px-8 lg:grid-cols-[.85fr_1.15fr]">
        <section class="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <h1 class="font-serif text-xl font-semibold text-green">Carte des producteurs</h1>
          <p class="mb-3 text-sm text-text">
            {{ producteurs().length }} producteur(s) dans un rayon de {{ rayonKm() }} km autour de {{ centreLabel() }}
          </p>
          <div class="producer-map" role="group" aria-label="Emplacements des producteurs autour de la zone de recherche">
            <span class="map-city">{{ centreLabel() }}</span>
            <span class="map-radius" aria-hidden="true"></span>
            <span class="map-home" [title]="centreLabel()" aria-label="Centre de la recherche"></span>
            @for (producteur of producteurs(); track producteur.producteurId) {
              <a class="map-marker"
                 [ngStyle]="markerStyle(producteur)"
                 [attr.aria-label]="'Producteur ' + producteur.nomExploitation"
                 [title]="producteur.nomExploitation + ' · ' + (producteur.distanceKm | number:'1.0-1') + ' km'"
                 [routerLink]="['/producteur', producteur.producteurId]">●</a>
            }
            @if (!isLoadingMap() && !mapError() && producteurs().length === 0) {
              <div class="map-empty">Aucun producteur dans ce rayon. Élargissez la recherche.</div>
            }
            @if (isLoadingMap()) {
              <div class="map-empty" role="status">Recherche des producteurs...</div>
            }
            @if (mapError()) {
              <div class="map-empty text-red-700" role="alert">
                {{ mapError() }}
                <button type="button" (click)="chargerProducteurs()" class="ml-2 underline">Réessayer</button>
              </div>
            }
          </div>
          <p class="mt-3 text-xs text-text">Vue schématique : les repères sont placés d’après les coordonnées GPS des exploitations.</p>
        </section>

        <section aria-label="Produits disponibles" class="space-y-3">
          @if (isLoading()) {
            <div role="status" class="rounded-xl bg-white p-6 text-center text-text">Chargement des produits...</div>
          }
          @if (errorMessage()) {
            <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {{ errorMessage() }}
              <button type="button" (click)="loadProduits()" class="ml-3 font-semibold underline">Réessayer</button>
            </div>
          }
          @if (!isLoading() && !errorMessage() && filteredProducts().length === 0) {
            <p class="rounded-xl bg-white p-8 text-center text-text">Aucun produit ne correspond à votre recherche.</p>
          }
          @for (produit of filteredProducts(); track produit.idProduit) {
            <article class="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-3 shadow-sm sm:flex-nowrap">
              <img src="/larvae-hero.webp" alt="" class="h-28 w-36 shrink-0 rounded-lg object-cover">
              <div class="min-w-0 flex-1">
                <h2 class="font-serif text-xl font-semibold text-wine">{{ produit.nomExploitation }}</h2>
                <p class="mt-1 text-sm text-text">{{ produit.nomProduit }} · {{ libelleType(produit.typeProduit) }}</p>
                <p class="mt-2 text-sm text-text">
                  {{ producerDistance(produit.producteurId) }}
                  <span class="mx-2 text-line">·</span>
                  <span class="font-medium">Stock :</span>
                  <span [ngClass]="produit.quantiteStock > 0 ? 'text-green' : 'text-red-700'">
                    {{ produit.quantiteStock > 0 ? produit.quantiteStock + ' kg' : 'épuisé' }}
                  </span>
                </p>
                <p class="mt-1 font-serif text-2xl font-bold text-wine">{{ produit.prix | number:'1.0-0' }} <small class="text-base">FCFA/kg</small></p>
              </div>
              <a [routerLink]="['/producteur', produit.producteurId]"
                 class="flex min-w-28 items-center justify-center gap-2 rounded-lg bg-wine px-4 py-3 font-semibold text-white hover:bg-wine-dark">
                Voir <span aria-hidden="true">→</span>
              </a>
            </article>
          }
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
    .map-city { position: absolute; left: 50%; top: 54%; z-index: 2; transform: translateX(-50%); padding: 4px 7px; border-radius: 4px; background: #f1f3e9dd; color: #3f4a57; font-weight: 700; white-space: nowrap; }
    .map-radius { position: absolute; left: 50%; top: 50%; width: 86%; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px solid #4e7d3f88; border-radius: 50%; background: #e8f0df35; }
    .map-home { position: absolute; left: 50%; top: 50%; z-index: 3; width: 15px; height: 15px; transform: translate(-50%, -50%); border: 3px solid white; border-radius: 50%; background: #3b82c4; box-shadow: 0 1px 4px #3f4a5780; }
    .map-marker { position: absolute; z-index: 4; width: 27px; height: 31px; transform: translate(-50%, -100%); border: 0; border-radius: 50% 50% 50% 0; background: #64102f; color: white; font-size: 11px; line-height: 27px; text-align: center; text-decoration: none; cursor: pointer; box-shadow: 0 2px 4px #3f08204a; }
    .map-marker:hover, .map-marker:focus-visible { z-index: 5; background: #3f0820; outline: 2px solid white; }
    .map-empty { position: absolute; inset: auto 16px 16px; z-index: 6; border-radius: 8px; background: white; padding: 10px 12px; color: #3f4a57; font-size: 13px; box-shadow: 0 1px 4px #3f08201a; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
    @media (max-width: 1023px) { .producer-map { min-height: 360px; } }
  `
})
export class MarketplaceComponent implements OnInit {
  readonly produits = signal<Produit[]>([]);
  readonly producteurs = signal<ProducteurLocalise[]>([]);
  readonly searchTerm = signal('');
  readonly rayonKm = signal(50);
  readonly sortBy = signal<'distance' | 'prix' | 'stock'>('distance');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly isLoadingMap = signal(false);
  readonly mapError = signal('');
  readonly isLocating = signal(false);
  readonly positionMessage = signal('');
  readonly centreLabel = signal('Ouagadougou');

  searchInput = '';
  private centre = { ...OUAGADOUGOU };

  readonly libelleType = libelleTypeProduit;

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const sortBy = this.sortBy();
    const distances = new Map(this.producteurs().map(p => [p.producteurId, p.distanceKm]));
    const distance = (id: number) => distances.get(id) ?? Number.POSITIVE_INFINITY;

    return this.produits()
      .filter(produit =>
        !term || `${produit.nomProduit} ${produit.nomExploitation} ${libelleTypeProduit(produit.typeProduit)}`
          .toLocaleLowerCase()
          .includes(term))
      .sort((left, right) => {
        if (sortBy === 'prix') return left.prix - right.prix;
        if (sortBy === 'stock') return right.quantiteStock - left.quantiteStock;
        return distance(left.producteurId) - distance(right.producteurId);
      });
  });

  constructor(
    private marketplaceService: MarketplaceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Position enregistrée sur le profil (éleveur ou producteur), si elle existe
    const user = this.authService.getCurrentUser();
    if (user?.latitude != null && user?.longitude != null) {
      this.centre = { latitude: user.latitude, longitude: user.longitude };
      this.centreLabel.set(user.ville || 'votre position');
    }
    this.loadProduits();
    this.chargerProducteurs();
  }

  applySearch(): void {
    this.searchTerm.set(this.searchInput);
  }

  utiliserMaPosition(): void {
    this.isLocating.set(true);
    this.positionMessage.set('');
    obtenirPosition()
      .then(position => {
        this.centre = position;
        this.centreLabel.set('votre position');
        this.chargerProducteurs();
      })
      .catch((message: string) => this.positionMessage.set(message))
      .finally(() => this.isLocating.set(false));
  }

  loadProduits(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.listerProduits().subscribe({
      next: response => {
        this.produits.set(response.data.content);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger les produits. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  chargerProducteurs(): void {
    this.isLoadingMap.set(true);
    this.mapError.set('');
    this.marketplaceService.rechercherProducteursParRayon(
      this.centre.latitude,
      this.centre.longitude,
      this.rayonKm()
    ).subscribe({
      next: response => {
        this.producteurs.set(response.data);
        this.isLoadingMap.set(false);
      },
      error: error => {
        this.mapError.set(messageErreur(error, 'Impossible de charger les producteurs autour de cette zone.'));
        this.isLoadingMap.set(false);
      }
    });
  }

  /** Place un repère : le bord du cercle correspond au rayon de recherche. */
  markerStyle(producteur: ProducteurLocalise): Record<string, string> {
    const latitudeDeltaKm = (producteur.latitude - this.centre.latitude) * 111;
    const longitudeDeltaKm = (producteur.longitude - this.centre.longitude) * 111
      * Math.cos(this.centre.latitude * Math.PI / 180);
    const scale = Math.max(this.rayonKm(), 1);
    const left = Math.max(5, Math.min(95, 50 + longitudeDeltaKm / scale * 43));
    const top = Math.max(8, Math.min(95, 50 - latitudeDeltaKm / scale * 43));
    return { left: `${left}%`, top: `${top}%` };
  }

  producerDistance(producteurId: number): string {
    const producer = this.producteurs().find(item => item.producteurId === producteurId);
    return producer
      ? `à ${producer.distanceKm.toFixed(1)} km`
      : `hors du rayon de ${this.rayonKm()} km`;
  }
}
