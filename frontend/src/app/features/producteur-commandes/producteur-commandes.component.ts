import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { Commande, MarketplaceService, StatutCommande } from '../../core/services/marketplace.service';
import { PaiementService } from '../../core/services/paiement.service';
import { messageErreur } from '../../core/utils/http-error';
import { STATUTS_COMMANDE_ACTIFS, libelleCommande, libellePaiement, varianteCommande } from '../../core/utils/statuts';
import { PageHeaderComponent, UiBadgeComponent } from '../../shared/components';

type Filtre = 'actives' | 'terminees' | 'toutes';

@Component({
  selector: 'app-producteur-commandes',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, UiBadgeComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-5xl">
        <app-page-header surtitre="Espace producteur" titre="Commandes reçues"
                         sousTitre="Validez, expédiez et suivez les commandes des éleveurs"></app-page-header>

        <div class="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les commandes">
          @for (option of filtres; track option.valeur) {
            <button type="button" role="tab" [attr.aria-selected]="filtre() === option.valeur"
                    (click)="filtre.set(option.valeur)"
                    class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                    [ngClass]="filtre() === option.valeur ? 'border-wine bg-wine text-white' : 'border-line bg-white text-text hover:border-wine'">
              {{ option.label }} ({{ compter(option.valeur) }})
            </button>
          }
        </div>

        @if (isLoading()) {
          <p role="status" class="py-8 text-center text-text">Chargement des commandes...</p>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="loadCommandes()" class="ml-2 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }
        @if (!isLoading() && !errorMessage() && commandesFiltrees().length === 0) {
          <p class="rounded-xl border border-line bg-white p-8 text-center text-text">Aucune commande dans cette catégorie.</p>
        }

        <div class="space-y-4">
          @for (commande of commandesFiltrees(); track commande.idCommande) {
            <article class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="font-serif text-xl font-semibold text-wine">{{ commande.numeroCommande }}</h2>
                  <p class="mt-1 text-sm text-text">
                    {{ commande.nomEleveur }} · {{ commande.dateCommande | date:'d MMM y, HH:mm' }}
                  </p>
                  @if (commande.telephoneEleveur) {
                    <a [href]="'tel:' + commande.telephoneEleveur" class="text-sm font-medium text-green hover:underline">
                      {{ commande.telephoneEleveur }}
                    </a>
                  }
                </div>
                <app-ui-badge [variant]="variante(commande.statut)">{{ libelle(commande.statut) }}</app-ui-badge>
              </div>

              <div class="mt-4 space-y-1 border-t border-line pt-3">
                @for (ligne of commande.lignes; track ligne.idLigne) {
                  <p class="text-sm text-text">
                    {{ ligne.nomProduit }} · {{ ligne.quantite }} kg × {{ ligne.prixUnitaireFige | number:'1.0-0' }} FCFA
                  </p>
                }
                <p class="pt-2 font-semibold text-wine">{{ commande.montantTotal | number:'1.0-0' }} FCFA</p>
                @if (commande.statutPaiement) {
                  <p class="text-sm text-text">
                    Paiement : {{ libellePaiement(commande.statutPaiement) }}
                    @if (commande.operateurPaiement === 'ESPECES') { (espèces) }
                    @if (commande.operateurPaiement === 'ORANGE_MONEY') { (Orange Money) }
                  </p>
                }
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                @switch (commande.statut) {
                  @case ('EN_ATTENTE') {
                    <button type="button" (click)="agir(commande, 'confirmer')" [disabled]="processingId() === commande.idCommande"
                            class="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Valider</button>
                    <button type="button" (click)="agir(commande, 'refuser')" [disabled]="processingId() === commande.idCommande"
                            class="rounded-lg border border-wine bg-white px-5 py-2.5 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">Refuser</button>
                  }
                  @case ('CONFIRME') {
                    @if (commande.statutPaiement === 'EN_ATTENTE' && commande.operateurPaiement === 'ESPECES') {
                      <div class="w-full rounded-xl border border-amber-300 bg-amber-50 p-4">
                        <p class="text-sm text-amber-800">
                          L’éleveur a choisi de payer en espèces. Confirmez dès que vous avez reçu
                          {{ commande.montantTotal | number:'1.0-0' }} FCFA : la facture sera alors générée.
                        </p>
                        <button type="button" (click)="confirmerEncaissement(commande)" [disabled]="processingId() === commande.idCommande"
                                class="mt-3 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                          Confirmer l’encaissement de {{ commande.montantTotal | number:'1.0-0' }} FCFA
                        </button>
                      </div>
                    } @else {
                      <p class="text-sm text-text">En attente du règlement de l’éleveur.</p>
                    }
                  }
                  @case ('PAYE') {
                    <button type="button" (click)="agir(commande, 'expedier')" [disabled]="processingId() === commande.idCommande"
                            class="rounded-lg bg-wine px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine-dark disabled:opacity-50">Marquer comme expédiée</button>
                  }
                  @case ('EXPEDIE') {
                    <button type="button" (click)="agir(commande, 'livrer')" [disabled]="processingId() === commande.idCommande"
                            class="rounded-lg bg-wine px-5 py-2.5 text-sm font-semibold text-white hover:bg-wine-dark disabled:opacity-50">Marquer comme livrée</button>
                  }
                }
                @if (factureDisponible(commande)) {
                  <button type="button" (click)="telechargerFacture(commande)" [disabled]="processingId() === commande.idCommande"
                          class="rounded-lg border border-green bg-white px-5 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">Télécharger la facture</button>
                }
              </div>
            </article>
          }
        </div>
      </div>
    </main>
  `
})
export class ProducteurCommandesComponent implements OnInit {
  readonly filtres: { valeur: Filtre; label: string }[] = [
    { valeur: 'actives', label: 'En cours' },
    { valeur: 'terminees', label: 'Terminées' },
    { valeur: 'toutes', label: 'Toutes' }
  ];

  readonly commandes = signal<Commande[]>([]);
  readonly filtre = signal<Filtre>('actives');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly processingId = signal<number | null>(null);

  readonly commandesFiltrees = computed(() => this.filtrer(this.filtre()));

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

  compter(filtre: Filtre): number {
    return this.filtrer(filtre).length;
  }

  factureDisponible(commande: Commande): boolean {
    return commande.statutPaiement === 'CONFIRME' || commande.referenceFacture !== null;
  }

  loadCommandes(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.listerCommandesProducteur(user.idUtilisateur).subscribe({
      next: response => {
        this.commandes.set(response.data.content);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger les commandes. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  agir(commande: Commande, action: 'confirmer' | 'refuser' | 'expedier' | 'livrer'): void {
    const requetes: Record<typeof action, () => Observable<ApiResponse<Commande>>> = {
      confirmer: () => this.marketplaceService.confirmerCommande(commande.idCommande),
      refuser: () => this.marketplaceService.refuserCommande(commande.idCommande),
      expedier: () => this.marketplaceService.changerStatutCommande(commande.idCommande, 'EXPEDIE'),
      livrer: () => this.marketplaceService.changerStatutCommande(commande.idCommande, 'LIVRE')
    };
    const messages: Record<typeof action, string> = {
      confirmer: 'est validée : l’éleveur peut maintenant la régler.',
      refuser: 'a été refusée, le stock est rétabli.',
      expedier: 'est marquée comme expédiée.',
      livrer: 'est marquée comme livrée.'
    };

    this.processingId.set(commande.idCommande);
    this.errorMessage.set('');
    this.actionMessage.set('');
    requetes[action]().subscribe({
      next: response => {
        this.commandes.update(list => list.map(item =>
          item.idCommande === commande.idCommande ? response.data : item));
        this.actionMessage.set(`La commande ${commande.numeroCommande} ${messages[action]}`);
        this.processingId.set(null);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, `L’action sur la commande ${commande.numeroCommande} a échoué. Réessayez.`));
        this.processingId.set(null);
        this.loadCommandes();
      }
    });
  }

  confirmerEncaissement(commande: Commande): void {
    if (!window.confirm(`Confirmez-vous avoir reçu ${commande.montantTotal} FCFA en espèces pour la commande ${commande.numeroCommande} ?`)) {
      return;
    }
    this.processingId.set(commande.idCommande);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.paiementService.confirmerEncaissementEspeces(commande.idCommande).subscribe({
      next: () => {
        this.actionMessage.set(`Encaissement confirmé : la commande ${commande.numeroCommande} est payée, vous pouvez l’expédier.`);
        this.processingId.set(null);
        // Statut de commande, paiement et facture changent ensemble : on relit l'état serveur
        this.loadCommandes();
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, `L’encaissement de la commande ${commande.numeroCommande} n’a pas pu être confirmé. Réessayez.`));
        this.processingId.set(null);
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

  private filtrer(filtre: Filtre): Commande[] {
    const actifs: readonly StatutCommande[] = STATUTS_COMMANDE_ACTIFS;
    return this.commandes().filter(commande =>
      filtre === 'toutes' || (filtre === 'actives') === actifs.includes(commande.statut));
  }
}