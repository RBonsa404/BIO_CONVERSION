import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProducteurRegisterRequest } from '../../../core/models/producteur-register-request.model';

@Component({
  selector: 'app-inscription-producteur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream px-5 py-8">
      <div class="mx-auto w-full max-w-6xl rounded-3xl border border-line bg-white p-6 shadow-lg md:p-10">
        <!-- Header -->
        <div class="mb-8 text-left">
          <div class="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-wine bg-green-soft sm:mr-4">
              <img src="/logo.png" alt="Emblème BioConversion" class="h-full w-full object-contain">
            </div>
            <h1 class="font-serif text-4xl font-bold text-wine md:text-5xl">Inscription producteur</h1>
          </div>
          <p class="text-text text-lg">Rejoignez la communauté BioConversion</p>
        </div>

        <!-- Form -->
        <form [formGroup]="inscriptionForm" (ngSubmit)="onSubmit()">
          <!-- Personal Info -->
          <div class="mb-8 rounded-2xl border-b border-line pb-7">
            <h3 class="text-xl font-serif text-wine font-semibold mb-6 flex items-center">
              <span class="w-8 h-8 bg-wine rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">1</span>
              </span>
              Informations personnelles
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="nom" class="block text-text text-sm font-semibold mb-2">Nom *</label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  placeholder="Votre nom"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
              <div>
                <label for="prenom" class="block text-text text-sm font-semibold mb-2">Prénom *</label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  placeholder="Votre prénom"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
              <div class="md:col-span-2">
                <label for="telephone" class="block text-text text-sm font-semibold mb-2">Téléphone *</label>
                <input
                  id="telephone"
                  type="tel"
                  formControlName="telephone"
                  placeholder="+226 XX XX XX XX"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Account Info -->
          <div class="mb-8 rounded-2xl border-b border-line pb-7">
            <h3 class="text-xl font-serif text-wine font-semibold mb-6 flex items-center">
              <span class="w-8 h-8 bg-wine rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">2</span>
              </span>
              Compte
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="motDePasse" class="block text-text text-sm font-semibold mb-2">Mot de passe *</label>
                <input
                  id="motDePasse"
                  type="password"
                  formControlName="motDePasse"
                  placeholder="•••••••••"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
              <div>
                <label for="confirmationMotDePasse" class="block text-text text-sm font-semibold mb-2">Confirmation mot de passe *</label>
                <input
                  id="confirmationMotDePasse"
                  type="password"
                  formControlName="confirmationMotDePasse"
                  placeholder="•••••••••"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Farm Info -->
          <div class="mb-8 rounded-2xl border-b border-line pb-7">
            <h3 class="text-xl font-serif text-wine font-semibold mb-6 flex items-center">
              <span class="w-8 h-8 bg-wine rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">3</span>
              </span>
              Informations ferme
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label for="nomExploitation" class="block text-text text-sm font-semibold mb-2">Nom de l'exploitation *</label>
                <input
                  id="nomExploitation"
                  type="text"
                  formControlName="nomExploitation"
                  placeholder="Ex: Ferme Dounord"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
              <div>
                <label for="capaciteProduction" class="block text-text text-sm font-semibold mb-2">Capacité de production (kg/mois) *</label>
                <input
                  id="capaciteProduction"
                  type="number"
                  formControlName="capaciteProduction"
                  placeholder="Ex: 500"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
              <div>
                <label for="province" class="block text-text text-sm font-semibold mb-2">Province</label>
                <input
                  id="province"
                  type="text"
                  formControlName="province"
                  placeholder="Ex: Centre"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
              <div>
                <label for="ville" class="block text-text text-sm font-semibold mb-2">Ville</label>
                <input
                  id="ville"
                  type="text"
                  formControlName="ville"
                  placeholder="Ex: Ouagadougou"
                  class="w-full px-4 py-3 border-2 border-line rounded-xl focus:outline-none focus:border-wine transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            {{ errorMessage }}
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            [disabled]="inscriptionForm.invalid || isLoading"
            class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
            <span *ngIf="!isLoading">S'inscrire</span>
            <span *ngIf="isLoading">Inscription en cours...</span>
          </button>
        </form>

        <!-- Back link -->
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
export class InscriptionProducteurComponent {
  inscriptionForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmationMotDePasse: ['', [Validators.required]],
      nomExploitation: ['', [Validators.required]],
      capaciteProduction: ['', [Validators.required]],
      province: [''],
      ville: ['']
    });
  }

  onSubmit(): void {
    if (this.inscriptionForm.invalid) {
      return;
    }

    // Check password confirmation
    if (this.inscriptionForm.value.motDePasse !== this.inscriptionForm.value.confirmationMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.inscriptionForm.value;
    const cleanedData: ProducteurRegisterRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      telephone: formValue.telephone,
      motDePasse: formValue.motDePasse,
      nomExploitation: formValue.nomExploitation,
      capaciteProduction: Number(formValue.capaciteProduction),
      ...(formValue.province ? { province: formValue.province } : {}),
      ...(formValue.ville ? { ville: formValue.ville } : {})
    };

    this.authService.registerProducteur(cleanedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/connexion']);
      },
      error: (error: { error?: { message?: string } }) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  goToAccueil(): void {
    this.router.navigate(['/accueil']);
  }
}