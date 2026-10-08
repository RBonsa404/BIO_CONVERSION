import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfilUpdateRequest, UtilisateurInfo } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { messageErreur } from '../../core/utils/http-error';
import { libelleRole } from '../../core/utils/statuts';
import { Position, champsIdentiques, obtenirPosition } from '../../core/utils/validators';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-3xl">
        <app-page-header titre="Mon profil" sousTitre="Vos informations personnelles et l’accès à votre compte">
          <span class="rounded-full bg-green-soft px-4 py-2 text-sm font-semibold text-green">{{ roleLabel() }}</span>
        </app-page-header>

        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ errorMessage() }}</div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (user(); as u) {
          <form [formGroup]="profilForm" (ngSubmit)="enregistrer()"
                class="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-5 font-serif text-2xl font-semibold text-wine">Informations</h2>
            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label for="prenom" class="mb-2 block text-sm font-semibold text-text">Prénom *</label>
                <input id="prenom" type="text" formControlName="prenom" maxlength="100" autocomplete="given-name"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="nom" class="mb-2 block text-sm font-semibold text-text">Nom *</label>
                <input id="nom" type="text" formControlName="nom" maxlength="100" autocomplete="family-name"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <span class="mb-2 block text-sm font-semibold text-text">Téléphone (identifiant de connexion)</span>
                <p class="rounded-xl border-2 border-line bg-cream px-4 py-3 text-text">{{ u.telephone }}</p>
              </div>
              <div>
                <span class="mb-2 block text-sm font-semibold text-text">Rôle</span>
                <p class="rounded-xl border-2 border-line bg-cream px-4 py-3 text-text">{{ roleLabel() }}</p>
              </div>

              @if (u.role === 'PRODUCTEUR') {
                <div>
                  <label for="nomExploitation" class="mb-2 block text-sm font-semibold text-text">Nom de l’exploitation *</label>
                  <input id="nomExploitation" type="text" formControlName="nomExploitation" maxlength="200"
                         class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                </div>
                <div>
                  <label for="capaciteProduction" class="mb-2 block text-sm font-semibold text-text">Capacité de production (kg/mois)</label>
                  <input id="capaciteProduction" type="number" min="0" formControlName="capaciteProduction"
                         class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                </div>
              }
              @if (u.role === 'ELEVEUR') {
                <div>
                  <label for="typeElevage" class="mb-2 block text-sm font-semibold text-text">Type d’élevage</label>
                  <select id="typeElevage" formControlName="typeElevage"
                          class="w-full rounded-xl border-2 border-line bg-white px-4 py-3 focus:border-wine focus:outline-none">
                    <option value="PISCICULTURE">Pisciculture</option>
                    <option value="AVICULTURE">Aviculture</option>
                  </select>
                </div>
                <div>
                  <label for="adresse" class="mb-2 block text-sm font-semibold text-text">Adresse</label>
                  <input id="adresse" type="text" formControlName="adresse" maxlength="500"
                         class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                </div>
              }
              @if (u.role === 'PRODUCTEUR' || u.role === 'ELEVEUR') {
                <div>
                  <label for="ville" class="mb-2 block text-sm font-semibold text-text">Ville</label>
                  <input id="ville" type="text" formControlName="ville" maxlength="150"
                         class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                </div>
                <div>
                  <label for="province" class="mb-2 block text-sm font-semibold text-text">Province</label>
                  <input id="province" type="text" formControlName="province" maxlength="150"
                         class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
                </div>
                <div class="flex flex-wrap items-center gap-3 md:col-span-2">
                  <button type="button" (click)="localiser()" [disabled]="isLocating()"
                          class="rounded-xl border-2 border-green px-4 py-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-50">
                    {{ isLocating() ? 'Localisation en cours...' : 'Mettre à jour ma position GPS' }}
                  </button>
                  <p class="text-sm text-text" role="status">{{ positionMessage() || positionActuelle() }}</p>
                </div>
              }
            </div>
            @if (profilForm.invalid && profilForm.touched) {
              <p class="mt-4 text-sm text-red-600" role="alert">Le nom et le prénom sont obligatoires.</p>
            }
            <button type="submit" [disabled]="isSaving()"
                    class="mt-6 rounded-xl bg-wine px-6 py-3 font-semibold text-white hover:bg-wine-dark disabled:opacity-50">
              {{ isSaving() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </form>

          <form [formGroup]="motDePasseForm" (ngSubmit)="changerMotDePasse()"
                class="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-5 font-serif text-2xl font-semibold text-wine">Mot de passe</h2>
            <div class="grid gap-5 md:grid-cols-3">
              <div>
                <label for="ancienMotDePasse" class="mb-2 block text-sm font-semibold text-text">Mot de passe actuel</label>
                <input id="ancienMotDePasse" type="password" formControlName="ancienMotDePasse" autocomplete="current-password"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="nouveauMotDePasse" class="mb-2 block text-sm font-semibold text-text">Nouveau mot de passe</label>
                <input id="nouveauMotDePasse" type="password" formControlName="nouveauMotDePasse" autocomplete="new-password"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="confirmation" class="mb-2 block text-sm font-semibold text-text">Confirmation</label>
                <input id="confirmation" type="password" formControlName="confirmation" autocomplete="new-password"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
            </div>
            @if (motDePasseForm.touched && motDePasseForm.invalid) {
              <p class="mt-4 text-sm text-red-600" role="alert">
                {{ motDePasseForm.hasError('confirmation')
                    ? 'La confirmation ne correspond pas au nouveau mot de passe.'
                    : 'Renseignez les trois champs ; le nouveau mot de passe compte au moins 6 caractères.' }}
              </p>
            }
            <button type="submit" [disabled]="isSavingPassword()"
                    class="mt-6 rounded-xl border border-wine bg-white px-6 py-3 font-semibold text-wine hover:bg-cream disabled:opacity-50">
              {{ isSavingPassword() ? 'Modification...' : 'Changer le mot de passe' }}
            </button>
          </form>

          <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-2 font-serif text-2xl font-semibold text-wine">Session</h2>
            <p class="mb-5 text-sm text-text">
              Vous avez deux comptes (par exemple producteur et éleveur) ? Changez de profil pour vous connecter avec l’autre.
            </p>
            <div class="flex flex-wrap gap-3">
              <button type="button" (click)="changerDeProfil()"
                      class="rounded-xl border border-wine bg-white px-6 py-3 font-semibold text-wine hover:bg-cream">
                Changer de profil
              </button>
              <button type="button" (click)="seDeconnecter()"
                      class="rounded-xl bg-wine px-6 py-3 font-semibold text-white hover:bg-wine-dark">
                Se déconnecter
              </button>
            </div>
          </section>
        }
      </div>
    </main>
  `
})
export class ProfilComponent implements OnInit {
  readonly profilForm: FormGroup;
  readonly motDePasseForm: FormGroup;

  readonly user = computed(() => this.authService.currentUser());
  readonly roleLabel = computed(() => libelleRole(this.user()?.role, this.user()?.typeElevage));
  readonly positionActuelle = computed(() => {
    const u = this.user();
    return u?.latitude != null && u?.longitude != null
      ? `Position enregistrée : ${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`
      : 'Aucune position GPS enregistrée.';
  });

  readonly isSaving = signal(false);
  readonly isSavingPassword = signal(false);
  readonly isLocating = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly positionMessage = signal('');

  private position: Position | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profilForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      nomExploitation: [''],
      capaciteProduction: [null as number | null, [Validators.min(0)]],
      typeElevage: [''],
      adresse: [''],
      ville: [''],
      province: ['']
    });
    this.motDePasseForm = this.fb.group({
      ancienMotDePasse: ['', [Validators.required]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmation: ['', [Validators.required]]
    }, { validators: champsIdentiques('nouveauMotDePasse', 'confirmation') });
  }

  ngOnInit(): void {
    const local = this.user();
    if (local) {
      this.remplir(local);
    }
    // Les données locales datent de la connexion : on relit le profil côté serveur
    this.authService.chargerProfil().subscribe({
      next: user => this.remplir(user),
      error: error => this.errorMessage.set(messageErreur(error, 'Impossible de charger votre profil.'))
    });
  }

  localiser(): void {
    this.isLocating.set(true);
    this.positionMessage.set('');
    obtenirPosition()
      .then(position => {
        this.position = position;
        this.positionMessage.set('Nouvelle position prête : enregistrez les modifications pour la conserver.');
      })
      .catch((message: string) => this.positionMessage.set(message))
      .finally(() => this.isLocating.set(false));
  }

  enregistrer(): void {
    const user = this.user();
    if (this.profilForm.invalid || !user) {
      this.profilForm.markAllAsTouched();
      return;
    }
    const valeur = this.profilForm.value;
    const requete: ProfilUpdateRequest = { nom: valeur.nom.trim(), prenom: valeur.prenom.trim() };
    if (user.role === 'PRODUCTEUR') {
      requete.nomExploitation = (valeur.nomExploitation ?? '').trim() || user.nomExploitation;
      if (valeur.capaciteProduction !== null && valeur.capaciteProduction !== '') {
        requete.capaciteProduction = Number(valeur.capaciteProduction);
      }
    }
    if (user.role === 'ELEVEUR') {
      requete.typeElevage = valeur.typeElevage || user.typeElevage;
      requete.adresse = (valeur.adresse ?? '').trim() || undefined;
    }
    if (user.role === 'PRODUCTEUR' || user.role === 'ELEVEUR') {
      requete.ville = (valeur.ville ?? '').trim() || undefined;
      requete.province = (valeur.province ?? '').trim() || undefined;
      if (this.position) {
        requete.latitude = this.position.latitude;
        requete.longitude = this.position.longitude;
      }
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.authService.modifierProfil(requete).subscribe({
      next: maj => {
        this.remplir(maj);
        this.position = null;
        this.positionMessage.set('');
        this.actionMessage.set('Votre profil est à jour.');
        this.isSaving.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Le profil n’a pas pu être enregistré. Réessayez.'));
        this.isSaving.set(false);
      }
    });
  }

  changerMotDePasse(): void {
    if (this.motDePasseForm.invalid) {
      this.motDePasseForm.markAllAsTouched();
      return;
    }
    const { ancienMotDePasse, nouveauMotDePasse } = this.motDePasseForm.value;
    this.isSavingPassword.set(true);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.authService.changerMotDePasse(ancienMotDePasse, nouveauMotDePasse).subscribe({
      next: () => {
        this.motDePasseForm.reset();
        this.actionMessage.set('Votre mot de passe a été modifié.');
        this.isSavingPassword.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Le mot de passe n’a pas pu être modifié.'));
        this.isSavingPassword.set(false);
      }
    });
  }

  changerDeProfil(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }

  seDeconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }

  private remplir(user: UtilisateurInfo): void {
    this.profilForm.reset({
      prenom: user.prenom,
      nom: user.nom,
      nomExploitation: user.nomExploitation ?? '',
      capaciteProduction: user.capaciteProduction ?? null,
      typeElevage: user.typeElevage ?? '',
      adresse: user.adresse ?? '',
      ville: user.ville ?? '',
      province: user.province ?? ''
    });
  }
}
