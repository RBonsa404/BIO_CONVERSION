import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { EleveurRegisterRequest } from '../../../core/models/eleveur-register-request.model';

@Component({
  selector: 'app-inscription-eleveur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream flex items-center justify-center p-8 relative overflow-hidden">
      <!-- Decorative background -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-green blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-wine blur-3xl"></div>
      </div>

      <!-- Registration form card -->
      <div class="bg-white rounded-3xl shadow-2xl p-10 max-w-3xl w-full relative z-10 border border-line">
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="flex items-center justify-center mb-6">
            <div class="w-16 h-16 rounded-full border-3 border-wine flex items-center justify-center mr-4 bg-green-soft overflow-hidden">
              <img src="logo.png" alt="BioConversion Logo" class="w-13 h-13 object-contain">
            </div>
            <h1 class="text-3xl font-serif text-wine font-bold">Inscription Éleveur</h1>
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
                Le numéro de téléphone est requis
              </div>
            </div>

            <div class="mt-6">
              <label for="typeElevage" class="block text-text text-sm font-semibold mb-2">
                Type d'élevage <span class="text-wine">*</span>
              </label>
              <select
                id="typeElevage"
                formControlName="typeElevage"
                class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-all bg-white"
              >
                <option value="">Sélectionnez votre type d'élevage</option>
                <option value="PISCICULTURE">Pisciculture</option>
                <option value="AVICULTURE">Aviculture</option>
                <option value="AUTRE">Autre</option>
              </select>
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
              <div *ngIf="inscriptionForm.get('confirmationMotDePasse')?.touched && inscriptionForm.get('confirmationMotDePasse')?.invalid" class="text-red-500 text-sm mt-2">
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
export class InscriptionEleveurComponent {
  inscriptionForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmationMotDePasse: ['', [Validators.required]],
      typeElevage: ['', [Validators.required]],
      adresse: [''],
      province: [''],
      ville: [''],
      latitude: [''],
      longitude: ['']
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('motDePasse');
    const confirmation = form.get('confirmationMotDePasse');
    
    if (password && confirmation && password.value !== confirmation.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.inscriptionForm.invalid) {
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
      ...(formValue.ville ? { ville: formValue.ville } : {})
    };

    this.authService.registerEleveur(cleanedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/connexion']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      }
    });
  }
}