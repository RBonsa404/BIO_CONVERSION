import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { messageErreur } from '../../../core/utils/http-error';
import { Position, champsIdentiques, obtenirPosition, telephoneBurkinabe } from '../../../core/utils/validators';
import { AuthService } from '../../../core/services/auth.service';
import { ProducteurRegisterRequest } from '../../../core/models/producteur-register-request.model';

/* Mêmes règles que le serveur : JPG, PNG ou PDF, 5 Mo au plus */
const TYPES_CNIB = ['image/jpeg', 'image/png', 'application/pdf'];
const TAILLE_MAX_CNIB = 5 * 1024 * 1024;

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
              <img src="/logo.webp" alt="Emblème BioConversion" class="h-full w-full object-contain">
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
              <div class="md:col-span-2 flex flex-wrap items-center gap-3">
                <button type="button" (click)="localiser()" [disabled]="isLocating"
                        class="rounded-xl border-2 border-green px-4 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                  {{ isLocating ? 'Localisation en cours...' : (position ? 'Actualiser ma position' : 'Utiliser ma position actuelle') }}
                </button>
                <p class="text-sm text-text" role="status">
                  {{ positionMessage || 'Facultatif : placez votre exploitation sur la carte des éleveurs. Sans position, elle est située à Ouagadougou.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pièce d'identité -->
          <div class="mb-8 rounded-2xl border-b border-line pb-7">
            <h3 class="text-xl font-serif text-wine font-semibold mb-6 flex items-center">
              <span class="w-8 h-8 bg-wine rounded-full flex items-center justify-center mr-3">
                <span class="text-white font-bold">4</span>
              </span>
              Pièce d'identité
            </h3>

            <label for="cnib" class="block text-text text-sm font-semibold mb-2">Photo ou scan de votre CNIB *</label>
            <input
              id="cnib"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              (change)="choisirCnib($event)"
              aria-describedby="cnib-aide"
              class="w-full rounded-xl border-2 border-dashed border-line px-4 py-3 text-text file:mr-4 file:rounded-lg file:border-0 file:bg-green-soft file:px-4 file:py-2 file:font-semibold file:text-green focus:outline-none focus:border-wine"
            />
            <p id="cnib-aide" class="mt-2 text-sm text-text">
              Format JPG, PNG ou PDF, 5 Mo maximum. Elle est vue uniquement par l’administrateur qui valide votre compte.
            </p>
            <p *ngIf="cnib" class="mt-1 text-sm font-medium text-green">Fichier choisi : {{ cnib.name }}</p>
            <p *ngIf="cnibErreur" class="mt-1 text-sm text-red-600" role="alert">{{ cnibErreur }}</p>
          </div>

          <p *ngIf="inscriptionForm.touched && inscriptionForm.invalid" class="mb-4 text-sm text-red-600" role="alert">
            <span *ngIf="invalide('telephone')">Le numéro de téléphone doit comporter 8 chiffres (ex. +226 70 12 34 56). </span>
            <span *ngIf="invalide('motDePasse')">Le mot de passe doit contenir au moins 6 caractères. </span>
            <span *ngIf="inscriptionForm.hasError('confirmation')">Les mots de passe ne correspondent pas. </span>
            <span *ngIf="invalide('nom') || invalide('prenom') || invalide('nomExploitation') || invalide('capaciteProduction')">Renseignez tous les champs marqués d’un astérisque.</span>
          </p>

          <!-- Error message -->
          <div *ngIf="errorMessage" role="alert" class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            {{ errorMessage }}
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            [disabled]="inscriptionForm.invalid || !cnib || isLoading"
            class="w-full bg-wine text-white py-4 rounded-xl font-semibold text-lg hover:bg-wine-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
            <span *ngIf="!isLoading">S'inscrire</span>
            <span *ngIf="isLoading">Inscription en cours...</span>
          </button>
        </form>

        <!-- Back link -->
        <div class="mt-8 text-center">
          <a routerLink="/accueil" class="text-wine hover:text-wine-dark underline font-semibold cursor-pointer">
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

  // Photo ou scan de la CNIB, obligatoire : l'administrateur la vérifie avant de valider le compte
  cnib: File | null = null;
  cnibErreur = '';

  // Position GPS de l'exploitation : elle place le producteur sur la carte des éleveurs
  position: Position | null = null;
  positionMessage = '';
  isLocating = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.inscriptionForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      telephone: ['', [Validators.required, telephoneBurkinabe]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmationMotDePasse: ['', [Validators.required]],
      nomExploitation: ['', [Validators.required]],
      capaciteProduction: ['', [Validators.required, Validators.min(0)]],
      province: [''],
      ville: ['']
    }, { validators: champsIdentiques('motDePasse', 'confirmationMotDePasse') });
  }

  invalide(champ: string): boolean {
    const control = this.inscriptionForm.get(champ);
    return !!control && control.touched && control.invalid;
  }

  /** Contrôle le fichier dès sa sélection : le serveur refait les mêmes vérifications. */
  choisirCnib(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.cnib = null;
    this.cnibErreur = '';
    if (!fichier) {
      return;
    }
    if (!TYPES_CNIB.includes(fichier.type)) {
      this.cnibErreur = 'Format non accepté : choisissez une image JPG, PNG ou un PDF.';
      return;
    }
    if (fichier.size > TAILLE_MAX_CNIB) {
      this.cnibErreur = 'Le fichier dépasse 5 Mo. Prenez une photo moins lourde ou réduisez le scan.';
      return;
    }
    this.cnib = fichier;
  }

  localiser(): void {
    this.isLocating = true;
    this.positionMessage = '';
    obtenirPosition()
      .then(position => {
        this.position = position;
        this.positionMessage = 'Position de l’exploitation enregistrée.';
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
    if (this.inscriptionForm.invalid || !this.cnib) {
      this.inscriptionForm.markAllAsTouched();
      if (!this.cnib && !this.cnibErreur) {
        this.cnibErreur = 'La photo ou le scan de votre CNIB est obligatoire.';
      }
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
      ...(formValue.ville ? { ville: formValue.ville } : {}),
      ...(this.position ?? {})
    };

    this.authService.registerProducteur(cleanedData, this.cnib).subscribe({
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