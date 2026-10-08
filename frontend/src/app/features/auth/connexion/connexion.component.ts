import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { messageErreur } from '../../../core/utils/http-error';
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

        <!-- En-tête -->
        <div class="text-center mb-10">

          <div class="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-0">

            <div
              class="mr-0 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-wine bg-green-soft sm:mr-4"
            >
              <img
                src="/logo.webp"
                alt="Emblème BioConversion"
                class="h-full w-full object-contain"
              >
            </div>

            <h1 class="text-3xl font-serif text-wine font-bold">
              Connexion
            </h1>

          </div>

          <p class="text-text text-base">
            Connectez-vous à votre compte BioConversion
          </p>

        </div>

        <div
          *ngIf="infoMessage"
          role="status"
          class="mb-6 rounded-xl border border-green bg-green-soft p-4 text-sm text-green"
        >
          {{ infoMessage }}
        </div>

        <!-- Formulaire -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

          <!-- Numéro de téléphone -->
          <div class="mb-6">

            <label
              for="telephone"
              class="block text-text text-sm font-semibold mb-2"
            >
              Numéro de téléphone
              <span class="text-wine">*</span>
            </label>

            <input
              id="telephone"
              type="tel"
              formControlName="telephone"
              placeholder="+226 XX XX XX XX"
              class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
            />

            <div
              *ngIf="
                loginForm.get('telephone')?.touched &&
                loginForm.get('telephone')?.invalid
              "
              class="text-red-500 text-sm mt-2"
            >
              Le numéro de téléphone est requis
            </div>

          </div>

          <!-- Mot de passe -->
          <div class="mb-6">

            <label
              for="motDePasse"
              class="block text-text text-sm font-semibold mb-2"
            >
              Mot de passe
              <span class="text-wine">*</span>
            </label>

            <!-- Champ + bouton œil -->
            <div class="relative">

              <input
                id="motDePasse"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="motDePasse"
                placeholder="•••••••••"
                class="w-full px-4 py-3 pr-12 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
              />

              <!-- Bouton afficher / masquer -->
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-wine transition-colors"
                [attr.aria-label]="
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                "
                [attr.title]="
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                "
              >

                <!-- Œil fermé : mot de passe masqué -->
                <svg
                  *ngIf="!showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-5 h-5"
                  aria-hidden="true"
                >
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>

                <!-- Œil barré : mot de passe visible -->
                <svg
                  *ngIf="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M3 3l18 18" />
                  <path
                    d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                  />
                  <path
                    d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18.3 18.3 0 0 1-3.1 4.2"
                  />
                  <path
                    d="M6.2 6.2C3.5 8.3 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 2.1-.2"
                  />
                </svg>

              </button>

            </div>

            <!-- Erreur mot de passe -->
            <div
              *ngIf="
                loginForm.get('motDePasse')?.touched &&
                loginForm.get('motDePasse')?.invalid
              "
              class="text-red-500 text-sm mt-2"
            >
              Le mot de passe est requis
            </div>

          </div>

          <!-- Bouton connexion -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >

            <span *ngIf="!isLoading">
              Se connecter
            </span>

            <span *ngIf="isLoading">
              Connexion en cours...
            </span>

          </button>

          <!-- Message d'erreur -->
          <div
            *ngIf="errorMessage"
            role="alert"
            class="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
          >
            {{ errorMessage }}
          </div>

        </form>

        <!-- Retour accueil -->
        <div class="mt-8 text-center">

          <a
            routerLink="/accueil"
            class="text-wine hover:text-wine-dark underline font-semibold cursor-pointer"
          >
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
export class ConnexionComponent implements OnInit {

  loginForm: FormGroup;

  isLoading = false;

  errorMessage = '';

  // Information affichée à l'arrivée (inscription réussie, session expirée)
  infoMessage = '';

  // Contrôle l'affichage du mot de passe
  showPassword = false;

  // Page demandée avant la connexion, s'il y en a une
  private retour: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {

    this.loginForm = this.fb.group({
      telephone: ['', [Validators.required]],
      motDePasse: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const retour = params.get('retour');
    // Seuls les chemins internes sont acceptés comme destination de retour
    this.retour = retour && retour.startsWith('/') && !retour.startsWith('//') ? retour : null;

    if (params.get('inscription') === 'ok') {
      this.infoMessage = 'Votre compte a bien été créé. Il sera utilisable dès sa validation par un administrateur.';
    } else if (params.get('session') === 'expiree') {
      this.infoMessage = 'Votre session a expiré. Reconnectez-vous pour continuer.';
    }
  }

  /**
   * Affiche ou masque le mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Connexion de l'utilisateur
   */
  onSubmit(): void {

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.authService.login(this.loginForm.value).subscribe({

      next: (response) => {

        this.isLoading = false;

        // Retour à la page demandée, sinon espace correspondant au rôle
        // (les gardes de routes renvoient vers le bon espace si le rôle ne convient pas)
        this.router.navigateByUrl(this.retour ?? this.authService.homeRoute(response.utilisateur.role));

      },

      error: (error) => {

        this.isLoading = false;

        // Le backend précise la cause : identifiants, compte en attente, refusé ou suspendu
        this.errorMessage = messageErreur(error, 'Numéro de téléphone ou mot de passe incorrect');

        this.changeDetectorRef.markForCheck();

      }

    });

  }

}