import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <!-- Decorative background pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-20 left-20 w-96 h-96 rounded-full bg-green blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-wine blur-3xl"></div>
      </div>

      <!-- Main content -->
      <div class="relative z-10 max-w-6xl w-full">
        <!-- Logo and hero section -->
        <div class="text-center mb-16">
          <div class="flex items-center justify-center mb-6">
            <div class="w-20 h-20 rounded-full border-3 border-wine flex items-center justify-center mr-5 bg-white shadow-lg">
              <svg class="w-12 h-12 text-wine" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </div>
            <h1 class="text-5xl font-serif text-wine font-bold tracking-tight">BioConversion</h1>
          </div>
          <p class="text-green font-medium text-xl mb-3">Plateforme agri-tech pour l'élevage BSFL au Burkina Faso</p>
          <p class="text-text text-base max-w-2xl mx-auto leading-relaxed">
            Connectez-vous à un réseau de producteurs et éleveurs pour des transactions
            sécurisées de larves de mouches soldats noires (BSFL)
          </p>
        </div>

        <!-- Profile selection cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <!-- Producteur card -->
          <div
            class="bg-white rounded-3xl shadow-xl p-10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-line"
            (click)="selectProfile('producteur')">
            <div class="text-center">
              <div class="w-24 h-24 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green">
                <svg class="w-14 h-14 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                </svg>
              </div>
              <h2 class="text-3xl font-serif text-wine mb-3 font-bold">Producteur</h2>
              <p class="text-text text-base mb-6 leading-relaxed">
                Vendez vos larves BSFL aux éleveurs de votre région et développez votre activité
              </p>
              <div class="inline-block bg-wine text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-wine-dark transition-colors">
                S'inscrire comme producteur
              </div>
            </div>
          </div>

          <!-- Eleveur card -->
          <div
            class="bg-white rounded-3xl shadow-xl p-10 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-line"
            (click)="selectProfile('eleveur')">
            <div class="text-center">
              <div class="w-24 h-24 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green">
                <svg class="w-14 h-14 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L4.95 12.06c.24-.38.4-.81.4-1.27 0-3.31 2.69-6 6-6 .4 0 .79.08 1.16.23l1.96-2.22c-.58-.67-.91-1.54-.91-2.47 0-2.21 1.79-4 4-4 .94 0 1.81.34 2.48.92l2.22-1.96c-.15-.37-.23-.76-.23-1.16 0-3.31 2.69-6 6-6 .46 0 .89-.16 1.27-.4l-1.85 1.24c.13.58.21 1.17.21 1.79 0 4.08-3.05 7.44-7 7.93z"/>
                </svg>
              </div>
              <h2 class="text-3xl font-serif text-wine mb-3 font-bold">Éleveur</h2>
              <p class="text-text text-base mb-6 leading-relaxed">
                Achetez des larves de qualité pour votre pisciculture ou aviculture au meilleur prix
              </p>
              <div class="inline-block bg-wine text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-wine-dark transition-colors">
                S'inscrire comme éleveur
              </div>
            </div>
          </div>
        </div>

        <!-- Login link -->
        <div class="mt-12 text-center">
          <p class="text-text text-sm mb-2">Vous avez déjà un compte ?</p>
          <a (click)="goToLogin()" class="text-wine hover:text-wine-dark underline font-semibold cursor-pointer text-lg">
            Se connecter
          </a>
        </div>

        <!-- Trust badges -->
        <div class="mt-16 flex flex-wrap justify-center gap-8 text-text text-sm">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span>Transactions sécurisées</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Qualité garantie</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span>Support local</span>
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

  goToLogin(): void {
    this.router.navigate(['/connexion']);
  }
}
