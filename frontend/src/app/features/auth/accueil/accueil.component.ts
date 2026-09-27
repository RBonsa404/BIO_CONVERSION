import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream flex flex-col">
      <!-- Hero Section -->
      <div class="relative overflow-hidden">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-20 left-20 w-96 h-96 rounded-full bg-green blur-3xl"></div>
          <div class="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-wine blur-3xl"></div>
        </div>

        <!-- Hero content -->
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div class="text-center">
            <!-- Logo -->
            <div class="flex items-center justify-center mb-8">
              <div class="w-24 h-24 rounded-full border-4 border-wine flex items-center justify-center mr-6 bg-green-soft shadow-lg overflow-hidden">
                <img src="/logo.png" alt="BioConversion Logo" class="w-20 h-20 object-contain">
              </div>
              <h1 class="text-5xl md:text-6xl font-serif text-wine font-bold tracking-tight">BioConversion</h1>
            </div>
            
            <h2 class="text-2xl md:text-3xl text-green font-medium mb-4">Plateforme Agri-Tech BSFL Burkina Faso</h2>
            <p class="text-text text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Connectez-vous à un réseau de producteurs et éleveurs pour des transactions sécurisées de larves de mouches soldats noires (BSFL). Une solution durable pour votre pisciculture et aviculture.
            </p>
            
            <!-- CTA buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button (click)="selectProfile('producteur')" class="bg-wine text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
                Je suis Producteur
              </button>
              <button (click)="selectProfile('eleveur')" class="bg-green text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-soft transition-colors shadow-lg hover:shadow-xl">
                Je suis Éleveur
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-serif text-wine mb-6 font-semibold">Qu'est-ce que BioConversion ?</h2>
              <p class="text-text text-lg mb-6 leading-relaxed">
                BioConversion est la première plateforme numérique au Burkina Faso dédiée à la filière BSFL (Black Soldier Fly Larves). Nous connectons les producteurs de larves aux éleveurs de poissons et de volailles pour créer une chaîne de valeur durable et locale.
              </p>
              <p class="text-text text-lg mb-6 leading-relaxed">
                Notre mission est de faciliter l'accès à des aliments protéinés de haute qualité pour l'élevage tout en soutenant les producteurs locaux et en contribuant à la sécurité alimentaire.
              </p>
              <button (click)="selectProfile('producteur')" class="bg-wine text-white px-6 py-3 rounded-xl font-semibold hover:bg-wine-dark transition-colors">
                En savoir plus
              </button>
            </div>
            <div class="bg-green-soft rounded-3xl p-8 border-2 border-green">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5 1.5z"/>
                    </svg>
                  </div>
                  <h3 class="text-wine font-semibold mb-1">Local</h3>
                  <p class="text-text text-sm">Producteurs burkinabè</p>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                    </svg>
                  </div>
                  <h3 class="text-wine font-semibold mb-1">Qualité</h3>
                  <p class="text-text text-sm">Larves certifiées</p>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <h3 class="text-wine font-semibold mb-1">Sécurisé</h3>
                  <p class="text-text text-sm">Paiement Orange Money</p>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <h3 class="text-wine font-semibold mb-1">Communauté</h3>
                  <p class="text-text text-sm">Réseau de confiance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-serif text-wine text-center mb-12 font-semibold">Pourquoi BioConversion ?</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center">
              <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green">
                <svg class="w-10 h-10 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5 1.5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Produits de Qualité</h3>
              <p class="text-text text-base leading-relaxed">Larves BSFL fraîches et séchées, riches en protéines, pour une alimentation saine de vos poissons et volailles.</p>
            </div>

            <!-- Feature 2 -->
            <div class="text-center">
              <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green">
                <svg class="w-10 h-10 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Réseau Local</h3>
              <p class="text-text text-base leading-relaxed">Trouvez des producteurs près de chez vous et réduisez vos coûts de transport.</p>
            </div>

            <!-- Feature 3 -->
            <div class="text-center">
              <div class="w-20 h-20 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green">
                <svg class="w-10 h-10 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Paiement Sécurisé</h3>
              <p class="text-text text-base leading-relaxed">Paiement mobile Orange Money sécurisé pour toutes vos transactions.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How it works Section -->
      <div class="py-20 bg-cream">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-serif text-wine text-center mb-12 font-semibold">Comment ça marche ?</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Step 1 -->
            <div class="text-center">
              <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl font-bold">1</span>
              </div>
              <h3 class="text-lg font-serif text-wine font-semibold mb-2">Inscrivez-vous</h3>
              <p class="text-text text-sm">Créez votre compte en quelques secondes</p>
            </div>

            <!-- Step 2 -->
            <div class="text-center">
              <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl font-bold">2</span>
              </div>
              <h3 class="text-lg font-serif text-wine font-semibold mb-2">Trouvez</h3>
              <p class="text-text text-sm">Recherchez des producteurs près de chez vous</p>
            </div>

            <!-- Step 3 -->
            <div class="text-center">
              <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl font-bold">3</span>
              </div>
              <h3 class="text-lg font-serif text-wine font-semibold mb-2">Commandez</h3>
              <p class="text-text text-sm">Achetez vos larves et passez commande</p>
            </div>

            <!-- Step 4 -->
            <div class="text-center">
              <div class="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl font-bold">4</span>
              </div>
              <h3 class="text-lg font-serif text-wine font-semibold mb-2">Recevez</h3>
              <p class="text-text text-sm">Livraison rapide et paiement sécurisé</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-serif text-wine text-center mb-12 font-semibold">Avantages pour les Producteurs</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-green-soft rounded-2xl p-6 border-2 border-green">
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Visibilité accrue</h3>
              <p class="text-text text-base">Votre exploitation est visible par des centaines d'éleveurs potentiels dans tout le Burkina Faso.</p>
            </div>
            <div class="bg-green-soft rounded-2xl p-6 border-2 border-green">
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Gestion simplifiée</h3>
              <p class="text-text text-base">Gérez vos stocks, vos commandes et vos livraisons depuis une seule plateforme intuitive.</p>
            </div>
            <div class="bg-green-soft rounded-2xl p-6 border-2 border-green">
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Paiement garanti</h3>
              <p class="text-text text-base">Recevez vos paiements de manière sécurisée via Orange Money, sans risque d'impayé.</p>
            </div>
            <div class="bg-green-soft rounded-2xl p-6 border-2 border-green">
              <h3 class="text-xl font-serif text-wine font-semibold mb-3">Support dédié</h3>
              <p class="text-text text-base">Bénéficiez d'un support technique et commercial pour vous accompagner dans votre développement.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="py-20 bg-cream">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-serif text-wine mb-6 font-semibold">Prêt à commencer ?</h2>
          <p class="text-text text-lg mb-8">Rejoignez la communauté BioConversion dès maintenant et développez votre activité.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button (click)="selectProfile('producteur')" class="bg-wine text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors shadow-lg hover:shadow-xl">
              Commencer comme Producteur
            </button>
            <button (click)="selectProfile('eleveur')" class="bg-green text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-soft transition-colors shadow-lg hover:shadow-xl">
              Commencer comme Éleveur
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-white border-t border-line py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="flex items-center mb-4 md:mb-0">
              <div class="w-10 h-10 rounded-full border-2 border-wine flex items-center justify-center mr-3 bg-green-soft overflow-hidden">
                <img src="/logo.png" alt="BioConversion Logo" class="w-8 h-8 object-contain">
              </div>
              <span class="text-xl font-serif text-wine font-bold">BioConversion</span>
            </div>
            <div class="text-text text-sm">
              © 2026 BioConversion - ODC Groupe 3. Tous droits réservés.
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
export class AccueilComponent {
  constructor(private router: Router) {}

  selectProfile(profile: string): void {
    if (profile === 'producteur') {
      this.router.navigate(['/inscription/producteur']);
    } else if (profile === 'eleveur') {
      this.router.navigate(['/inscription/eleveur']);
    }
  }
}