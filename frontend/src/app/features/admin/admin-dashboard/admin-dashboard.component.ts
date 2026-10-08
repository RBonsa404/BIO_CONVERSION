import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BackendUtilisateurInfo } from '../../../core/models/auth.model';
import { AdminService, StatistiquesPlateforme } from '../../../core/services/admin.service';
import { messageErreur } from '../../../core/utils/http-error';
import { libelleRole } from '../../../core/utils/statuts';
import { PageHeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-7xl">
        <app-page-header titre="Administration" sousTitre="Validation des inscriptions et suivi de la plateforme">
          <span class="hidden rounded-full bg-green-soft px-4 py-2 font-semibold text-green sm:inline">Admin</span>
        </app-page-header>

        @if (isLoading()) {
          <div role="status" class="rounded-2xl bg-white p-6 text-text">Chargement du tableau de bord...</div>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="charger()" class="ml-3 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-6 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (stats(); as s) {
          <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs de la plateforme">
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Producteurs / Éleveurs</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ s.producteurs }} <span class="text-xl text-text">/</span> {{ s.eleveurs }}</p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Produits en vente</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ s.produitsDisponibles }}</p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Commandes (dont livrées)</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ s.commandes }} <span class="text-xl text-text">({{ s.commandesParStatut.LIVRE || 0 }})</span></p>
            </article>
            <article class="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p class="mb-2 text-sm text-text">Paiements confirmés</p>
              <p class="font-serif text-3xl font-bold text-wine">{{ s.volumePaiementsConfirmes | number:'1.0-0' }} <small class="text-base">FCFA</small></p>
              <p class="mt-1 text-sm text-text">
                Commission {{ s.tauxCommission * 100 | number:'1.0-1' }} % : {{ s.commissionPlateforme | number:'1.0-0' }} FCFA
              </p>
            </article>
          </section>
        }

        @if (!isLoading() && !errorMessage()) {
          <section class="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h2 class="font-serif text-2xl font-semibold text-wine">Comptes en attente de validation</h2>
              <span class="rounded-xl bg-green-soft px-4 py-2 text-2xl font-bold text-wine">{{ enAttente().length }}</span>
            </div>
            @if (enAttente().length === 0) {
              <p class="py-6 text-text">Aucune demande en attente.</p>
            } @else {
              <div class="overflow-x-auto rounded-xl border border-line">
                <table class="w-full min-w-[760px] text-left">
                  <thead class="bg-green-soft/60 text-sm text-text">
                    <tr>
                      <th scope="col" class="px-4 py-4 font-semibold">Demandeur</th>
                      <th scope="col" class="px-4 py-4 font-semibold">Profil</th>
                      <th scope="col" class="px-4 py-4 font-semibold">Activité et localisation</th>
                      <th scope="col" class="px-4 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (utilisateur of enAttente(); track utilisateur.id) {
                      <tr class="border-t border-line">
                        <td class="px-4 py-5">
                          <span class="block font-medium text-wine">{{ utilisateur.prenom }} {{ utilisateur.nom }}</span>
                          <span class="text-sm text-text">{{ utilisateur.telephone }}</span>
                        </td>
                        <td class="px-4 py-5 text-text">{{ role(utilisateur) }}</td>
                        <td class="px-4 py-5 text-text">
                          @if (utilisateur.role === 'PRODUCTEUR') {
                            <span class="block font-medium">{{ utilisateur.nomExploitation }} · {{ utilisateur.capaciteProduction }} kg/mois</span>
                          }
                          <span class="text-sm">
                            {{ utilisateur.ville || utilisateur.adresse || 'Lieu non renseigné' }}@if (utilisateur.province) { · {{ utilisateur.province }} }
                          </span>
                        </td>
                        <td class="px-4 py-5">
                          <div class="flex justify-end gap-2">
                            <button type="button" (click)="valider(utilisateur, false)"
                                    [disabled]="processingId() === utilisateur.id"
                                    class="rounded-lg border border-wine px-4 py-2 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                              Refuser
                            </button>
                            <button type="button" (click)="valider(utilisateur, true)"
                                    [disabled]="processingId() === utilisateur.id"
                                    class="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                              Valider
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            <p class="mt-5">
              <a routerLink="/admin/utilisateurs" class="font-semibold text-green hover:underline">Gérer tous les utilisateurs →</a>
            </p>
          </section>
        }
      </div>
    </main>
  `
})
export class AdminDashboardComponent implements OnInit {
  readonly enAttente = signal<BackendUtilisateurInfo[]>([]);
  readonly stats = signal<StatistiquesPlateforme | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly processingId = signal<number | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.charger();
  }

  role(utilisateur: BackendUtilisateurInfo): string {
    return libelleRole(utilisateur.role, utilisateur.typeElevage);
  }

  charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      enAttente: this.adminService.listerUtilisateurs('EN_ATTENTE_VALIDATION'),
      stats: this.adminService.statistiques()
    }).subscribe({
      next: result => {
        this.enAttente.set(result.enAttente.data.content);
        this.stats.set(result.stats.data);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger le tableau de bord. Vérifiez votre connexion et réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  valider(utilisateur: BackendUtilisateurInfo, approuve: boolean): void {
    this.processingId.set(utilisateur.id);
    this.errorMessage.set('');
    this.actionMessage.set('');
    this.adminService.validerInscription(utilisateur.id, approuve).subscribe({
      next: () => {
        this.enAttente.update(list => list.filter(item => item.id !== utilisateur.id));
        this.stats.update(s => s ? { ...s, comptesEnAttente: Math.max(0, s.comptesEnAttente - 1) } : s);
        this.actionMessage.set(approuve
          ? `Le compte de ${utilisateur.prenom} ${utilisateur.nom} est validé : il peut maintenant se connecter.`
          : `La demande de ${utilisateur.prenom} ${utilisateur.nom} a été refusée.`);
        this.processingId.set(null);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, `Impossible de ${approuve ? 'valider' : 'refuser'} cette demande. Réessayez.`));
        this.processingId.set(null);
      }
    });
  }
}
