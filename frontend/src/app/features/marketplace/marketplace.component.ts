import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import * as L from 'leaflet';
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
          <div class="producer-map">
            <div #carte class="leaflet-host" role="region" aria-label="Carte des producteurs autour de la zone de recherche"></div>
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
          <p class="mt-3 text-xs text-text">Cliquez sur un repère pour voir le producteur. Fond de carte © OpenStreetMap.</p>
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
    .producer-map { position: relative; height: 520px; overflow: hidden; border: 1px solid #e4e5dc; border-radius: 12px; background: #f1f3e9; }
    .leaflet-host { position: absolute; inset: 0; z-index: 1; }
    .map-empty { position: absolute; inset: auto 16px 16px; z-index: 1000; border-radius: 8px; background: white; padding: 10px 12px; color: #3f4a57; font-size: 13px; box-shadow: 0 1px 4px #3f08201a; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
    @media (max-width: 1023px) { .producer-map { height: 360px; } }
  `
})
export class MarketplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('carte', { static: true }) private carteElement!: ElementRef<HTMLDivElement>;

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

  /* Carte Leaflet (fond OpenStreetMap, gratuit) et calque des repères redessiné à chaque recherche */
  private carte?: L.Map;
  private calqueRecherche = L.layerGroup();

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
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
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

  ngAfterViewInit(): void {
    // Leaflet écoute la souris en permanence : on le sort de la détection de changements d'Angular
    this.zone.runOutsideAngular(() => {
      this.carte = L.map(this.carteElement.nativeElement, { scrollWheelZoom: false })
        .setView([this.centre.latitude, this.centre.longitude], 9);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.carte);
      this.calqueRecherche.addTo(this.carte);
    });
    this.dessinerCarte();
  }

  ngOnDestroy(): void {
    this.carte?.remove();
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
        this.dessinerCarte();
      },
      error: error => {
        this.mapError.set(messageErreur(error, 'Impossible de charger les producteurs autour de cette zone.'));
        this.isLoadingMap.set(false);
      }
    });
  }

  /** Redessine le cercle de recherche, le centre et un repère par producteur trouvé. */
  private dessinerCarte(): void {
    const carte = this.carte;
    if (!carte) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.calqueRecherche.clearLayers();
      const centre = L.latLng(this.centre.latitude, this.centre.longitude);

      L.circle(centre, {
        radius: this.rayonKm() * 1000,
        color: '#4e7d3f',
        weight: 1,
        fillColor: '#e8f0df',
        fillOpacity: 0.25
      }).addTo(this.calqueRecherche);

      L.circleMarker(centre, { radius: 7, color: '#ffffff', weight: 3, fillColor: '#3b82c4', fillOpacity: 1 })
        .bindTooltip(this.texte(this.centreLabel()))
        .addTo(this.calqueRecherche);

      for (const producteur of this.producteurs()) {
        L.circleMarker([producteur.latitude, producteur.longitude], {
          radius: 9, color: '#ffffff', weight: 2, fillColor: '#64102f', fillOpacity: 1
        })
          .bindTooltip(this.texte(`${producteur.nomExploitation} · ${producteur.distanceKm.toFixed(1)} km`))
          .on('click', () => this.zone.run(() => this.router.navigate(['/producteur', producteur.producteurId])))
          .addTo(this.calqueRecherche);
      }

      // Cadre la carte sur le cercle de recherche (toBounds attend un diamètre en mètres)
      carte.fitBounds(centre.toBounds(this.rayonKm() * 2000), { padding: [12, 12] });
    });
  }

  /** Texte des info-bulles : passé comme élément pour qu'un nom ne soit jamais interprété comme du HTML. */
  private texte(contenu: string): HTMLElement {
    const element = document.createElement('span');
    element.textContent = contenu;
    return element;
  }

  producerDistance(producteurId: number): string {
    const producer = this.producteurs().find(item => item.producteurId === producteurId);
    return producer
      ? `à ${producer.distanceKm.toFixed(1)} km`
      : `hors du rayon de ${this.rayonKm()} km`;
  }
}
