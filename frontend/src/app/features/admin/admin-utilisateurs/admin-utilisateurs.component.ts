import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ApiResponse, BackendUtilisateurInfo, StatutUtilisateur } from '../../../core/models/auth.model';
import { AdminService } from '../../../core/services/admin.service';
import { messageErreur } from '../../../core/utils/http-error';
import { libelleRole, libelleUtilisateur, varianteUtilisateur } from '../../../core/utils/statuts';
import { PageHeaderComponent, UiBadgeComponent } from '../../../shared/components';

type Filtre = StatutUtilisateur | 'TOUS';
type Action = 'valider' | 'refuser' | 'suspendre' | 'reactiver';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, UiBadgeComponent],
  template: `
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-7xl">
        <app-page-header surtitre="Administration" titre="Utilisateurs"
                         sousTitre="Tous les comptes de la plateforme : validation, suspension, réactivation"></app-page-header>

        <div class="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par statut">
          @for (option of filtres; track option.valeur) {
            <button type="button" role="tab" [attr.aria-selected]="filtre() === option.valeur"
                    (click)="filtre.set(option.valeur)"
                    class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                    [ngClass]="filtre() === option.valeur ? 'border-wine bg-wine text-white' : 'border-line bg-white text-text hover:border-wine'">
              {{ option.label }} ({{ compter(option.valeur) }})
            </button>
          }
        </div>

        @if (isLoading()) {
          <div role="status" class="rounded-2xl bg-white p-6 text-text">Chargement des utilisateurs...</div>
        }
        @if (errorMessage()) {
          <div role="alert" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {{ errorMessage() }}
            <button type="button" (click)="charger()" class="ml-3 font-semibold underline">Réessayer</button>
          </div>
        }
        @if (actionMessage()) {
          <div role="status" class="mb-5 rounded-xl bg-green-soft p-4 text-green">{{ actionMessage() }}</div>
        }

        @if (!isLoading() && !errorMessage()) {
          @if (utilisateursFiltres().length === 0) {
            <p class="rounded-xl border border-line bg-white p-8 text-center text-text">Aucun compte dans cette catégorie.</p>
          } @else {
            <div class="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
              <table class="w-full min-w-[820px] text-left">
                <thead class="bg-green-soft/60 text-sm text-text">
                  <tr>
                    <th scope="col" class="px-4 py-4 font-semibold">Utilisateur</th>
                    <th scope="col" class="px-4 py-4 font-semibold">Profil</th>
                    <th scope="col" class="px-4 py-4 font-semibold">Inscription</th>
                    <th scope="col" class="px-4 py-4 font-semibold">Statut</th>
                    <th scope="col" class="px-4 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (utilisateur of utilisateursFiltres(); track utilisateur.id) {
                    <tr class="border-t border-line">
                      <td class="px-4 py-4">
                        <span class="block font-medium text-wine">{{ utilisateur.prenom }} {{ utilisateur.nom }}</span>
                        <span class="text-sm text-text">{{ utilisateur.telephone }}</span>
                      </td>
                      <td class="px-4 py-4 text-text">
                        <span class="block">{{ role(utilisateur) }}</span>
                        @if (utilisateur.nomExploitation) {
                          <span class="text-sm">{{ utilisateur.nomExploitation }}</span>
                        }
                      </td>
                      <td class="px-4 py-4 text-sm text-text">{{ utilisateur.dateCreation | date:'d MMM y' }}</td>
                      <td class="px-4 py-4">
                        <app-ui-badge [variant]="variante(utilisateur.statut)">{{ libelle(utilisateur.statut) }}</app-ui-badge>
                      </td>
                      <td class="px-4 py-4">
                        <div class="flex justify-end gap-2">
                          @if (estAdmin(utilisateur)) {
                            <span class="text-sm text-text">—</span>
                          } @else {
                            @switch (utilisateur.statut) {
                              @case ('EN_ATTENTE_VALIDATION') {
                                <button type="button" (click)="agir(utilisateur, 'refuser')" [disabled]="processingId() === utilisateur.id"
                                        class="rounded-lg border border-wine px-3 py-2 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">Refuser</button>
                                <button type="button" (click)="agir(utilisateur, 'valider')" [disabled]="processingId() === utilisateur.id"
                                        class="rounded-lg bg-green px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Valider</button>
                              }
                              @case ('ACTIF') {
                                <button type="button" (click)="agir(utilisateur, 'suspendre')" [disabled]="processingId() === utilisateur.id"
                                        class="rounded-lg border border-wine px-3 py-2 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">Suspendre</button>
                              }
                              @default {
                                <button type="button" (click)="agir(utilisateur, 'reactiver')" [disabled]="processingId() === utilisateur.id"
                                        class="rounded-lg bg-green px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                  {{ utilisateur.statut === 'REFUSE' ? 'Accepter' : 'Réactiver' }}
                                </button>
                              }
                            }
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </main>
  `
})
export class AdminUtilisateursComponent implements OnInit {
  readonly filtres: { valeur: Filtre; label: string }[] = [
    { valeur: 'TOUS', label: 'Tous' },
    { valeur: 'EN_ATTENTE_VALIDATION', label: 'En attente' },
    { valeur: 'ACTIF', label: 'Actifs' },
    { valeur: 'SUSPENDU', label: 'Suspendus' },
    { valeur: 'REFUSE', label: 'Refusés' }
  ];

  readonly utilisateurs = signal<BackendUtilisateurInfo[]>([]);
  readonly filtre = signal<Filtre>('TOUS');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly processingId = signal<number | null>(null);

  readonly utilisateursFiltres = computed(() => this.filtrer(this.filtre()));

  readonly libelle = libelleUtilisateur;
  readonly variante = varianteUtilisateur;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.charger();
  }

  role(utilisateur: BackendUtilisateurInfo): string {
    return libelleRole(utilisateur.role, utilisateur.typeElevage);
  }

  estAdmin(utilisateur: BackendUtilisateurInfo): boolean {
    return utilisateur.role === 'ADMINISTRATEUR' || utilisateur.role === 'SUPER_ADMINISTRATEUR';
  }

  compter(filtre: Filtre): number {
    return this.filtrer(filtre).length;
  }

  charger(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.adminService.listerUtilisateurs(undefined, 0, 200).subscribe({
      next: response => {
        this.utilisateurs.set(response.data.content);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'Impossible de charger les utilisateurs. Réessayez.'));
        this.isLoading.set(false);
      }
    });
  }

  agir(utilisateur: BackendUtilisateurInfo, action: Action): void {
    const requetes: Record<Action, () => Observable<ApiResponse<BackendUtilisateurInfo>>> = {
      valider: () => this.adminService.validerInscription(utilisateur.id, true),
      refuser: () => this.adminService.validerInscription(utilisateur.id, false),
      suspendre: () => this.adminService.suspendre(utilisateur.id),
      reactiver: () => this.adminService.reactiver(utilisateur.id)
    };
    const messages: Record<Action, string> = {
      valider: 'est validé',
      refuser: 'est refusé',
      suspendre: 'est suspendu : la connexion lui est fermée',
      reactiver: 'est de nouveau actif'
    };
    if (action === 'suspendre'
        && !window.confirm(`Suspendre le compte de ${utilisateur.prenom} ${utilisateur.nom} ?`)) {
      return;
    }

    this.processingId.set(utilisateur.id);
    this.errorMessage.set('');
    this.actionMessage.set('');
    requetes[action]().subscribe({
      next: response => {
        this.utilisateurs.update(list => list.map(item => item.id === utilisateur.id ? response.data : item));
        this.actionMessage.set(`Le compte de ${utilisateur.prenom} ${utilisateur.nom} ${messages[action]}.`);
        this.processingId.set(null);
      },
      error: error => {
        this.errorMessage.set(messageErreur(error, 'L’action a échoué. Réessayez.'));
        this.processingId.set(null);
      }
    });
  }

  private filtrer(filtre: Filtre): BackendUtilisateurInfo[] {
    return this.utilisateurs().filter(utilisateur => filtre === 'TOUS' || utilisateur.statut === filtre);
  }
}
