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
                <div class="w-12 h-12 rounded-full border-3 border-wine flex items-center justify-center mr-4 bg-green-soft group-hover:bg-wine group-hover:border-white transition-all">
                  <svg class="w-7 h-7 text-wine group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                  </svg>
                </div>
                <span class="text-2xl font-serif text-wine font-bold group-hover:text-wine-dark transition-colors">BioConversion</span>
              </a>
            </div>

            <!-- Navigation links -->
            <div class="flex items-center space-x-10">
              <a [routerLink]="['/marketplace']" class="text-wine font-semibold border-b-3 border-wine pb-2">
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

      <!-- Hero section -->
      <div class="bg-white border-b border-line">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 class="text-4xl font-serif text-wine mb-3">Marketplace</h1>
          <p class="text-green text-2xl font-medium mb-8">Trouvez le producteur le plus proche de chez vous</p>
          
          <!-- Search form -->
          <div class="flex space-x-4">
            <div class="flex-1">
              <input
                type="text"
                placeholder="Rechercher par ville ou région..."
                class="w-full px-5 py-4 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all text-base"
              />
            </div>
            <div class="w-56">
              <select class="w-full px-5 py-4 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all bg-white text-base">
                <option value="">Rayon (km)</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>
            <button class="bg-wine text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <!-- Results section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-serif text-wine font-semibold">Producteurs disponibles</h2>
          <span class="text-text text-base">12 résultats</span>
        </div>

        <!-- Producteur cards grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer border border-line">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center">
                <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mr-5 border-2 border-green">
                  <svg class="w-12 h-12 text-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-serif text-wine font-semibold">Ferme Dounord</h3>
                  <p class="text-text text-base">Ouagadougou, Centre</p>
                </div>
              </div>
              <span class="bg-green-soft text-green px-4 py-2 rounded-full text-sm font-semibold border border-green">
                Disponible
              </span>
            </div>
            
            <div class="flex items-center mb-6">
              <div class="flex text-yellow-400">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <span class="text-text text-base ml-3">(18 avis)</span>
            </div>

            <div class="flex justify-between items-center text-base text-text mb-6 py-3 bg-green-soft rounded-xl px-4">
              <span class="font-medium">Distance: 5 km</span>
              <span class="font-medium">Stock: 500 kg</span>
            </div>

            <button class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Voir le catalogue
            </button>
          </div>

          <!-- Card 2 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer border border-line">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center">
                <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mr-5 border-2 border-green">
                  <svg class="w-12 h-12 text-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-serif text-wine font-semibold">Ferme Saaba</h3>
                  <p class="text-text text-base">Saaba, Centre</p>
                </div>
              </div>
              <span class="bg-green-soft text-green px-4 py-2 rounded-full text-sm font-semibold border border-green">
                Disponible
              </span>
            </div>
            
            <div class="flex items-center mb-6">
              <div class="flex text-yellow-400">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <span class="text-text text-base ml-3">(32 avis)</span>
            </div>

            <div class="flex justify-between items-center text-base text-text mb-6 py-3 bg-green-soft rounded-xl px-4">
              <span class="font-medium">Distance: 12 km</span>
              <span class="font-medium">Stock: 750 kg</span>
            </div>

            <button class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Voir le catalogue
            </button>
          </div>

          <!-- Card 3 -->
          <div class="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all cursor-pointer border border-line">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center">
                <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mr-5 border-2 border-green">
                  <svg class="w-12 h-12 text-green" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-serif text-wine font-semibold">Ferme Kaya</h3>
                  <p class="text-text text-base">Kaya, Centre-Nord</p>
                </div>
              </div>
              <span class="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold border border-orange-300">
                Stock limité
              </span>
            </div>
            
            <div class="flex items-center mb-6">
              <div class="flex text-yellow-400">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg class="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <span class="text-text text-base ml-3">(8 avis)</span>
            </div>

            <div class="flex justify-between items-center text-base text-text mb-6 py-3 bg-orange-50 rounded-xl px-4">
              <span class="font-medium">Distance: 95 km</span>
              <span class="font-medium">Stock: 50 kg</span>
            </div>

            <button class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
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
