import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ProducteurProfile } from '../../../core/services/marketplace.service';
import { SidebarLayoutComponent } from '../../../layouts/sidebar-layout/sidebar-layout.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarLayoutComponent],
  template: `
    <app-sidebar-layout area="admin">
    <main class="min-h-screen bg-cream px-5 py-6 md:px-8 md:py-8">
      <div class="mx-auto max-w-7xl">
        <header class="mb-7 flex items-center gap-4 border-b border-line pb-5">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-green-soft text-2xl text-green" aria-hidden="true">♧</span>
          <div class="min-w-0 flex-1">
            <h1 class="font-serif text-3xl font-bold text-wine md:text-5xl">Administration</h1>
            <p class="mt-1 text-text">Validation des demandes de producteurs</p>
          </div>
          <span class="hidden rounded-full bg-green-soft px-4 py-2 font-semibold text-green sm:inline">Admin</span>
        </header>

        <div *ngIf="isLoading" role="status" class="bg-white rounded-2xl p-6 text-text">
          Chargement des demandes...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadProducteurs()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <div *ngIf="actionMessage" role="status" class="mb-6 rounded-xl bg-green-soft p-4 text-green">
          {{ actionMessage }}
        </div>

        <section *ngIf="!isLoading" class="mb-6 rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex items-center justify-between gap-4">
            <h2 class="font-serif text-2xl font-semibold text-wine">Comptes producteurs en attente de validation</h2>
            <span class="rounded-xl bg-green-soft px-4 py-2 text-2xl font-bold text-wine">{{ producteurs.length }}</span>
          </div>
          <p *ngIf="producteurs.length === 0 && !errorMessage" class="text-text py-6">
            Aucune demande en attente.
          </p>
          <div *ngIf="producteurs.length > 0" class="overflow-x-auto rounded-xl border border-line">
            <table class="w-full min-w-[720px] text-left">
              <thead class="bg-green-soft/60 text-sm text-text">
                <tr>
                  <th scope="col" class="px-4 py-4 font-semibold">Producteur</th>
                  <th scope="col" class="px-4 py-4 font-semibold">Exploitation et localisation</th>
                  <th scope="col" class="px-4 py-4 font-semibold">Capacité</th>
                  <th scope="col" class="px-4 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let producteur of producteurs" class="border-t border-line">
                  <td class="px-4 py-5 font-medium text-wine">{{ producteur.prenom }} {{ producteur.nom }}</td>
                  <td class="px-4 py-5 text-text">
                    <span class="block font-medium">{{ producteur.nomExploitation }}</span>
                    <span class="text-sm">{{ producteur.ville || 'Ville non renseignée' }}<span *ngIf="producteur.province"> · {{ producteur.province }}</span></span>
                  </td>
                  <td class="px-4 py-5 text-text">{{ producteur.capaciteProduction }} kg/mois</td>
                  <td class="px-4 py-5">
                    <div class="flex justify-end gap-2">
                      <button type="button" (click)="valider(producteur, false)"
                              [disabled]="processingId === producteur.id"
                              class="rounded-lg border border-wine px-4 py-2 text-sm font-semibold text-wine hover:bg-red-50 disabled:opacity-50">
                        Refuser
                      </button>
                      <button type="button" (click)="valider(producteur, true)"
                              [disabled]="processingId === producteur.id"
                              class="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        Valider
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    </app-sidebar-layout>
  `
})
export class AdminDashboardComponent implements OnInit {
  producteurs: ProducteurProfile[] = [];
  isLoading = false;
  errorMessage = '';
  actionMessage = '';
  processingId: number | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProducteurs();
  }

  loadProducteurs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.listerProducteursEnAttente().subscribe({
      next: response => {
        this.producteurs = response.data.content;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les demandes de validation. Vérifiez votre connexion et réessayez.';
        this.isLoading = false;
      }
    });
  }

  valider(producteur: ProducteurProfile, approuve: boolean): void {
    this.processingId = producteur.id;
    this.errorMessage = '';
    this.actionMessage = '';
    this.adminService.validerProducteur(producteur.id, approuve).subscribe({
      next: () => {
        this.producteurs = this.producteurs.filter(item => item.id !== producteur.id);
        this.actionMessage = approuve
          ? `${producteur.nomExploitation} a été validée.`
          : `La demande de ${producteur.nomExploitation} a été refusée.`;
        this.processingId = null;
      },
      error: () => {
        this.errorMessage = `Impossible de ${approuve ? 'valider' : 'refuser'} cette demande. Réessayez.`;
        this.processingId = null;
      }
    });
  }
}
