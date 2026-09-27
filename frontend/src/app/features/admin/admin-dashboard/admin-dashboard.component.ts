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
    <main class="min-h-screen bg-cream p-8">
      <div class="max-w-5xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-serif text-wine font-bold mb-2">Validation des producteurs</h1>
          <p class="text-text">Examinez les demandes d'inscription en attente.</p>
        </header>

        <div *ngIf="isLoading" role="status" class="bg-white rounded-2xl p-6 text-text">
          Chargement des demandes...
        </div>
        <div *ngIf="errorMessage" role="alert" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {{ errorMessage }}
          <button type="button" (click)="loadProducteurs()" class="ml-3 underline font-semibold">Réessayer</button>
        </div>
        <div *ngIf="actionMessage" role="status" class="mb-6 p-4 bg-green-soft rounded-xl text-green">
          {{ actionMessage }}
        </div>

        <section *ngIf="!isLoading" class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="text-xl font-serif text-wine font-medium mb-6">
            Producteurs en attente ({{ producteurs.length }})
          </h2>
          <p *ngIf="producteurs.length === 0 && !errorMessage" class="text-text py-6">
            Aucune demande en attente.
          </p>
          <article *ngFor="let producteur of producteurs"
                   class="flex flex-wrap items-center justify-between gap-4 p-4 bg-cream rounded-lg mb-4">
            <div>
              <p class="text-wine font-semibold">{{ producteur.prenom }} {{ producteur.nom }}</p>
              <p class="text-text text-sm">
                {{ producteur.nomExploitation }}
                <span *ngIf="producteur.ville"> · {{ producteur.ville }}</span>
                <span *ngIf="producteur.province">, {{ producteur.province }}</span>
              </p>
              <p class="text-text text-sm">Capacité : {{ producteur.capaciteProduction }} kg/mois</p>
            </div>
            <div class="flex gap-2">
              <button type="button" (click)="valider(producteur, true)"
                      [disabled]="processingId === producteur.id"
                      class="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                Valider
              </button>
              <button type="button" (click)="valider(producteur, false)"
                      [disabled]="processingId === producteur.id"
                      class="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50">
                Refuser
              </button>
            </div>
          </article>
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
