import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream flex items-center justify-center p-8 relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-green blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-wine blur-3xl"></div>
      </div>

      <!-- Login card -->
      <div class="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full relative z-10 border border-line">
        <div class="text-center mb-10">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 rounded-full border-3 border-wine flex items-center justify-center mr-4 bg-green-soft">
              <svg class="w-10 h-10 text-wine" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </div>
            <h1 class="text-3xl font-serif text-wine font-bold">Connexion</h1>
          </div>
          <p class="text-text text-base">Connectez-vous à votre compte BioConversion</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="telephone" class="block text-text text-sm font-semibold mb-2">
              Numéro de téléphone <span class="text-wine">*</span>
            </label>
            <input
              id="telephone"
              type="tel"
              formControlName="telephone"
              placeholder="+226 XX XX XX XX"
              class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
            />
            <div *ngIf="loginForm.get('telephone')?.touched && loginForm.get('telephone')?.invalid" class="text-red-500 text-sm mt-2">
              Le numéro de téléphone est requis
            </div>
          </div>

          <div class="mb-6">
            <label for="motDePasse" class="block text-text text-sm font-semibold mb-2">
              Mot de passe <span class="text-wine">*</span>
            </label>
            <input
              id="motDePasse"
              type="password"
              formControlName="motDePasse"
              placeholder="•••••••••"
              class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
            />
            <div *ngIf="loginForm.get('motDePasse')?.touched && loginForm.get('motDePasse')?.invalid" class="text-red-500 text-sm mt-2">
              Le mot de passe est requis
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
            <span *ngIf="!isLoading">Se connecter</span>
            <span *ngIf="isLoading">Connexion en cours...</span>
          </button>

          <div *ngIf="errorMessage" class="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
            {{ errorMessage }}
          </div>
        </form>

        <div class="mt-8 text-center">
          <a (click)="goToAccueil()" class="text-wine hover:text-wine-dark underline font-semibold cursor-pointer">
            Retour à l'accueil
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
export class ConnexionComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      telephone: ['', [Validators.required]],
      motDePasse: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Redirect based on user role
        if (response.utilisateur.role === 'PRODUCTEUR') {
          this.router.navigate(['/dashboard/producteur']);
        } else if (response.utilisateur.role === 'ELEVEUR') {
          this.router.navigate(['/marketplace']);
        } else if (response.utilisateur.role === 'ADMINISTRATEUR' || response.utilisateur.role === 'SUPER_ADMINISTRATEUR') {
          this.router.navigate(['/admin']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Numéro de téléphone ou mot de passe incorrect';
      }
    });
  }

  goToAccueil(): void {
    this.router.navigate(['/accueil']);
  }
}