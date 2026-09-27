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
    <div class="min-h-screen bg-cream flex items-center justify-center p-8">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <div *ngIf="isLoading" role="status" class="text-center text-text py-8">
          Chargement de la commande...
        </div>
        <div *ngIf="errorMessage" role="alert" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadCommande()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <ng-container *ngIf="!isLoading && commande && paiement">
          <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-green text-4xl" aria-hidden="true">✓</span>
          </div>
          <h1 class="text-3xl font-serif text-wine font-bold text-center mb-3">Commande enregistrée</h1>
          <p class="text-text text-center mb-8">
            Le paiement est {{ paiement.statutPaiement === 'CONFIRME' ? 'confirmé' : 'en attente de confirmation opérateur' }}.
          </p>

          <section class="bg-cream rounded-xl p-6 mb-8">
            <h2 class="text-lg font-serif text-wine font-medium mb-4">Détails de la commande</h2>
            <dl class="space-y-3">
              <div class="flex justify-between gap-4"><dt class="text-text">Référence</dt><dd class="text-wine font-medium">{{ commande.numeroCommande }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-text">Date</dt><dd class="text-wine font-medium">{{ commande.dateCommande | date:'medium' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-text">Producteur</dt><dd class="text-wine font-medium">{{ commande.nomExploitation }}</dd></div>
              <div *ngFor="let ligne of commande.lignes" class="flex justify-between gap-4">
                <dt class="text-text">{{ ligne.nomProduit }} — {{ ligne.quantite }} kg</dt>
                <dd class="text-wine font-medium">{{ ligne.sousTotal | number:'1.0-2' }} FCFA</dd>
              </div>
              <div class="flex justify-between gap-4 border-t border-line pt-3">
                <dt class="text-text">Montant total</dt>
                <dd class="text-wine font-bold">{{ commande.montantTotal | number:'1.0-2' }} FCFA</dd>
              </div>
              <div class="flex justify-between gap-4"><dt class="text-text">Paiement</dt><dd class="text-wine font-medium">{{ paiement.operateur }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-text">Statut du paiement</dt><dd class="text-wine font-medium">{{ paiement.statutPaiement }}</dd></div>
            </dl>
          </section>

          <a routerLink="/marketplace"
             class="block text-center bg-wine text-white py-3 rounded-lg font-medium hover:bg-wine-dark">
            Retour à la marketplace
          </a>
        </ng-container>
      </div>
    </div>
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
