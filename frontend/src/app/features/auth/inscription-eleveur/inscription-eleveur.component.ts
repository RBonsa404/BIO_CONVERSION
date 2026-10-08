import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { messageErreur } from '../../../core/utils/http-error';
import { Position, champsIdentiques, obtenirPosition, telephoneBurkinabe } from '../../../core/utils/validators';
import { AuthService } from '../../../core/services/auth.service';
import { EleveurRegisterRequest } from '../../../core/models/eleveur-register-request.model';

@Component({
  selector: 'app-inscription-eleveur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream px-5 py-8 relative">
      <!-- Decorative background -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-green blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-wine blur-3xl"></div>
      </div>

      <!-- Registration form card -->
      <div class="mx-auto bg-white rounded-3xl shadow-lg p-6 max-w-6xl w-full relative z-10 border border-line md:p-10">
        <!-- Header -->
        <div class="mb-8 text-left">
          <div class="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-wine bg-green-soft sm:mr-4">
              <img src="/logo.webp" alt="Emblème BioConversion" class="h-full w-full object-contain">
            </div>
            <h1 class="font-serif text-4xl font-bold text-wine md:text-5xl">Inscription éleveur</h1>
          </div>
          <p class="text-text text-base">Rejoignez la communauté BioConversion et trouvez les meilleurs producteurs</p>
        </div>

        <!-- Form -->
        <form [formGroup]="inscriptionForm" (ngSubmit)="onSubmit()">
          <!-- Personal information section -->
          <div class="mb-8">
            <div class="flex items-center mb-6">
              <div class="w-10 h-10 rounded-full bg-wine flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 class="text-xl font-serif text-wine font-semibold">Informations personnelles</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="nom" class="block text-text text-sm font-semibold mb-2">
                  Nom <span class="text-wine">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  placeholder="Votre nom"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
                />
                <div *ngIf="inscriptionForm.get('nom')?.touched && inscriptionForm.get('nom')?.invalid" class="text-red-500 text-sm mt-2">
                  Le nom est requis
                </div>
              </div>

              <div>
                <label for="prenom" class="block text-text text-sm font-semibold mb-2">
                  Prénom <span class="text-wine">*</span>
                </label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  placeholder="Vos prénoms"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
                />
                <div *ngIf="inscriptionForm.get('prenom')?.touched && inscriptionForm.get('prenom')?.invalid" class="text-red-500 text-sm mt-2">
                  Les prénoms sont requis
                </div>
              </div>
            </div>

            <div class="mt-6">
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
              <div *ngIf="inscriptionForm.get('telephone')?.touched && inscriptionForm.get('telephone')?.invalid" class="text-red-500 text-sm mt-2">
                Saisissez un numéro à 8 chiffres (ex. +226 70 12 34 56)
              </div>
            </div>

            <div class="mt-6">
              <p id="typeElevage-label" class="mb-3 block text-sm font-semibold text-text">
                Type d'élevage <span class="text-wine">*</span>
              </p>
              <div role="radiogroup" aria-labelledby="typeElevage-label" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label class="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-line p-4 transition hover:border-green has-[:checked]:border-green has-[:checked]:bg-green-soft/50">
                  <input type="radio" formControlName="typeElevage" value="PISCICULTURE" class="accent-green">
                  <span class="grid h-14 w-14 place-items-center rounded-full bg-green-soft" aria-hidden="true">
                    <svg viewBox="0 0 48 48" class="h-9 w-9" fill="none" stroke="#4e7d3f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 24c8-10 20-14 32-5l7 5-7 5C25 38 13 34 5 24Z" />
                      <circle cx="34" cy="22" r="1.5" fill="#4e7d3f" />
                      <path d="M8 37c5-3 10-3 15 0s10 3 16 0" />
                    </svg>
                  </span>
                  <span><strong class="block font-serif text-lg text-wine">Pisciculteur</strong><small class="text-text">J’élève des poissons</small></span>
                </label>
                <label class="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-line p-4 transition hover:border-green has-[:checked]:border-green has-[:checked]:bg-green-soft/50">
                  <input type="radio" formControlName="typeElevage" value="AVICULTURE" class="accent-green">
                  <span class="grid h-14 w-14 place-items-center rounded-full bg-green-soft" aria-hidden="true">
                    <svg viewBox="0 0 48 48" class="h-9 w-9" fill="none" stroke="#4e7d3f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 35c-5-6-4-15 2-19l4 3c2-5 7-8 12-6l-1 5c5-1 9 2 10 7l-5 1c2 4 1 8-3 11H16l-4-2Z" />
                      <path d="m30 18 5-5m-19 25v3m12-3v3m-13-6 4-1m15 1-4-1m8-14 4 2-4 2" />
                    </svg>
                  </span>
                  <span><strong class="block font-serif text-lg text-wine">Aviculteur</strong><small class="text-text">J’élève des volailles</small></span>
                </label>
              </div>
              <div *ngIf="inscriptionForm.get('typeElevage')?.touched && inscriptionForm.get('typeElevage')?.invalid" class="text-red-500 text-sm mt-2">
                Le type d'élevage est requis
              </div>
            </div>
          </div>

          <!-- Location section (optional) -->
          <div class="mb-8">
            <div class="flex items-center mb-6">
              <div class="w-10 h-10 rounded-full bg-green flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <h3 class="text-xl font-serif text-wine font-semibold">Localisation (optionnel)</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="province" class="block text-text text-sm font-semibold mb-2">
                  Province
                </label>
                <input
                  id="province"
                  type="text"
                  formControlName="province"
                  placeholder="Votre province"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
                />
              </div>

              <div>
                <label for="ville" class="block text-text text-sm font-semibold mb-2">
                  Ville
                </label>
                <input
                  id="ville"
                  type="text"
                  formControlName="ville"
                  placeholder="Votre ville"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
                />
              </div>
            </div>

            <div class="mt-6">
              <label for="adresse" class="block text-text text-sm font-semibold mb-2">
                Adresse
              </label>
              <textarea
                id="adresse"
                formControlName="adresse"
                rows="2"
                placeholder="Adresse complète"
                class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all resize-none"
              ></textarea>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" (click)="localiser()" [disabled]="isLocating"
                      class="rounded-xl border-2 border-green px-4 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                {{ isLocating ? 'Localisation en cours...' : (position ? 'Actualiser ma position' : 'Utiliser ma position actuelle') }}
              </button>
              <p class="text-sm text-text" role="status">
                {{ positionMessage || 'Facultatif : partagez votre position pour trouver les producteurs les plus proches.' }}
              </p>
            </div>
          </div>

          <!-- Account information section -->
          <div class="mb-8">
            <div class="flex items-center mb-6">
              <div class="w-10 h-10 rounded-full bg-wine-dark flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-serif text-wine font-semibold">Compte</h3>
            </div>
            
            <div>
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
              <div *ngIf="inscriptionForm.get('motDePasse')?.touched && inscriptionForm.get('motDePasse')?.invalid" class="text-red-500 text-sm mt-2">
                Le mot de passe doit contenir au moins 6 caractères
              </div>
            </div>

            <div class="mt-6">
              <label for="confirmationMotDePasse" class="block text-text text-sm font-semibold mb-2">
                Confirmation mot de passe <span class="text-wine">*</span>
              </label>
              <input
                id="confirmationMotDePasse"
                type="password"
                formControlName="confirmationMotDePasse"
                placeholder="•••••••••"
                class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all"
              />
              <div *ngIf="inscriptionForm.get('confirmationMotDePasse')?.touched && (inscriptionForm.get('confirmationMotDePasse')?.invalid || inscriptionForm.hasError('confirmation'))" class="text-red-500 text-sm mt-2">
                Les mots de passe ne correspondent pas
              </div>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            [disabled]="inscriptionForm.invalid || isLoading"
            class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
            <span *ngIf="!isLoading">S'inscrire</span>
            <span *ngIf="isLoading">Inscription en cours...</span>
          </button>

          <!-- Error message -->
          <div *ngIf="errorMessage" class="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
            {{ errorMessage }}
          </div>
        </form>

        <!-- Back link -->
        <div class="mt-8 text-center">
          <a [routerLink]="'/accueil'" class="text-wine hover:text-wine-dark underline font-semibold cursor-pointer">
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
export class InscriptionEleveurComponent implements OnInit {
  inscriptionForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  // Position GPS facultative (consentement explicite de l'éleveur)
  position: Position | null = null;
  positionMessage = '';
  isLocating = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      telephone: ['', [Validators.required, telephoneBurkinabe]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmationMotDePasse: ['', [Validators.required]],
      typeElevage: ['', [Validators.required]],
      adresse: [''],
      province: [''],
      ville: ['']
    }, { validators: champsIdentiques('motDePasse', 'confirmationMotDePasse') });
  }

  ngOnInit(): void {
    // Carte « Pisciculteur » ou « Aviculteur » choisie sur la page d'accueil
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type === 'PISCICULTURE' || type === 'AVICULTURE') {
      this.inscriptionForm.patchValue({ typeElevage: type });
    }
  }

  localiser(): void {
    this.isLocating = true;
    this.positionMessage = '';
    obtenirPosition()
      .then(position => {
        this.position = position;
        this.positionMessage = 'Position enregistrée.';
      })
      .catch((message: string) => {
        this.position = null;
        this.positionMessage = message;
      })
      .finally(() => {
        this.isLocating = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  onSubmit(): void {
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.inscriptionForm.value;
    const cleanedData: EleveurRegisterRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      telephone: formValue.telephone,
      motDePasse: formValue.motDePasse,
      typeElevage: formValue.typeElevage,
      ...(formValue.adresse ? { adresse: formValue.adresse } : {}),
      ...(formValue.province ? { province: formValue.province } : {}),
      ...(formValue.ville ? { ville: formValue.ville } : {}),
      ...(this.position ?? {})
    };

    this.authService.registerEleveur(cleanedData).subscribe({
      next: () => {
        this.isLoading = false;
        // Le compte reste en attente tant qu'un administrateur ne l'a pas validé
        this.router.navigate(['/connexion'], { queryParams: { inscription: 'ok' } });
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.errorMessage = messageErreur(error, 'Erreur lors de l\'inscription. Veuillez réessayer.');
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}