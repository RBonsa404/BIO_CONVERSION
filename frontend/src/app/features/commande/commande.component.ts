import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a routerLink="/marketplace" class="text-xl font-serif text-wine font-bold">BioConversion</a>
          <a routerLink="/marketplace" class="text-text hover:text-wine">Retour aux produits</a>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto px-6 py-10">
        <h1 class="text-3xl font-serif text-wine font-bold mb-8">Commande et paiement</h1>
        <div *ngIf="isLoadingProduct" role="status" class="bg-white rounded-xl p-6 text-text">
          Chargement du produit...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
        </div>

        <form *ngIf="produit" [formGroup]="commandeForm" (ngSubmit)="onSubmit()"
              class="bg-white rounded-2xl shadow-sm p-6">
          <section class="mb-8">
            <h2 class="text-xl font-serif text-wine font-medium mb-2">{{ produit.nomProduit }}</h2>
            <p class="text-text mb-4">{{ produit.nomExploitation }}</p>
            <div class="flex justify-between text-text">
              <span>{{ produit.prix | number:'1.0-2' }} FCFA / kg</span>
              <span>Stock disponible : {{ produit.quantiteStock }} kg</span>
            </div>
          </section>

          <label for="quantite" class="block text-text text-sm font-medium mb-2">Quantité (kg)</label>
          <input id="quantite" type="number" min="0.001" step="0.001" formControlName="quantite"
                 [readonly]="commande !== null"
                 class="w-full px-4 py-3 border-2 border-line rounded-xl mb-3">
          <p *ngIf="quantite.invalid && quantite.touched" class="text-red-600 text-sm mb-5">
            Entrez une quantité supérieure à zéro.
          </p>

          <div class="flex justify-between py-4 border-t border-line text-wine font-semibold">
            <span>Total estimé</span>
            <span>{{ totalEstime | number:'1.0-2' }} FCFA</span>
          </div>

          <label for="operateur" class="block text-text text-sm font-medium mb-2">Opérateur de paiement</label>
          <select id="operateur" formControlName="operateur"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl mb-6">
            <option value="ORANGE_MONEY">Orange Money</option>
          </select>

          <button type="submit" [disabled]="commandeForm.invalid || isLoading"
                  class="w-full bg-wine text-white py-3 rounded-xl font-medium hover:bg-wine-dark disabled:opacity-50">
            <span *ngIf="!isLoading">{{ commande ? 'Réessayer le paiement' : 'Confirmer la commande et payer' }}</span>
            <span *ngIf="isLoading">Traitement en cours...</span>
          </button>
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
    private paiementService: PaiementService
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
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le produit. Vérifiez votre connexion et réessayez.';
        this.isLoadingProduct = false;
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
