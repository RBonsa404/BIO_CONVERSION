import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream flex items-center justify-center p-8">
      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
        <!-- Success icon -->
        <div class="w-24 h-24 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-16 h-16 text-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>

        <h1 class="text-3xl font-serif text-wine font-bold mb-4">Commande confirmée !</h1>
        <p class="font-script text-green text-xl italic mb-6">Merci pour votre commande</p>

        <p class="text-text mb-8">
          Votre commande #CMD-001 a été enregistrée avec succès. 
          Vous recevrez une notification dès que le producteur prépare votre commande.
        </p>

        <!-- Order details -->
        <div class="bg-cream rounded-xl p-6 mb-8 text-left">
          <h2 class="text-lg font-serif text-wine font-medium mb-4">Détails de la commande</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-text">Référence</span>
              <span class="text-wine font-medium">#CMD-001</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text">Date</span>
              <span class="text-wine font-medium">27/09/2026</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text">Producteur</span>
              <span class="text-wine font-medium">Ferme Dounord</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text">Quantité totale</span>
              <span class="text-wine font-medium">75 kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text">Montant total</span>
              <span class="text-wine font-bold">238 750 FCFA</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text">Mode de paiement</span>
              <span class="text-wine font-medium">Orange Money</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text">Statut</span>
              <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                En attente de validation
              </span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex space-x-4">
          <button
            (click)="trackOrder()"
            class="flex-1 bg-wine text-white py-3 rounded-lg font-medium hover:bg-wine-dark transition-colors">
            Suivre ma commande
          </button>
          <a
            [routerLink]="['/marketplace']"
            class="flex-1 border-2 border-wine text-wine py-3 rounded-lg font-medium hover:bg-wine hover:text-white transition-colors text-center">
            Retour à la marketplace
          </a>
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
export class ConfirmationComponent {
  trackOrder(): void {
    // TODO: Navigate to order tracking page
    console.log('Track order');
  }
}
