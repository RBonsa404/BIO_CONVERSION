import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-cream">
      <!-- Top navigation -->
      <nav class="bg-white shadow-sm border-b border-line">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center">
              <a [routerLink]="['/marketplace']" class="flex items-center">
                <div class="w-10 h-10 rounded-full border-2 border-wine flex items-center justify-center mr-3">
                  <svg class="w-6 h-6 text-wine" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                  </svg>
                </div>
                <span class="text-xl font-serif text-wine font-bold">BioConversion</span>
              </a>
            </div>

            <!-- Navigation links -->
            <div class="flex items-center space-x-8">
              <a [routerLink]="['/marketplace']" class="text-text hover:text-wine transition-colors">
                Rechercher
              </a>
              <a [routerLink]="['/commandes']" class="text-text hover:text-wine transition-colors">
                Mes commandes
              </a>
              <a [routerLink]="['/historique']" class="text-text hover:text-wine transition-colors">
                Historique
              </a>
            </div>

            <!-- User menu -->
            <div class="flex items-center">
              <div class="relative">
                <button class="flex items-center space-x-2 text-text hover:text-wine">
                  <div class="w-8 h-8 bg-green-soft rounded-full flex items-center justify-center">
                    <span class="text-green font-medium">JD</span>
                  </div>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-serif text-wine font-bold mb-8">Commande</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart items -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-2xl shadow-sm p-6">
              <h2 class="text-xl font-serif text-wine font-medium mb-4">Articles dans le panier</h2>

              <!-- Cart item -->
              <div class="flex items-center justify-between py-4 border-b border-line">
                <div class="flex items-center">
                  <div class="w-16 h-16 bg-green-soft rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-8 h-8 text-green" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-wine font-medium">Larves BSFL - Fraîches</h3>
                    <p class="text-text text-sm">Ferme Dounord</p>
                    <p class="text-wine font-bold">2 500 FCFA/kg</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center border border-line rounded-lg">
                    <button class="px-3 py-1 text-text hover:text-wine">-</button>
                    <span class="px-3 py-1 text-wine font-medium">50</span>
                    <button class="px-3 py-1 text-text hover:text-wine">+</button>
                  </div>
                  <p class="text-wine font-bold w-24 text-right">125 000 FCFA</p>
                </div>
              </div>

              <!-- Cart item 2 -->
              <div class="flex items-center justify-between py-4">
                <div class="flex items-center">
                  <div class="w-16 h-16 bg-green-soft rounded-lg flex items-center justify-center mr-4">
                    <svg class="w-8 h-8 text-green" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-wine font-medium">Larves BSFL - Séchées</h3>
                    <p class="text-text text-sm">Ferme Dounord</p>
                    <p class="text-wine font-bold">3 500 FCFA/kg</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center border border-line rounded-lg">
                    <button class="px-3 py-1 text-text hover:text-wine">-</button>
                    <span class="px-3 py-1 text-wine font-medium">25</span>
                    <button class="px-3 py-1 text-text hover:text-wine">+</button>
                  </div>
                  <p class="text-wine font-bold w-24 text-right">87 500 FCFA</p>
                </div>
              </div>
            </div>

            <!-- Delivery form -->
            <div class="bg-white rounded-2xl shadow-sm p-6 mt-4">
              <h2 class="text-xl font-serif text-wine font-medium mb-4">Livraison</h2>

              <form [formGroup]="livraisonForm">
                <div class="mb-4">
                  <label class="block text-text text-sm font-medium mb-2">Mode de livraison</label>
                  <div class="space-y-2">
                    <label class="flex items-center p-3 border border-line rounded-lg cursor-pointer hover:border-wine">
                      <input type="radio" formControlName="modeLivraison" value="producteur" class="mr-3">
                      <span class="text-text">Livraison par le producteur</span>
                    </label>
                    <label class="flex items-center p-3 border border-line rounded-lg cursor-pointer hover:border-wine">
                      <input type="radio" formControlName="modeLivraison" value="transporteur" class="mr-3">
                      <span class="text-text">Livraison par transporteur</span>
                    </label>
                    <label class="flex items-center p-3 border border-line rounded-lg cursor-pointer hover:border-wine">
                      <input type="radio" formControlName="modeLivraison" value="retrait" class="mr-3">
                      <span class="text-text">Retrait sur place</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label for="adresse" class="block text-text text-sm font-medium mb-2">Adresse de livraison</label>
                  <textarea
                    id="adresse"
                    formControlName="adresse"
                    rows="3"
                    placeholder="Votre adresse complète"
                    class="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:border-wine focus:ring-1 focus:ring-wine resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
          </div>

          <!-- Order summary -->
          <div>
            <div class="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h2 class="text-xl font-serif text-wine font-medium mb-4">Récapitulatif</h2>

              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-text">
                  <span>Sous-total (75 kg)</span>
                  <span>212 500 FCFA</span>
                </div>
                <div class="flex justify-between text-text">
                  <span>Frais de livraison</span>
                  <span>5 000 FCFA</span>
                </div>
                <div class="flex justify-between text-text">
                  <span>Commission plateforme</span>
                  <span>21 250 FCFA</span>
                </div>
                <div class="border-t border-line pt-3 flex justify-between text-wine font-bold text-lg">
                  <span>Total</span>
                  <span>238 750 FCFA</span>
                </div>
              </div>

              <h3 class="text-lg font-serif text-wine font-medium mb-4">Mode de paiement</h3>

              <div class="space-y-3 mb-6">
                <label class="flex items-center p-4 border-2 border-wine bg-wine/5 rounded-lg cursor-pointer">
                  <input type="radio" name="payment" checked class="mr-3">
                  <div class="flex-1">
                    <span class="text-wine font-medium">Orange Money</span>
                    <p class="text-text text-sm">Paiement mobile instantané</p>
                  </div>
                  <svg class="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3zm-5 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V7c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z"/>
                  </svg>
                </label>

                <label class="flex items-center p-4 border border-line rounded-lg cursor-pointer opacity-50">
                  <input type="radio" name="payment" disabled class="mr-3">
                  <div class="flex-1">
                    <span class="text-text font-medium">Espèces à la livraison</span>
                    <p class="text-text text-sm">Paiement à la réception</p>
                  </div>
                  <span class="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Bientôt disponible</span>
                </label>
              </div>

              <button
                [disabled]="livraisonForm.invalid || isLoading"
                class="w-full bg-wine text-white py-3 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">Confirmer la commande</span>
                <span *ngIf="isLoading">Traitement en cours...</span>
              </button>

              <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class CommandeComponent {
  livraisonForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.livraisonForm = this.fb.group({
      modeLivraison: ['producteur', [Validators.required]],
      adresse: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.livraisonForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // TODO_BACKEND: Call order API
    // POST /api/v1/marketplace/commandes
    console.log('Order data:', this.livraisonForm.value);

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // Navigate to confirmation
    }, 1500);
  }
}
