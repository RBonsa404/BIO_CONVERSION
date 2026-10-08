import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Commande, MarketplaceService, StatutCommande } from '../../../core/services/marketplace.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { messageErreur } from '../../../core/utils/http-error';
import { STATUTS_COMMANDE_ACTIFS, libelleCommande, libellePaiement, varianteCommande } from '../../../core/utils/statuts';
import { PageHeaderComponent, UiBadgeComponent } from '../../../shared/components';

@Component({
  selector: 'app-historique-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, UiBadgeComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-5xl">
        <app-page-header surtitre="Espace éleveur" titre="Historique des commandes"
                         sousTitre="Commandes livrées, annulées, refusées ou expirées"></app-page-header>

        @if (isLoading()) {
          <p role="status" class="py-8 text-center text-text">Chargement de l’historique...</p>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="loadCommandes()" class="ml-2 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (!isLoading() && !errorMessage() && commandes().length === 0) {
          <p class="rounded-xl border border-line bg-white p-8 text-center text-text">
            Aucune commande terminée pour le moment. Vos commandes en cours sont dans
            <a routerLink="/mes-commandes" class="font-semibold text-green underline">Mes commandes</a>.
          </p>
        }

        <div class="space-y-4">
          @for (commande of commandes(); track commande.idCommande) {
            <article class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="font-serif text-xl font-semibold text-wine">{{ commande.numeroCommande }}</h2>
                  <p class="mt-1 text-sm text-text">{{ commande.nomExploitation }} · {{ commande.dateCommande | date:'d MMM y' }}</p>
                </div>
                <app-ui-badge [variant]="variante(commande.statut)">{{ libelle(commande.statut) }}</app-ui-badge>
              </div>
              <div class="mt-4 space-y-1 border-t border-line pt-3">
                @for (ligne of commande.lignes; track ligne.idLigne) {
                  <p class="text-sm text-text">{{ ligne.nomProduit }} · {{ ligne.quantite }} kg</p>
                }
                <p class="pt-2 font-semibold text-wine">{{ commande.montantTotal | number:'1.0-0' }} FCFA</p>
                @if (commande.statutPaiement) {
                  <p class="text-sm text-text">Paiement : {{ libellePaiement(commande.statutPaiement) }}</p>
                }
              </div>
              @if (commande.referenceFacture) {
                <button type="button" (click)="telechargerFacture(commande)" [disabled]="processingId() === commande.idCommande"
                        class="mt-4 rounded-lg border border-green bg-white px-5 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                  Télécharger la facture
                </button>
              }
            </article>
          }
        </div>
      </div>
    </main>
  `
})
export class HistoriqueComponent implements OnInit {
  private readonly toutes = signal<Commande[]>([]);
  readonly commandes = computed(() => {
    const actifs: readonly StatutCommande[] = STATUTS_COMMANDE_ACTIFS;
    return this.toutes().filter(commande => !actifs.includes(commande.statut));
  });
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly processingId = signal<number | null>(null);

  readonly libelle = libelleCommande;
  readonly variante = varianteCommande;
  readonly libellePaiement = libellePaiement;

  constructor(
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.listerCommandesEleveur(user.idUtilisateur, 0, 500).subscribe({
      next: response => {
        this.toutes.set(response.data.content);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger votre historique. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  telechargerFacture(commande: Commande): void {
    this.processingId.set(commande.idCommande);
    this.errorMessage.set('');
    this.paiementService.telechargerFacture(commande.idCommande, commande.numeroCommande).subscribe({
      next: () => this.processingId.set(null),
      error: () => {
        this.errorMessage.set(`La facture de la commande ${commande.numeroCommande} n’a pas pu être téléchargée.`);
        this.processingId.set(null);
      }
    });
  }
}
