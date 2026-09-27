import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-producteur-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream">
      <!-- Top navigation -->
      <nav class="bg-white shadow-lg border-b border-line sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20">
            <!-- Logo -->
            <div class="flex items-center">
              <a [routerLink]="['/marketplace']" class="flex items-center group">
                <div class="w-12 h-12 rounded-full border-3 border-wine flex items-center justify-center mr-4 bg-green-soft group-hover:bg-wine group-hover:border-white transition-all overflow-hidden">
                  <img src="assets/logo.png" alt="BioConversion Logo" class="w-9 h-9 object-contain group-hover:hidden">
                  <img src="assets/logo.png" alt="BioConversion Logo" class="w-9 h-9 object-contain hidden group-hover:block invert">
                </div>
                <span class="text-2xl font-serif text-wine font-bold group-hover:text-wine-dark transition-colors">BioConversion</span>
              </a>
            </div>

            <!-- Navigation links -->
            <div class="flex items-center space-x-10">
              <a [routerLink]="['/marketplace']" class="text-text hover:text-wine transition-colors font-medium">
                Rechercher
              </a>
              <a [routerLink]="['/commandes']" class="text-text hover:text-wine transition-colors font-medium">
                Mes commandes
              </a>
              <a [routerLink]="['/historique']" class="text-text hover:text-wine transition-colors font-medium">
                Historique
              </a>
            </div>

            <!-- User menu -->
            <div class="flex items-center">
              <div class="relative">
                <button class="flex items-center space-x-3 text-text hover:text-wine transition-colors">
                  <div class="w-10 h-10 bg-green-soft rounded-full flex items-center justify-center border-2 border-green">
                    <span class="text-green font-semibold">JD</span>
                  </div>
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Producteur header -->
      <div class="bg-white border-b border-line">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="flex items-start">
            <div class="w-28 h-28 bg-green-soft rounded-full flex items-center justify-center mr-8 border-3 border-green">
              <svg class="w-16 h-16 text-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h1 class="text-4xl font-serif text-wine font-bold mb-3">Ferme Dounord</h1>
              <p class="text-text text-lg mb-4">Ouagadougou, Centre</p>
              <div class="flex items-center space-x-6 mb-4">
                <div class="flex text-yellow-400">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg class="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
                <span class="text-text text-lg">(18 avis)</span>
                <span class="text-text text-lg">•</span>
                <span class="text-green font-semibold text-lg">Disponible</span>
              </div>
              <div class="flex items-center space-x-6 text-text">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-wine" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                  </svg>
                  <span>5 km de chez vous</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                  <span>Capacité: 500 kg/mois</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 class="text-3xl font-serif text-wine mb-8 font-semibold">Catalogue des produits</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Product 1 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-line">
            <div class="bg-green-soft rounded-2xl h-48 mb-6 flex items-center justify-center border-2 border-green">
              <svg class="w-20 h-20 text-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </div>
            <h3 class="text-xl font-serif text-wine font-semibold mb-3">Larves BSFL - Fraîches</h3>
            <p class="text-text text-base mb-6 leading-relaxed">Larves de Black Soldier Fly fraîches, riches en protéines pour vos poissons et volailles.</p>
            <div class="flex justify-between items-center mb-6 py-3 bg-green-soft rounded-xl px-4">
              <span class="text-2xl font-serif text-wine font-bold">2 500 FCFA/kg</span>
              <span class="text-text text-base font-medium">Stock: 300 kg</span>
            </div>
            <button class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Ajouter au panier
            </button>
          </div>

          <!-- Product 2 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-line">
            <div class="bg-green-soft rounded-2xl h-48 mb-6 flex items-center justify-center border-2 border-green">
              <svg class="w-20 h-20 text-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </div>
            <h3 class="text-xl font-serif text-wine font-semibold mb-3">Larves BSFL - Séchées</h3>
            <p class="text-text text-base mb-6 leading-relaxed">Larves séchées, conservation longue durée. Idéales pour le stockage.</p>
            <div class="flex justify-between items-center mb-6 py-3 bg-green-soft rounded-xl px-4">
              <span class="text-2xl font-serif text-wine font-bold">3 500 FCFA/kg</span>
              <span class="text-text text-base font-medium">Stock: 150 kg</span>
            </div>
            <button class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Ajouter au panier
            </button>
          </div>

          <!-- Product 3 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-line">
            <div class="bg-green-soft rounded-2xl h-48 mb-6 flex items-center justify-center border-2 border-green">
              <svg class="w-20 h-20 text-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </div>
            <h3 class="text-xl font-serif text-wine font-semibold mb-3">Larves BSFL - Engraissement</h3>
            <p class="text-text text-base mb-6 leading-relaxed">Larves en phase d'engraissement, taille optimale pour la pisciculture.</p>
            <div class="flex justify-between items-center mb-6 py-3 bg-orange-50 rounded-xl px-4">
              <span class="text-2xl font-serif text-wine font-bold">2 000 FCFA/kg</span>
              <span class="text-text text-base font-medium">Stock: 50 kg</span>
            </div>
            <button class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Ajouter au panier
            </button>
          </div>
        </div>

        <!-- Cart summary -->
        <div class="mt-12 bg-white rounded-3xl shadow-lg p-8 border border-line">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl font-serif text-wine font-semibold mb-2">Panier</h3>
              <p class="text-text text-base">0 articles</p>
            </div>
            <div class="text-right">
              <p class="text-text text-base mb-1">Total</p>
              <p class="text-3xl font-serif text-wine font-bold">0 FCFA</p>
            </div>
            <button class="bg-wine text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Passer commande
            </button>
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
export class ProducteurDetailComponent {
  constructor(private route: ActivatedRoute) {
    // TODO: Load producteur details from route param
  }
}