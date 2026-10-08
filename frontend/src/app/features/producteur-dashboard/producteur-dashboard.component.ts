import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Capteur, IotService } from '../../core/services/iot.service';
import { Commande, MarketplaceService, Produit } from '../../core/services/marketplace.service';
import { PaiementService } from '../../core/services/paiement.service';
import { messageErreur } from '../../core/utils/http-error';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-producteur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-7xl">
        <app-page-header [titre]="'Bonjour' + (user()?.nomExploitation ? ', ' + user()?.nomExploitation : '')"
                         sousTitre="Votre production fait la différence">
          <span class="hidden rounded-full bg-green-soft px-4 py-2 text-sm font-semibold text-green sm:inline">
            Espace producteur
          </span>
        </app-page-header>

        @if (isLoading()) {
          <div role="status" class="mb-8 rounded-2xl bg-white p-6 text-text">Chargement de votre tableau de bord...</div>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="loadDashboard()" class="ml-3 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-6 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (!isLoading() && loaded()) {
          @if (commandesEnAttente().length > 0) {
            <div class="mb-6 flex items-center gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-xl font-bold" aria-hidden="true">!</span>
              <p class="flex-1"><strong>Nouvelle commande</strong> — {{ commandesEnAttente().length }} commande(s) à confirmer sous 12 h.</p>
            </div>
          }
          @if (capteursEnAlerte() > 0) {
            <a routerLink="/iot" class="mb-6 flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 hover:bg-red-100">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-100 text-xl font-bold" aria-hidden="true">!</span>
              <p class="flex-1"><strong>Alerte capteur</strong> — {{ capteursEnAlerte() }} capteur(s) au-dessus du seuil. Voir les mesures →</p>
            </a>
          }

          <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs">
            <a routerLink="/dashboard/statistiques" class="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-green">
              <p class="mb-2 text-sm text-text">Paiements confirmés</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ totalPaiementsConfirmes() | number:'1.0-0' }} <small class="text-base">FCFA</small></p>
            </a>
            <a routerLink="/dashboard/commandes" class="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-green">
              <p class="mb-2 text-sm text-text">Commandes à traiter</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ commandesATraiter() }}</p>
            </a>
            <a routerLink="/dashboard/produits" class="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-green">
              <p class="mb-2 text-sm text-text">Produits en vente</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ produitsEnVente() }}</p>
            </a>
            <a routerLink="/iot" class="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-green">
              <p class="mb-2 text-sm text-text">Capteurs actifs</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ capteursActifs() }}</p>
            </a>
          </section>

          <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 class="font-serif text-2xl font-semibold text-wine">Commandes en attente de validation</h2>
              <a routerLink="/dashboard/commandes" class="font-semibold text-green hover:underline">Toutes les commandes →</a>
            </div>
            @if (commandesEnAttente().length === 0) {
              <p class="py-6 text-text">Aucune commande en attente de validation.</p>
            }
            @for (commande of commandesEnAttente(); track commande.idCommande) {
              <div class="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-cream/60 p-4">
                <div>
                  <p class="inline-flex rounded-lg bg-green-soft px-3 py-1 font-semibold text-green">{{ commande.numeroCommande }}</p>
                  <p class="mt-2 text-sm text-text">{{ commande.nomEleveur }} · {{ commande.dateCommande | date:'short' }}</p>
                  @for (ligne of commande.lignes; track ligne.idLigne) {
                    <p class="text-sm text-text">{{ ligne.nomProduit }} — {{ ligne.quantite }} kg</p>
                  }
                  <p class="mt-2 font-semibold text-wine">{{ commande.montantTotal | number:'1.0-0' }} FCFA</p>
                </div>
                <div class="flex gap-2">
                  <button type="button" (click)="traiterCommande(commande, true)"
                          [disabled]="processingId() === commande.idCommande"
                          class="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    Valider
                  </button>
                  <button type="button" (click)="traiterCommande(commande, false)"
                          [disabled]="processingId() === commande.idCommande"
                          class="rounded-lg border border-wine bg-white px-5 py-2.5 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                    Refuser
                  </button>
                </div>
              </div>
            }
          </section>
        }
      </div>
    </main>
  `
})
export class ProducteurDashboardComponent implements OnInit {
  readonly commandes = signal<Commande[]>([]);
  readonly produits = signal<Produit[]>([]);
  readonly capteurs = signal<Capteur[]>([]);
  readonly totalPaiementsConfirmes = signal(0);
  readonly isLoading = signal(false);
  readonly loaded = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly processingId = signal<number | null>(null);

  readonly user = computed(() => this.authService.currentUser());
  readonly commandesEnAttente = computed(() => this.commandes().filter(c => c.statut === 'EN_ATTENTE'));
  /* À traiter : à confirmer, ou payées et pas encore expédiées */
  readonly commandesATraiter = computed(() =>
    this.commandes().filter(c => c.statut === 'EN_ATTENTE' || c.statut === 'PAYE').length);
  readonly produitsEnVente = computed(() => this.produits().filter(p => p.disponibilite).length);
  readonly capteursActifs = computed(() => this.capteurs().filter(c => c.estActif).length);
  readonly capteursEnAlerte = computed(() => this.capteurs().filter(c => c.estActif && c.enAlerte).length);

  constructor(
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService,
    private iotService: IotService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      commandes: this.marketplaceService.listerCommandesProducteur(user.idUtilisateur),
      paiements: this.paiementService.totalPaiementsConfirmes(user.idUtilisateur),
      produits: this.marketplaceService.listerMesProduits(),
      // Les capteurs sont un complément : leur indisponibilité ne bloque pas le tableau de bord
      capteurs: this.iotService.listerCapteurs().pipe(catchError(() => of({ data: [] as Capteur[] })))
    }).subscribe({
      next: result => {
        this.commandes.set(result.commandes.data.content);
        this.totalPaiementsConfirmes.set(result.paiements.data);
        this.produits.set(result.produits.data);
        this.capteurs.set(result.capteurs.data);
        this.loaded.set(true);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger le tableau de bord. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  traiterCommande(commande: Commande, approuve: boolean): void {
    this.processingId.set(commande.idCommande);
    this.errorMessage.set('');
    this.actionMessage.set('');
    const request = approuve
      ? this.marketplaceService.confirmerCommande(commande.idCommande)
      : this.marketplaceService.refuserCommande(commande.idCommande);
    request.subscribe({
      next: response => {
        this.commandes.update(list => list.map(item =>
          item.idCommande === commande.idCommande ? response.data : item
        ));
        this.actionMessage.set(approuve
          ? `La commande ${commande.numeroCommande} est validée : l’éleveur peut maintenant la régler.`
          : `La commande ${commande.numeroCommande} a été refusée, le stock est rétabli.`);
        this.processingId.set(null);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error,
          `Impossible de ${approuve ? 'valider' : 'refuser'} la commande ${commande.numeroCommande}. Réessayez.`));
        this.processingId.set(null);
        // Le délai de 12 h a pu faire expirer la commande : on recharge l'état réel
        this.loadDashboard();
      }
    });
  }
}
