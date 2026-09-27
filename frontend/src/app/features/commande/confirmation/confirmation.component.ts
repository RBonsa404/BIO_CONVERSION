import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Commande, MarketplaceService } from '../../../core/services/marketplace.service';
import { Paiement, PaiementService } from '../../../core/services/paiement.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen bg-cream px-5 py-8 md:px-8">
      <a routerLink="/marketplace" class="mx-auto mb-8 flex w-fit items-center gap-3 font-serif text-3xl font-bold text-wine">
        <img src="/logo.png" alt="" class="h-16 w-16 object-contain">
        BioConversion
      </a>
      <div class="mx-auto w-full max-w-4xl rounded-3xl border border-line bg-white p-6 shadow-lg md:p-10">
        <div *ngIf="isLoading" role="status" class="text-center text-text py-8">
          Chargement de la commande...
        </div>
        <div *ngIf="errorMessage" role="alert" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadCommande()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <ng-container *ngIf="!isLoading && commande && paiement">
          <div class="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-green-soft">
            <span class="text-5xl font-bold text-green" aria-hidden="true">✓</span>
          </div>
          <h1 class="mb-3 text-center font-serif text-4xl font-bold text-wine">Commande enregistrée</h1>
          <p class="mx-auto mb-8 max-w-2xl text-center text-lg leading-7 text-text">
            Le paiement est {{ paiement.statutPaiement === 'CONFIRME' ? 'confirmé' : 'en attente de confirmation opérateur' }}.
            Votre demande a été transmise au producteur et reste {{ commande.statut === 'EN_ATTENTE' ? 'en attente de validation' : commande.statut.toLocaleLowerCase() }}.
          </p>

          <section class="mb-8 rounded-2xl bg-green-soft/60 p-5 md:p-7">
            <h2 class="mb-4 font-serif text-xl font-semibold text-wine">Détails de la commande</h2>
            <dl class="divide-y divide-line">
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">N° commande</dt><dd class="font-semibold text-wine">{{ commande.numeroCommande }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">Producteur</dt><dd class="font-semibold text-wine">{{ commande.nomExploitation }}</dd></div>
              <div *ngFor="let ligne of commande.lignes" class="flex justify-between gap-4 py-3">
                <dt class="text-text">{{ ligne.nomProduit }} — {{ ligne.quantite }} kg</dt>
                <dd class="font-semibold text-wine">{{ ligne.sousTotal | number:'1.0-2' }} FCFA</dd>
              </div>
              <div class="flex justify-between gap-4 border-t border-line py-4">
                <dt class="font-medium text-text">Montant</dt>
                <dd class="font-serif text-2xl font-bold text-wine">{{ commande.montantTotal | number:'1.0-2' }} FCFA</dd>
              </div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">Paiement</dt><dd class="font-medium text-wine">{{ paiement.operateur }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">Statut</dt><dd [class.text-green]="paiement.statutPaiement === 'CONFIRME'" [class.text-amber-700]="paiement.statutPaiement !== 'CONFIRME'" class="font-semibold">{{ paiement.statutPaiement }}</dd></div>
            </dl>
          </section>

          <a routerLink="/marketplace"
             class="block rounded-xl bg-wine py-4 text-center font-semibold text-white hover:bg-wine-dark">
            Retour à la marketplace →
          </a>
        </ng-container>
      </div>
    </main>
  `
})
export class ConfirmationComponent implements OnInit {
  commande: Commande | null = null;
  paiement: Paiement | null = null;
  isLoading = false;
  errorMessage = '';
  private commandeId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.queryParamMap.get('commandeId');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage = 'Référence de commande invalide.';
      return;
    }
    this.commandeId = id;
    this.loadCommande();
  }

  loadCommande(): void {
    if (this.commandeId === null) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      commande: this.marketplaceService.obtenirCommande(this.commandeId),
      paiement: this.paiementService.consulterParCommande(this.commandeId)
    }).subscribe({
      next: result => {
        this.commande = result.commande.data;
        this.paiement = result.paiement.data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les détails de la commande. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
      }
    });
  }
}
