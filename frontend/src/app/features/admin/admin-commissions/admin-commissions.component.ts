import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminService, CommissionACollecter, ResumeFonds } from '../../../core/services/admin.service';
import { messageErreur } from '../../../core/utils/http-error';
import { PageHeaderComponent } from '../../../shared/components';

/** Commissions d'un producteur, pour l'affichage groupé. */
interface GroupeProducteur {
  producteurId: number;
  nomExploitation: string;
  telephoneProducteur: string | null;
  total: number;
  commissions: CommissionACollecter[];
}

/** Saisie en cours pour la ligne « Encaissée ». */
interface Saisie {
  id: number;
  collecteur: string;
  montant: number;
  dateEncaissement: string;
}

@Component({
  selector: 'app-admin-commissions',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-7xl">
        <app-page-header surtitre="Administration" titre="Commissions"
                         sousTitre="Fonds de la plateforme, argent en séquestre et commissions espèces à collecter"></app-page-header>

        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="charger()" class="ml-3 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (resume(); as r) {
          <div class="mb-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p class="text-sm text-text">Fonds de la plateforme</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ r.soldeFonds | number:'1.0-0' }} FCFA</p>
            </div>
            <div class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p class="text-sm text-text">En séquestre (argent des éleveurs)</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ r.soldeSequestre | number:'1.0-0' }} FCFA</p>
            </div>
            <div class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p class="text-sm text-text">À collecter ({{ r.nombreACollecter }})</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ r.totalACollecter | number:'1.0-0' }} FCFA</p>
            </div>
          </div>
        }

        <h2 class="mb-4 font-serif text-2xl font-semibold text-wine">Commissions espèces à collecter</h2>

        @if (isLoading()) {
          <div role="status" class="rounded-2xl bg-white p-6 text-text">Chargement...</div>
        } @else if (groupes().length === 0) {
          <p class="rounded-2xl bg-white p-6 text-text">Aucune commission à collecter.</p>
        }

        <div class="space-y-5">
          @for (groupe of groupes(); track groupe.producteurId) {
            <section class="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div class="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <div>
                  <h3 class="font-serif text-xl font-semibold text-wine">{{ groupe.nomExploitation }}</h3>
                  @if (groupe.telephoneProducteur) {
                    <a [href]="'tel:' + groupe.telephoneProducteur" class="text-sm font-medium text-green hover:underline">
                      {{ groupe.telephoneProducteur }}
                    </a>
                  }
                </div>
                <p class="font-semibold text-wine">{{ groupe.total | number:'1.0-0' }} FCFA</p>
              </div>

              <ul class="divide-y divide-line">
                @for (c of groupe.commissions; track c.id) {
                  <li class="py-3">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <p class="text-sm text-text">
                        Commande {{ c.numeroCommande }} · vente du {{ c.dateVente | date:'d MMM y' }}
                        · <strong class="text-wine">{{ c.montant | number:'1.0-0' }} FCFA</strong>
                      </p>
                      @if (saisie()?.id !== c.id) {
                        <button type="button" (click)="ouvrir(c)"
                                class="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white">Encaissée</button>
                      }
                    </div>

                    @if (saisie(); as s) {
                      @if (s.id === c.id) {
                        <form (ngSubmit)="valider(c)" class="mt-3 grid gap-3 rounded-xl bg-cream p-4 sm:grid-cols-4">
                          <label class="text-sm text-text">Collecteur
                            <input name="collecteur" [(ngModel)]="s.collecteur" required maxlength="150"
                                   class="mt-1 w-full rounded-lg border border-line px-3 py-2">
                          </label>
                          <label class="text-sm text-text">Montant (FCFA)
                            <input name="montant" type="number" [(ngModel)]="s.montant" required min="1"
                                   class="mt-1 w-full rounded-lg border border-line px-3 py-2">
                          </label>
                          <label class="text-sm text-text">Date
                            <input name="dateEncaissement" type="date" [(ngModel)]="s.dateEncaissement" [max]="aujourdhui"
                                   class="mt-1 w-full rounded-lg border border-line px-3 py-2">
                          </label>
                          <div class="flex items-end gap-2">
                            <button type="submit" [disabled]="processing() || !s.collecteur.trim()"
                                    class="rounded-lg bg-wine px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Valider</button>
                            <button type="button" (click)="saisie.set(null)"
                                    class="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-text">Annuler</button>
                          </div>
                        </form>
                      }
                    }
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      </div>
    </main>
  `
})
export class AdminCommissionsComponent implements OnInit {
  readonly resume = signal<ResumeFonds | null>(null);
  readonly commissions = signal<CommissionACollecter[]>([]);
  readonly saisie = signal<Saisie | null>(null);
  readonly isLoading = signal(false);
  readonly processing = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly aujourdhui = new Date().toISOString().slice(0, 10);

  /** Le serveur renvoie la liste triée par producteur : on regroupe dans cet ordre. */
  readonly groupes = computed<GroupeProducteur[]>(() => {
    const parProducteur = new Map<number, GroupeProducteur>();
    for (const c of this.commissions()) {
      let groupe = parProducteur.get(c.producteurId);
      if (!groupe) {
        groupe = {
          producteurId: c.producteurId,
          nomExploitation: c.nomExploitation,
          telephoneProducteur: c.telephoneProducteur,
          total: 0,
          commissions: []
        };
        parProducteur.set(c.producteurId, groupe);
      }
      groupe.commissions.push(c);
      groupe.total += c.montant;
    }
    return [...parProducteur.values()];
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      resume: this.adminService.resumeCommissions(),
      liste: this.adminService.commissionsACollecter()
    }).subscribe({
      next: ({ resume, liste }) => {
        this.resume.set(resume.data ?? null);
        this.commissions.set(liste.data ?? []);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Les commissions n’ont pas pu être chargées.'));
        this.isLoading.set(false);
      }
    });
  }

  ouvrir(c: CommissionACollecter): void {
    this.actionMessage.set('');
    this.saisie.set({ id: c.id, collecteur: '', montant: c.montant, dateEncaissement: this.aujourdhui });
  }

  valider(c: CommissionACollecter): void {
    const s = this.saisie();
    if (!s) {
      return;
    }
    this.processing.set(true);
    this.errorMessage.set('');
    this.adminService.encaisserCommission(c.id, {
      collecteur: s.collecteur.trim(),
      montant: s.montant,
      dateEncaissement: s.dateEncaissement || undefined
    }).subscribe({
      next: () => {
        this.actionMessage.set(`Commission de ${c.montant} FCFA (${c.nomExploitation}) encaissée et ajoutée au fonds.`);
        this.saisie.set(null);
        this.processing.set(false);
        this.charger();
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'L’encaissement n’a pas pu être enregistré.'));
        this.processing.set(false);
      }
    });
  }
}
