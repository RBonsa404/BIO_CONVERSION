import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Commande, MarketplaceService, StatutCommande } from '../../../core/services/marketplace.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { messageErreur } from '../../../core/utils/http-error';
import { STATUTS_COMMANDE_ACTIFS, libelleCommande, libellePaiement, varianteCommande } from '../../../core/utils/statuts';
import { PageHeaderComponent, UiBadgeComponent } from '../../../shared/components';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, UiBadgeComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-5xl">
        <app-page-header surtitre="Espace éleveur" titre="Mes commandes"
                         sousTitre="Commandes en cours : validation, paiement et livraison">
          <a routerLink="/marketplace" class="font-semibold text-green hover:underline">Rechercher des produits</a>
        </app-page-header>

        @if (isLoading()) {
          <p role="status" class="py-8 text-center text-text">Chargement des commandes...</p>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="loadCommandes()" class="ml-2 font-semibold underline">Actualiser</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }
        @if (!isLoading() && !errorMessage() && commandes().length === 0) {
          <p class="rounded-xl border border-line bg-white p-8 text-center text-text">
            Aucune commande en cours. Vos commandes terminées sont dans
            <a routerLink="/historique" class="font-semibold text-green underline">l’historique</a>.
          </p>
        }

        <div class="space-y-4">
          @for (commande of commandes(); track commande.idCommande) {
            <article class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="font-serif text-xl font-semibold text-wine">{{ commande.numeroCommande }}</h2>
                  <p class="mt-1 text-sm text-text">{{ commande.nomExploitation }} · {{ commande.dateCommande | date:'d MMM y, HH:mm' }}</p>
                  @if (commande.telephoneProducteur) {
                    <a [href]="'tel:' + commande.telephoneProducteur" class="text-sm font-medium text-green hover:underline">
                      {{ commande.telephoneProducteur }}
                    </a>
                  }
                </div>
                <app-ui-badge [variant]="variante(commande.statut)">{{ libelle(commande.statut) }}</app-ui-badge>
              </div>

              <div class="mt-4 space-y-1 border-t border-line pt-3">
                @for (ligne of commande.lignes; track ligne.idLigne) {
                  <p class="text-sm text-text">{{ ligne.nomProduit }} · {{ ligne.quantite }} kg × {{ ligne.prixUnitaireFige | number:'1.0-0' }} FCFA</p>
                }
                <p class="pt-2 font-semibold text-wine">{{ commande.montantTotal | number:'1.0-0' }} FCFA</p>
              </div>

              <div class="mt-4">
                @switch (commande.statut) {
                  @case ('EN_ATTENTE') {
                    <p class="mb-3 text-sm text-text">Le producteur dispose de 12 heures pour valider votre commande.</p>
                    <button type="button" (click)="annuler(commande)" [disabled]="processingId() === commande.idCommande"
                            class="rounded-lg border border-wine bg-white px-5 py-2.5 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                      Annuler la commande
                    </button>
                  }
                  @case ('CONFIRME') {
                    @if (commande.statutPaiement === 'EN_ATTENTE') {
                      <div class="rounded-xl border border-amber-300 bg-amber-50 p-4">
                        <p class="font-semibold text-amber-800">Paiement Orange Money en attente de confirmation</p>
                        @if (simulation()) {
                          <p class="mt-1 text-sm text-amber-800">
                            Mode démonstration : la réponse de l’opérateur est simulée, aucun débit réel n’a lieu.
                          </p>
                          <div class="mt-3 flex flex-wrap gap-2">
                            <button type="button" (click)="simuler(commande, true)" [disabled]="processingId() === commande.idCommande"
                                    class="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                              Simuler la confirmation du paiement
                            </button>
                            <button type="button" (click)="simuler(commande, false)" [disabled]="processingId() === commande.idCommande"
                                    class="rounded-lg border border-wine bg-white px-5 py-2.5 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                              Simuler un échec
                            </button>
                          </div>
                        } @else {
                          <p class="mt-1 text-sm text-amber-800">Validez la demande sur votre téléphone, puis actualisez cette page.</p>
                          <button type="button" (click)="loadCommandes()"
                                  class="mt-3 rounded-lg bg-wine px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine-dark">
                            Actualiser
                          </button>
                        }
                      </div>
                    } @else {
                      @if (commande.statutPaiement === 'ECHOUE') {
                        <p class="mb-3 text-sm text-red-700" role="alert">Le dernier paiement a échoué. Vous pouvez réessayer.</p>
                      } @else {
                        <p class="mb-3 text-sm text-text">Le producteur a validé votre commande : il ne reste qu’à la régler.</p>
                      }
                      <div class="flex flex-wrap gap-2">
                        <button type="button" (click)="payer(commande)" [disabled]="processingId() === commande.idCommande"
                                class="rounded-lg bg-wine px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine-dark disabled:opacity-50">
                          Payer {{ commande.montantTotal | number:'1.0-0' }} FCFA avec Orange Money
                        </button>
                        <button type="button" (click)="annuler(commande)" [disabled]="processingId() === commande.idCommande"
                                class="rounded-lg border border-wine bg-white px-5 py-2.5 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                          Annuler la commande
                        </button>
                      </div>
                    }
                  }
                  @case ('PAYE') {
                    <p class="mb-3 text-sm text-text">Paiement {{ libellePaiement(commande.statutPaiement) | lowercase }}. Le producteur prépare l’expédition.</p>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" (click)="telechargerFacture(commande)" [disabled]="processingId() === commande.idCommande"
                              class="rounded-lg border border-green bg-white px-5 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                        Télécharger la facture
                      </button>
                      <button type="button" (click)="imprimerFacture(commande)" [disabled]="processingId() === commande.idCommande"
                              class="rounded-lg border border-green bg-white px-5 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                        Imprimer la facture
                      </button>
                    </div>
                  }
                  @case ('EXPEDIE') {
                    <p class="mb-3 text-sm text-text">Votre commande est en route. Confirmez sa réception à l’arrivée.</p>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" (click)="confirmerReception(commande)" [disabled]="processingId() === commande.idCommande"
                              class="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                        Confirmer la réception
                      </button>
                      <button type="button" (click)="telechargerFacture(commande)" [disabled]="processingId() === commande.idCommande"
                              class="rounded-lg border border-green bg-white px-5 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                        Télécharger la facture
                      </button>
                      <button type="button" (click)="imprimerFacture(commande)" [disabled]="processingId() === commande.idCommande"
                              class="rounded-lg border border-green bg-white px-5 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                        Imprimer la facture
                      </button>
                    </div>
                  }
                }
              </div>
            </article>
          }
        </div>
      </div>
    </main>
  `
})
export class MesCommandesComponent implements OnInit {
  private readonly toutes = signal<Commande[]>([]);
  readonly commandes = computed(() => {
    const actifs: readonly StatutCommande[] = STATUTS_COMMANDE_ACTIFS;
    return this.toutes().filter(commande => actifs.includes(commande.statut));
  });
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly processingId = signal<number | null>(null);
  /* Vrai tant que l'agrégateur Orange Money n'est pas branché côté serveur */
  readonly simulation = signal(false);

  readonly libelle = libelleCommande;
  readonly variante = varianteCommande;
  readonly libellePaiement = libellePaiement;

  constructor(
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    this.paiementService.simulationActive()
      .pipe(catchError(() => of(false)))
      .subscribe(active => this.simulation.set(active));
    this.loadCommandes();
  }

  loadCommandes(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.listerCommandesEleveur(user.idUtilisateur).subscribe({
      next: response => {
        this.toutes.set(response.data.content);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger vos commandes. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  payer(commande: Commande): void {
    this.debuter(commande);
    this.paiementService.initierPaiement(commande.idCommande, 'ORANGE_MONEY').subscribe({
      next: response => {
        this.remplacer({ ...commande, statutPaiement: response.data.statutPaiement });
        this.actionMessage.set(`Demande de paiement envoyée pour la commande ${commande.numeroCommande}.`);
        this.processingId.set(null);
      },
      error: error => this.echec(error, 'Le paiement n’a pas pu être initié. Réessayez.')
    });
  }

  simuler(commande: Commande, succes: boolean): void {
    this.debuter(commande);
    this.paiementService.simulerReponseOperateur(commande.idCommande, succes).subscribe({
      next: () => {
        this.actionMessage.set(succes
          ? `Paiement confirmé pour la commande ${commande.numeroCommande}. Votre facture est disponible.`
          : `Le paiement de la commande ${commande.numeroCommande} a échoué. Vous pouvez réessayer.`);
        this.processingId.set(null);
        // Statut de commande, paiement et facture changent ensemble : on relit l'état serveur
        this.loadCommandes();
      },
      error: error => this.echec(error, 'La confirmation du paiement a échoué. Réessayez.')
    });
  }

  annuler(commande: Commande): void {
    if (!window.confirm(`Annuler la commande ${commande.numeroCommande} ?`)) {
      return;
    }
    this.debuter(commande);
    this.marketplaceService.annulerCommande(commande.idCommande, 'Annulation par l’éleveur').subscribe({
      next: response => {
        this.remplacer(response.data);
        this.actionMessage.set(`La commande ${commande.numeroCommande} est annulée.`);
        this.processingId.set(null);
      },
      error: error => this.echec(error, 'La commande n’a pas pu être annulée.')
    });
  }

  confirmerReception(commande: Commande): void {
    this.debuter(commande);
    this.marketplaceService.changerStatutCommande(commande.idCommande, 'LIVRE').subscribe({
      next: response => {
        this.remplacer(response.data);
        this.actionMessage.set(`Réception confirmée : la commande ${commande.numeroCommande} rejoint votre historique.`);
        this.processingId.set(null);
      },
      error: error => this.echec(error, 'La réception n’a pas pu être confirmée. Réessayez.')
    });
  }

  telechargerFacture(commande: Commande): void {
    this.debuter(commande);
    this.paiementService.telechargerFacture(commande.idCommande, commande.numeroCommande).subscribe({
      next: () => this.processingId.set(null),
      error: () => this.echec(null, `La facture de la commande ${commande.numeroCommande} n’a pas pu être téléchargée.`)
    });
  }

  imprimerFacture(commande: Commande): void {
    this.debuter(commande);
    this.paiementService.imprimerFacture(commande.idCommande).subscribe({
      next: () => this.processingId.set(null),
      error: () => this.echec(null, `La facture de la commande ${commande.numeroCommande} n’a pas pu être imprimée.`)
    });
  }

  private debuter(commande: Commande): void {
    this.processingId.set(commande.idCommande);
    this.errorMessage.set('');
    this.actionMessage.set('');
  }

  private echec(error: unknown, repli: string): void {
    this.errorMessage.set(messageErreur(error, repli));
    this.processingId.set(null);
  }

  private remplacer(commande: Commande): void {
    this.toutes.update(list => list.map(item => item.idCommande === commande.idCommande ? commande : item));
  }
}