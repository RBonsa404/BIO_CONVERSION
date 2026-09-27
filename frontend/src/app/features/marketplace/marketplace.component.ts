import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-marketplace',
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
              <a [routerLink]="['/']" class="flex items-center group">
                <div class="w-12 h-12 rounded-full border-3 border-wine flex items-center justify-center mr-4 bg-green-soft group-hover:bg-wine group-hover:border-white transition-all overflow-hidden">
                  <img src="logo.png" alt="BioConversion Logo" class="w-9 h-9 object-contain group-hover:hidden">
                  <img src="logo.png" alt="BioConversion Logo" class="w-9 h-9 object-contain hidden group-hover:block invert">
                </div>
                <span class="text-2xl font-serif text-wine font-bold group-hover:text-wine-dark transition-colors">BioConversion</span>
              </a>
            </div>

            <!-- Navigation links -->
            <div class="flex items-center space-x-10">
              <a [routerLink]="['/marketplace']" class="text-wine font-semibold">
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

      <!-- Search hero -->
      <div class="bg-white border-b border-line">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 class="text-4xl font-serif text-wine font-bold mb-4">Trouvez votre producteur</h1>
          <p class="text-text text-lg mb-8">Recherchez des producteurs de larves BSFL près de chez vous</p>
          
          <div class="flex gap-4">
            <div class="flex-1 relative">
              <input type="text" placeholder="Rechercher par ville, province..." class="w-full px-6 py-4 rounded-xl border-2 border-line focus:border-wine focus:outline-none text-text text-lg bg-cream">
              <svg class="w-6 h-6 absolute right-4 top-1/2 transform -translate-y-1/2 text-text" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <button class="bg-wine text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white border-b border-line">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex gap-4 flex-wrap">
            <button class="px-6 py-2 rounded-full border-2 border-wine bg-wine text-white font-medium">
              Tous
            </button>
            <button class="px-6 py-2 rounded-full border-2 border-line text-text font-medium hover:border-wine hover:text-wine transition-colors">
              Disponibles
            </button>
            <button class="px-6 py-2 rounded-full border-2 border-line text-text font-medium hover:border-wine hover:text-wine transition-colors">
              Proches
            </button>
            <button class="px-6 py-2 rounded-full border-2 border-line text-text font-medium hover:border-wine hover:text-wine transition-colors">
              Mieux notés
            </button>
          </div>
        </div>
      </div>

      <!-- Producteurs grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Producteur 1 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-line cursor-pointer" [routerLink]="['/producteur', 1]">
            <div class="flex items-start mb-6">
              <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mr-6 border-2 border-green">
                <svg class="w-12 h-12 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-serif text-wine font-semibold mb-1">Ferme Dounord</h3>
                <p class="text-text text-base mb-2">Ouagadougou, Centre</p>
                <div class="flex items-center">
                  <div class="flex text-yellow-400 mr-2">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <span class="text-text text-sm">(18 avis)</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-3 bg-green-soft rounded-xl px-4 mb-4">
              <div class="flex items-center text-text text-sm">
                <svg class="w-4 h-4 mr-2 text-wine" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
                <span>5 km</span>
              </div>
              <div class="flex items-center text-text text-sm">
                <svg class="w-4 h-4 mr-2 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
                <span>500 kg</span>
              </div>
              <span class="text-green font-semibold text-sm">Disponible</span>
            </div>
            
            <button class="w-full bg-wine text-white py-3 rounded-xl font-semibold text-base hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Voir le catalogue
            </button>
          </div>

          <!-- Producteur 2 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-line cursor-pointer" [routerLink]="['/producteur', 2]">
            <div class="flex items-start mb-6">
              <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mr-6 border-2 border-green">
                <svg class="w-12 h-12 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-serif text-wine font-semibold mb-1">Ferme Sanogo</h3>
                <p class="text-text text-base mb-2">Bobo-Dioulasso, Hauts-Bassins</p>
                <div class="flex items-center">
                  <div class="flex text-yellow-400 mr-2">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <span class="text-text text-sm">(24 avis)</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-3 bg-green-soft rounded-xl px-4 mb-4">
              <div class="flex items-center text-text text-sm">
                <svg class="w-4 h-4 mr-2 text-wine" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
                <span>12 km</span>
              </div>
              <div class="flex items-center text-text text-sm">
                <svg class="w-4 h-4 mr-2 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
                <span>350 kg</span>
              </div>
              <span class="text-green font-semibold text-sm">Disponible</span>
            </div>
            
            <button class="w-full bg-wine text-white py-3 rounded-xl font-semibold text-base hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Voir le catalogue
            </button>
          </div>

          <!-- Producteur 3 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-line cursor-pointer" [routerLink]="['/producteur', 3]">
            <div class="flex items-start mb-6">
              <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mr-6 border-2 border-green">
                <svg class="w-12 h-12 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-serif text-wine font-semibold mb-1">Ferme Kaboré</h3>
                <p class="text-text text-base mb-2">Koudougou, Centre-Ouest</p>
                <div class="flex items-center">
                  <div class="flex text-yellow-400 mr-2">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <svg class="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <span class="text-text text-sm">(8 avis)</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-3 bg-orange-50 rounded-xl px-4 mb-4">
              <div class="flex items-center text-text text-sm">
                <svg class="w-4 h-4 mr-2 text-wine" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
                <span>25 km</span>
              </div>
              <div class="flex items-center text-text text-sm">
                <svg class="w-4 h-4 mr-2 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
                <span>75 kg</span>
              </div>
              <span class="text-orange-600 font-semibold text-sm">Stock limité</span>
            </div>
            
            <button class="w-full bg-wine text-white py-3 rounded-xl font-semibold text-base hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Voir le catalogue
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
export class MarketplaceComponent {}