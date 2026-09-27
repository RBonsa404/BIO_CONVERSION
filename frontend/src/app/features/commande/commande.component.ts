import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Commande, MarketplaceService, Produit } from '../../core/services/marketplace.service';
import { PaiementService } from '../../core/services/paiement.service';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-cream">
      <nav class="bg-white shadow-sm border-b border-line px-6 py-5">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <a routerLink="/marketplace" class="flex items-center gap-3 font-serif text-xl font-bold text-wine">
            <img src="/logo.png" alt="" class="h-12 w-12 object-contain">
            BioConversion
          </a>
          <a routerLink="/marketplace" class="font-medium text-green hover:text-wine">← Retour aux produits</a>
        </div>
      </nav>

      <main class="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <h1 class="mb-6 font-serif text-3xl font-bold text-wine md:text-4xl">Récapitulatif de la commande</h1>
        <div *ngIf="isLoadingProduct" role="status" class="rounded-xl bg-white p-6 text-text">
          Chargement du produit...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <form *ngIf="produit" [formGroup]="commandeForm" (ngSubmit)="onSubmit()"
              class="grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_.8fr]">
          <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <div class="mb-5 flex items-center gap-4">
              <img src="/larvae-hero.png" alt="" class="h-24 w-28 rounded-lg object-cover">
              <div>
                <p class="text-sm text-text">{{ produit.nomExploitation }}</p>
                <h2 class="font-serif text-2xl font-semibold text-wine">{{ produit.nomProduit }}</h2>
                <p class="mt-1 text-sm text-green">{{ produit.prix | number:'1.0-2' }} FCFA / kg</p>
              </div>
            </div>
            <div class="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <label for="quantite" class="mb-2 block text-sm font-semibold text-text">Quantité (kg)</label>
                <input id="quantite" type="number" min="0.001" step="0.001" formControlName="quantite"
                       [readonly]="commande !== null"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                <p *ngIf="quantite.invalid && quantite.touched" class="mt-2 text-sm text-red-600">
                  Entrez une quantité supérieure à zéro.
                </p>
              </div>
              <div class="rounded-xl bg-green-soft/60 p-4">
                <span class="block text-sm text-text">Stock disponible</span>
                <strong class="mt-1 block text-xl text-green">{{ produit.quantiteStock }} kg</strong>
              </div>
            </div>
          </section>

          <aside class="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-4 font-serif text-2xl font-semibold text-wine">Confirmer</h2>
            <p class="mb-6 leading-7 text-text">
              Vérifiez les informations de votre commande avant de confirmer. Le producteur recevra votre demande.
            </p>
            <label for="operateur" class="mb-2 block text-sm font-semibold text-text">Mode de paiement</label>
            <select id="operateur" formControlName="operateur"
                    class="w-full rounded-xl border-2 border-line bg-white px-4 py-3">
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
            <div class="mt-6 flex items-center justify-between border-t border-line pt-5 text-text">
              <span>Total de la commande</span>
              <strong class="font-serif text-2xl text-wine">{{ totalEstime | number:'1.0-2' }} FCFA</strong>
            </div>
            <button type="submit" [disabled]="commandeForm.invalid || isLoading"
                    class="mt-6 w-full rounded-xl bg-wine px-5 py-4 font-semibold text-white hover:bg-wine-dark disabled:opacity-50">
              <span *ngIf="!isLoading">{{ commande ? 'Réessayer le paiement' : 'Confirmer la commande et payer' }}</span>
              <span *ngIf="isLoading">Traitement en cours...</span>
            </button>
            <p class="mt-4 text-sm text-text">Le paiement est traité par l’opérateur sélectionné.</p>
          </aside>
        </form>
      </main>
    </div>
  `
})
export class CommandeComponent implements OnInit {
  readonly commandeForm: FormGroup<{
    quantite: FormControl<number>;
    operateur: FormControl<string>;
  }>;
  produit: Produit | null = null;
  commande: Commande | null = null;
  isLoadingProduct = false;
  isLoading = false;
  errorMessage = '';
  private produitId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private marketplaceService: MarketplaceService,
    private paiementService: PaiementService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.commandeForm = this.fb.nonNullable.group({
      quantite: [1, [Validators.required, Validators.min(0.001)]],
      operateur: ['ORANGE_MONEY', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.queryParamMap.get('produitId');
    const id = rawId ? Number(rawId) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage = 'Aucun produit valide n’a été sélectionné.';
      return;
    }
    this.produitId = id;
    const rawQuantity = Number(this.route.snapshot.queryParamMap.get('quantite') ?? 1);
    if (Number.isFinite(rawQuantity) && rawQuantity > 0) {
      this.commandeForm.controls.quantite.setValue(rawQuantity);
    }
    this.loadProduit();
  }

  get quantite() {
    return this.commandeForm.controls.quantite;
  }

  get totalEstime(): number {
    return (this.produit?.prix ?? 0) * this.quantite.value;
  }

  loadProduit(): void {
    if (this.produitId === null) {
      return;
    }
    this.isLoadingProduct = true;
    this.errorMessage = '';
    this.marketplaceService.obtenirProduit(this.produitId).subscribe({
      next: response => {
        this.produit = response.data;
        this.isLoadingProduct = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le produit. Vérifiez votre connexion et réessayez.';
        this.isLoadingProduct = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  onSubmit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'ELEVEUR') {
      this.errorMessage = 'Connectez-vous avec un compte éleveur pour passer une commande.';
      return;
    }
    if (this.commande) {
      this.initierPaiement();
      return;
    }
    if (this.commandeForm.invalid || !this.produit || this.produitId === null) {
      this.commandeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.marketplaceService.passerCommande(
      user.idUtilisateur,
      this.produitId,
      this.quantite.value
    ).subscribe({
      next: response => {
        this.commande = response.data;
        this.initierPaiement();
      },
      error: error => {
        this.errorMessage = this.formatOrderError(error);
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private initierPaiement(): void {
    if (!this.commande) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.paiementService.initierPaiement(
      this.commande.idCommande,
      this.commandeForm.controls.operateur.value
    ).subscribe({
      next: () => {
        this.router.navigate(['/confirmation'], {
          queryParams: { commandeId: this.commande?.idCommande }
        });
      },
      error: error => {
        this.errorMessage =
          `La commande ${this.commande?.numeroCommande} est créée, mais le paiement n’a pas pu être initié. ` +
          `${this.formatOrderError(error)} Vous pouvez réessayer le paiement sans recréer la commande.`;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private formatOrderError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Une erreur inattendue est survenue.';
    }
    const message = typeof error.error?.message === 'string' ? error.error.message : '';
    if (/stock|quantit|disponible/i.test(message)) {
      return 'Le stock disponible est insuffisant pour cette quantité.';
    }
    return message || 'La requête a échoué. Vérifiez votre connexion et réessayez.';
  }
}
