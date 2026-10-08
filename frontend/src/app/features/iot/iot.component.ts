import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AlerteIot, Capteur, IotService } from '../../core/services/iot.service';
import { messageErreur } from '../../core/utils/http-error';
import { PageHeaderComponent, UiBadgeComponent } from '../../shared/components';

/* Les capteurs publient à intervalles réguliers : la page se rafraîchit seule */
const RAFRAICHISSEMENT_MS = 30000;

@Component({
  selector: 'app-iot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, UiBadgeComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-5xl">
        <app-page-header surtitre="Espace producteur" titre="Capteurs IoT"
                         sousTitre="Température et humidité de vos installations, alertes de dépassement">
          @if (!formOuvert()) {
            <button type="button" (click)="formOuvert.set(true)"
                    class="rounded-xl bg-wine px-5 py-3 font-semibold text-white hover:bg-wine-dark">
              + Ajouter un capteur
            </button>
          }
        </app-page-header>

        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="charger()" class="ml-2 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (formOuvert()) {
          <form [formGroup]="form" (ngSubmit)="enregistrer()"
                class="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-5 font-serif text-2xl font-semibold text-wine">Nouveau capteur</h2>
            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label for="codeIdentifiant" class="mb-2 block text-sm font-semibold text-text">Code du capteur *</label>
                <input id="codeIdentifiant" type="text" formControlName="codeIdentifiant" maxlength="100"
                       placeholder="Ex : SERRE-02"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="typeCapteur" class="mb-2 block text-sm font-semibold text-text">Emplacement / type *</label>
                <input id="typeCapteur" type="text" formControlName="typeCapteur" maxlength="100"
                       placeholder="Ex : Température / humidité — bac n°2"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="seuilTemperatureMax" class="mb-2 block text-sm font-semibold text-text">Seuil d’alerte température (°C)</label>
                <input id="seuilTemperatureMax" type="number" min="-10" max="60" step="0.5" formControlName="seuilTemperatureMax"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
              <div>
                <label for="seuilHumiditeMax" class="mb-2 block text-sm font-semibold text-text">Seuil d’alerte humidité (%)</label>
                <input id="seuilHumiditeMax" type="number" min="0" max="100" step="1" formControlName="seuilHumiditeMax"
                       class="w-full rounded-xl border-2 border-line px-4 py-3 focus:border-wine focus:outline-none">
              </div>
            </div>
            @if (form.invalid && form.touched) {
              <p class="mt-4 text-sm text-red-600" role="alert">
                Renseignez le code et l’emplacement ; les seuils vont de -10 à 60 °C et de 0 à 100 %.
              </p>
            }
            <p class="mt-4 text-sm text-text">
              Le capteur transmet ensuite ses mesures avec ce code. Sans seuil, aucune alerte n’est levée.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button type="submit" [disabled]="isSaving()"
                      class="rounded-xl bg-wine px-6 py-3 font-semibold text-white hover:bg-wine-dark disabled:opacity-50">
                {{ isSaving() ? 'Enregistrement...' : 'Enregistrer le capteur' }}
              </button>
              <button type="button" (click)="formOuvert.set(false)"
                      class="rounded-xl border border-line bg-white px-6 py-3 font-semibold text-text hover:border-wine">
                Annuler
              </button>
            </div>
          </form>
        }

        @if (isLoading()) {
          <p role="status" class="py-8 text-center text-text">Chargement des capteurs...</p>
        }
        @if (!isLoading() && !errorMessage() && capteurs().length === 0) {
          <p class="rounded-xl border border-line bg-white p-8 text-center text-text">
            Aucun capteur enregistré. Ajoutez votre premier capteur pour suivre vos installations.
          </p>
        }

        <section class="grid gap-4 md:grid-cols-2" aria-label="Capteurs">
          @for (capteur of capteurs(); track capteur.idCapteur) {
            <article class="rounded-2xl border bg-white p-5 shadow-sm"
                     [ngClass]="capteur.estActif && capteur.enAlerte ? 'border-red-300' : 'border-line'">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="font-serif text-xl font-semibold text-wine">{{ capteur.codeIdentifiant }}</h2>
                  <p class="mt-1 text-sm text-text">{{ capteur.typeCapteur }}</p>
                </div>
                <app-ui-badge [variant]="!capteur.estActif ? 'gray' : (capteur.enAlerte ? 'orange' : 'success')">
                  {{ !capteur.estActif ? 'Désactivé' : (capteur.enAlerte ? 'En alerte' : 'Normal') }}
                </app-ui-badge>
              </div>

              <dl class="mt-4 grid grid-cols-2 gap-3">
                <div class="rounded-xl bg-green-soft/60 p-4">
                  <dt class="text-sm text-text">Température</dt>
                  <dd class="mt-1 font-serif text-3xl font-bold" [ngClass]="temperatureHaute(capteur) ? 'text-red-700' : 'text-green'">
                    {{ capteur.temperature !== null ? (capteur.temperature | number:'1.0-1') + ' °C' : '—' }}
                  </dd>
                  <dd class="mt-1 text-xs text-text">
                    Seuil : {{ capteur.seuilTemperatureMax !== null ? capteur.seuilTemperatureMax + ' °C' : 'non défini' }}
                  </dd>
                </div>
                <div class="rounded-xl bg-green-soft/60 p-4">
                  <dt class="text-sm text-text">Humidité</dt>
                  <dd class="mt-1 font-serif text-3xl font-bold" [ngClass]="humiditeHaute(capteur) ? 'text-red-700' : 'text-green'">
                    {{ capteur.humidite !== null ? (capteur.humidite | number:'1.0-0') + ' %' : '—' }}
                  </dd>
                  <dd class="mt-1 text-xs text-text">
                    Seuil : {{ capteur.seuilHumiditeMax !== null ? capteur.seuilHumiditeMax + ' %' : 'non défini' }}
                  </dd>
                </div>
              </dl>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm text-text">
                  {{ capteur.dateMesure ? 'Dernière mesure : ' + (capteur.dateMesure | date:'d MMM, HH:mm') : 'Aucune mesure reçue' }}
                </p>
                <button type="button" (click)="basculer(capteur)" [disabled]="processingId() === capteur.idCapteur"
                        class="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-text hover:border-wine disabled:opacity-50">
                  {{ capteur.estActif ? 'Désactiver' : 'Réactiver' }}
                </button>
              </div>
            </article>
          }
        </section>

        @if (capteurs().length > 0) {
          <section class="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <h2 class="mb-4 font-serif text-2xl font-semibold text-wine">Dernières alertes</h2>
            @if (alertes().length === 0) {
              <p class="text-text">Aucune alerte : toutes les mesures sont restées sous les seuils.</p>
            }
            <ul class="divide-y divide-line">
              @for (alerte of alertes(); track alerte.idAlerte) {
                <li class="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <p class="text-text"><strong class="text-wine">{{ alerte.codeCapteur }}</strong> — {{ alerte.message }}</p>
                  <time class="text-sm text-text" [attr.datetime]="alerte.dateAlerte">{{ alerte.dateAlerte | date:'d MMM y, HH:mm' }}</time>
                </li>
              }
            </ul>
          </section>
          <p class="mt-4 text-sm text-text">
            Mise à jour automatique toutes les 30 secondes{{ derniereMiseAJour() ? ' · dernière à ' + (derniereMiseAJour() | date:'HH:mm:ss') : '' }}.
          </p>
        }
      </div>
    </main>
  `
})
export class IotComponent implements OnInit, OnDestroy {
  readonly form: FormGroup<{
    codeIdentifiant: FormControl<string>;
    typeCapteur: FormControl<string>;
    seuilTemperatureMax: FormControl<number | null>;
    seuilHumiditeMax: FormControl<number | null>;
  }>;

  readonly capteurs = signal<Capteur[]>([]);
  readonly alertes = signal<AlerteIot[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formOuvert = signal(false);
  readonly processingId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly derniereMiseAJour = signal<Date | null>(null);

  private minuteur?: ReturnType<typeof setInterval>;

  constructor(private fb: FormBuilder, private iotService: IotService) {
    this.form = this.fb.group({
      codeIdentifiant: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
      typeCapteur: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
      seuilTemperatureMax: this.fb.control<number | null>(35, [Validators.min(-10), Validators.max(60)]),
      seuilHumiditeMax: this.fb.control<number | null>(80, [Validators.min(0), Validators.max(100)])
    });
  }

  ngOnInit(): void {
    this.charger();
    this.minuteur = setInterval(() => this.charger(true), RAFRAICHISSEMENT_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.minuteur);
  }

  temperatureHaute(capteur: Capteur): boolean {
    return capteur.temperature !== null && capteur.seuilTemperatureMax !== null
      && capteur.temperature > capteur.seuilTemperatureMax;
  }

  humiditeHaute(capteur: Capteur): boolean {
    return capteur.humidite !== null && capteur.seuilHumiditeMax !== null
      && capteur.humidite > capteur.seuilHumiditeMax;
  }

  /** @param silencieux rafraîchissement périodique : ni indicateur de chargement, ni erreur affichée */
  charger(silencieux = false): void {
    if (!silencieux) {
      this.isLoading.set(true);
      this.errorMessage.set('');
    }
    forkJoin({
      capteurs: this.iotService.listerCapteurs(),
      alertes: this.iotService.listerAlertes()
    }).subscribe({
      next: result => {
        this.capteurs.set(result.capteurs.data);
        this.alertes.set(result.alertes.data);
        this.derniereMiseAJour.set(new Date());
        this.isLoading.set(false);
      },
      error: error => {
        if (!silencieux) {
          this.errorMessage.set(messageErreur(error, 'Impossible de charger les capteurs. Réessayez.'));
        }
        this.isLoading.set(false);
      }
    });
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valeur = this.form.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.iotService.enregistrerCapteur({
      codeIdentifiant: valeur.codeIdentifiant.trim(),
      typeCapteur: valeur.typeCapteur.trim(),
      ...(valeur.seuilTemperatureMax !== null ? { seuilTemperatureMax: Number(valeur.seuilTemperatureMax) } : {}),
      ...(valeur.seuilHumiditeMax !== null ? { seuilHumiditeMax: Number(valeur.seuilHumiditeMax) } : {})
    }).subscribe({
      next: response => {
        this.capteurs.update(list => [...list, response.data]);
        this.actionMessage.set(`Le capteur ${response.data.codeIdentifiant} est enregistré.`);
        this.form.reset({ codeIdentifiant: '', typeCapteur: '', seuilTemperatureMax: 35, seuilHumiditeMax: 80 });
        this.formOuvert.set(false);
        this.isSaving.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Le capteur n’a pas pu être enregistré. Réessayez.'));
        this.isSaving.set(false);
      }
    });
  }

  basculer(capteur: Capteur): void {
    this.processingId.set(capteur.idCapteur);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.iotService.changerStatut(capteur.idCapteur, !capteur.estActif).subscribe({
      next: response => {
        this.capteurs.update(list => list.map(c => c.idCapteur === capteur.idCapteur ? response.data : c));
        this.actionMessage.set(`Le capteur ${capteur.codeIdentifiant} est ${response.data.estActif ? 'réactivé' : 'désactivé'}.`);
        this.processingId.set(null);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'La modification du capteur a échoué. Réessayez.'));
        this.processingId.set(null);
      }
    });
  }
}
