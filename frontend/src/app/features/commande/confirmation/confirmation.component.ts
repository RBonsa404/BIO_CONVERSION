import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Commande, MarketplaceService } from '../../../core/services/marketplace.service';
import { messageErreur } from '../../../core/utils/http-error';
import { libelleCommande } from '../../../core/utils/statuts';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen bg-cream px-5 py-8 md:px-8">
      <div class="mx-auto w-full max-w-3xl rounded-3xl border border-line bg-white p-6 shadow-lg md:p-10">
        @if (isLoading()) {
          <div role="status" class="py-8 text-center text-text">Chargement de la commande...</div>
        }
        @if (errorMessage()) {
          <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            @if (commandeId !== null) {
              <button type="button" (click)="loadCommande()" class="ml-3 font-semibold underline">Réessayer</button>
            }
            <a routerLink="/mes-commandes" class="ml-3 font-semibold underline">Mes commandes</a>
          </div>
        }
        @if (!isLoading() && commande(); as currentCommande) {
          <div class="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-green-soft">
            <span class="text-5xl font-bold text-green" aria-hidden="true">✓</span>
          </div>
          <h1 class="mb-3 text-center font-serif text-4xl font-bold text-wine">Commande envoyée</h1>
          <p class="mx-auto mb-8 max-w-2xl text-center text-lg leading-7 text-text">
            Votre demande a été transmise à {{ currentCommande.nomExploitation }}. Dès que le producteur l’aura validée
            (12 heures au plus), vous pourrez la régler depuis « Mes commandes ».
          </p>

          <section class="mb-8 rounded-2xl bg-green-soft/60 p-5 md:p-7">
            <h2 class="mb-4 font-serif text-xl font-semibold text-wine">Détails de la commande</h2>
            <dl class="divide-y divide-line">
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">N° commande</dt><dd class="font-semibold text-wine">{{ currentCommande.numeroCommande }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">Producteur</dt><dd class="font-semibold text-wine">{{ currentCommande.nomExploitation }}</dd></div>
              @for (ligne of currentCommande.lignes; track ligne.idLigne) {
                <div class="flex justify-between gap-4 py-3">
                  <dt class="text-text">{{ ligne.nomProduit }} — {{ ligne.quantite }} kg</dt>
                  <dd class="font-semibold text-wine">{{ ligne.sousTotal | number:'1.0-0' }} FCFA</dd>
                </div>
              }
              <div class="flex justify-between gap-4 py-4">
                <dt class="font-medium text-text">Montant à régler après validation</dt>
                <dd class="font-serif text-2xl font-bold text-wine">{{ currentCommande.montantTotal | number:'1.0-0' }} FCFA</dd>
              </div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-text">Statut</dt><dd class="font-semibold text-amber-700">{{ libelle(currentCommande.statut) }}</dd></div>
            </dl>
          </section>

          <div class="grid gap-3 sm:grid-cols-2">
            <a routerLink="/mes-commandes"
               class="block rounded-xl bg-wine py-4 text-center font-semibold text-white hover:bg-wine-dark">
              Suivre mes commandes →
            </a>
            <a routerLink="/marketplace"
               class="block rounded-xl border border-wine py-4 text-center font-semibold text-wine hover:bg-cream">
              Retour à la marketplace
            </a>
          </div>
        }
      </div>
    </main>
  `
})
export class ConfirmationComponent implements OnInit {
  readonly commande = signal<Commande | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  commandeId: number | null = null;

  readonly libelle = libelleCommande;

  constructor(
    private route: ActivatedRoute,
    private marketplaceService: MarketplaceService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.queryParamMap.get('commandeId');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage.set('Référence de commande invalide.');
      return;
    }
    this.commandeId = id;
    this.loadCommande();
  }

  loadCommande(): void {
    if (this.commandeId === null) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.marketplaceService.obtenirCommande(this.commandeId).subscribe({
      next: response => {
        this.commande.set(response.data);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger les détails de la commande.'));
        this.isLoading.set(false);
      }
    });
  }
}
