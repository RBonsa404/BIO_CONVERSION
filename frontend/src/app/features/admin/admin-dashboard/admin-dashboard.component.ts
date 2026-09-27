import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-cream flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-wine-dark flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-wine">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full border-2 border-wine flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-wine" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
              </svg>
            </div>
            <span class="text-xl font-serif text-wine font-bold">BioConversion</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4">
          <ul class="space-y-2">
            <li>
              <a href="#" class="flex items-center px-4 py-3 bg-white/10 text-white rounded-lg border-l-4 border-green">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                Tableau de bord
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                Utilisateurs
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
                Producteurs
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Commandes
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 12v3c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Rapports
              </a>
            </li>
          </ul>
        </nav>

        <!-- User info -->
        <div class="p-4 border-t border-wine">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-soft rounded-full flex items-center justify-center mr-3">
              <span class="text-green font-medium">AD</span>
            </div>
            <div class="flex-1">
              <p class="text-white font-medium">Admin</p>
              <p class="text-white/60 text-sm">Super Administrateur</p>
            </div>
            <button class="text-white/60 hover:text-white">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-serif text-wine font-bold mb-2">Tableau de bord Administrateur</h1>
          <p class="text-text">Vue d'ensemble de la plateforme</p>
        </div>

        <!-- Stats cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+15%</span>
            </div>
            <p class="text-text text-sm mb-1">Utilisateurs totaux</p>
            <p class="text-2xl font-serif text-wine font-bold">156</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+8</span>
            </div>
            <p class="text-text text-sm mb-1">Producteurs actifs</p>
            <p class="text-2xl font-serif text-wine font-bold">42</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+23</span>
            </div>
            <p class="text-text text-sm mb-1">Commandes ce mois</p>
            <p class="text-2xl font-serif text-wine font-bold">87</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </div>
              <span class="text-orange-600 text-sm font-medium">À valider</span>
            </div>
            <p class="text-text text-sm mb-1">Producteurs en attente</p>
            <p class="text-2xl font-serif text-wine font-bold">5</p>
          </div>
        </div>

        <!-- Pending producers -->
        <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-serif text-wine font-medium">Producteurs en attente de validation</h2>
            <a href="#" class="text-wine hover:text-wine-dark text-sm font-medium">Voir tout</a>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-cream rounded-lg">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center mr-4">
                  <span class="text-green font-medium">KD</span>
                </div>
                <div>
                  <p class="text-wine font-medium">Kaboré Didier</p>
                  <p class="text-text text-sm">Ferme Kadaga, Ouagadougou</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80">
                  Valider
                </button>
                <button class="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
                  Refuser
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between p-4 bg-cream rounded-lg">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center mr-4">
                  <span class="text-green font-medium">SO</span>
                </div>
                <div>
                  <p class="text-wine font-medium">Sawadogo Ousmane</p>
                  <p class="text-text text-sm">Ferme Saaba, Saaba</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80">
                  Valider
                </button>
                <button class="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Disputes section (empty state) -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-serif text-wine font-medium">Litiges signalés</h2>
            <span class="text-text text-sm">0 litige en cours</span>
          </div>

          <div class="text-center py-8">
            <div class="w-16 h-16 bg-green-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <p class="text-text mb-2">Aucun litige signalé</p>
            <p class="text-text text-sm">Tous les conflits sont résolus</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class AdminDashboardComponent {}
