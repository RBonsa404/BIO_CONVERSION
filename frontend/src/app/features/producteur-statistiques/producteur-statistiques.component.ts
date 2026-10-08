import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Commande, MarketplaceService, StatutCommande } from '../../core/services/marketplace.service';
import { PaiementService } from '../../core/services/paiement.service';
import { messageErreur } from '../../core/utils/http-error';
import { libelleCommande } from '../../core/utils/statuts';
import { PageHeaderComponent } from '../../shared/components';

interface Repartition {
  statut: StatutCommande;
  label: string;
  nombre: number;
  part: number;
}

interface VenteProduit {
  nom: string;
  quantite: number;
  montant: number;
}

/* Une commande compte dans les ventes dès qu'elle est réglée */
const STATUTS_VENDUS: readonly StatutCommande[] = ['PAYE', 'EXPEDIE', 'LIVRE'];

@Component({
  selector: 'app-producteur-statistiques',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-5xl">
        <app-page-header surtitre="Espace producteur" titre="Statistiques"
                         sousTitre="Vos ventes et l’activité de vos commandes"></app-page-header>

        @if (isLoading()) {
          <p role="status" class="py-8 text-center text-text">Calcul des statistiques...</p>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="charger()" class="ml-2 font-semibold underline">Réessayer</button>
          </div>
        }

        @if (!isLoading() && !errorMessage()) {
          <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Chiffres clés">
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Chiffre d’affaires encaissé</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ chiffreAffaires() | number:'1.0-0' }} <small class="text-base">FCFA</small></p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Quantité vendue</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ quantiteVendue() | number:'1.0-1' }} <small class="text-base">kg</small></p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Commandes reçues</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ commandes().length }}</p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Panier moyen</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ panierMoyen() | number:'1.0-0' }} <small class="text-base">FCFA</small></p>
            </article>
          </section>

          @if (commandes().length === 0) {
            <p class="rounded-xl border border-line bg-white p-8 text-center text-text">
              Vos statistiques apparaîtront dès votre première commande.
            </p>
          } @else {
            <div class="grid gap-5 lg:grid-cols-2">
              <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
                <h2 class="mb-5 font-serif text-xl font-semibold text-wine">Commandes par statut</h2>
                <ul class="space-y-4">
                  @for (ligne of repartition(); track ligne.statut) {
                    <li>
                      <div class="mb-1 flex justify-between gap-3 text-sm">
                        <span class="text-text">{{ ligne.label }}</span>
                        <span class="font-semibold text-wine">{{ ligne.nombre }}</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-green-soft" role="presentation">
                        <div class="h-full rounded-full bg-green" [style.width.%]="ligne.part"></div>
                      </div>
                    </li>
                  }
                </ul>
              </section>

              <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
                <h2 class="mb-5 font-serif text-xl font-semibold text-wine">Ventes par produit</h2>
                @if (ventesParProduit().length === 0) {
                  <p class="text-text">Aucune vente réglée pour le moment.</p>
                } @else {
                  <table class="w-full text-left text-sm">
                    <thead class="text-text">
                      <tr>
                        <th scope="col" class="pb-3 font-semibold">Produit</th>
                        <th scope="col" class="pb-3 text-right font-semibold">Quantité</th>
                        <th scope="col" class="pb-3 text-right font-semibold">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (vente of ventesParProduit(); track vente.nom) {
                        <tr class="border-t border-line">
                          <td class="py-3 font-medium text-wine">{{ vente.nom }}</td>
                          <td class="py-3 text-right text-text">{{ vente.quantite | number:'1.0-1' }} kg</td>
                          <td class="py-3 text-right font-semibold text-wine">{{ vente.montant | number:'1.0-0' }} FCFA</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </section>
            </div>
          }
        }
      </div>
    </main>
  `
})
export class ProducteurStatistiquesComponent implements OnInit {
  readonly commandes = signal<Commande[]>([]);
  readonly chiffreAffaires = signal(0);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private readonly vendues = computed(() =>
    this.commandes().filter(commande => STATUTS_VENDUS.includes(commande.statut)));

  readonly quantiteVendue = computed(() =>
    this.vendues().reduce((total, commande) =>
      total + commande.lignes.reduce((somme, ligne) => somme + ligne.quantite, 0), 0));

  readonly panierMoyen = computed(() => {
    const vendues = this.vendues();
    return vendues.length === 0
      ? 0
      : vendues.reduce((total, commande) => total + commande.montantTotal, 0) / vendues.length;
  });

  readonly repartition = computed<Repartition[]>(() => {
    const total = this.commandes().length;
    const compteur = new Map<StatutCommande, number>();
    for (const commande of this.commandes()) {
      compteur.set(commande.statut, (compteur.get(commande.statut) ?? 0) + 1);
    }
    return [...compteur.entries()]
      .map(([statut, nombre]) => ({
        statut,
        label: libelleCommande(statut),
        nombre,
        part: total === 0 ? 0 : Math.round(nombre / total * 100)
      }))
      .sort((a, b) => b.nombre - a.nombre);
  });

  readonly ventesParProduit = computed<VenteProduit[]>(() => {
    const ventes = new Map<string, VenteProduit>();
    for (const commande of this.vendues()) {
      for (const ligne of commande.lignes) {
        const vente = ventes.get(ligne.nomProduit) ?? { nom: ligne.nomProduit, quantite: 0, montant: 0 };
        vente.quantite += ligne.quantite;
        vente.montant += ligne.sousTotal;
        ventes.set(ligne.nomProduit, vente);
      }
    }
    return [...ventes.values()].sort((a, b) => b.montant - a.montant);
  });

  constructor(
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      commandes: this.marketplaceService.listerCommandesProducteur(user.idUtilisateur, 0, 500),
      paiements: this.paiementService.totalPaiementsConfirmes(user.idUtilisateur)
    }).subscribe({
      next: result => {
        this.commandes.set(result.commandes.data.content);
        this.chiffreAffaires.set(result.paiements.data);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger les statistiques. Réessayez.'));
        this.isLoading.set(false);
      }
    });
  }
}
