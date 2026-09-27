import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-producteur-dashboard',
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
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
                Mes produits
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
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                Clients
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors opacity-50 cursor-not-allowed">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 12v3c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Serre (IoT)
                <span class="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded">à venir</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- User info -->
        <div class="p-4 border-t border-wine">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-soft rounded-full flex items-center justify-center mr-3">
              <span class="text-green font-medium">JD</span>
            </div>
            <div class="flex-1">
              <p class="text-white font-medium">Jean Dupont</p>
              <p class="text-white/60 text-sm">Ferme Dounord</p>
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
          <h1 class="text-3xl font-serif text-wine font-bold mb-2">Tableau de bord</h1>
          <p class="text-text">Bienvenue sur votre espace producteur</p>
        </div>

        <!-- Stats cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm1 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+12%</span>
            </div>
            <p class="text-text text-sm mb-1">Stock actuel</p>
            <p class="text-2xl font-serif text-wine font-bold">500 kg</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+5</span>
            </div>
            <p class="text-text text-sm mb-1">Commandes en attente</p>
            <p class="text-2xl font-serif text-wine font-bold">8</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+8%</span>
            </div>
            <p class="text-text text-sm mb-1">Revenus ce mois</p>
            <p class="text-2xl font-serif text-wine font-bold">125 000 FCFA</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-soft rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <span class="text-green text-sm font-medium">+3</span>
            </div>
            <p class="text-text text-sm mb-1">Clients actifs</p>
            <p class="text-2xl font-serif text-wine font-bold">24</p>
          </div>
        </div>

        <!-- Recent orders -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-serif text-wine font-medium">Commandes récentes</h2>
            <a href="#" class="text-wine hover:text-wine-dark text-sm font-medium">Voir tout</a>
          </div>

          <table class="w-full">
            <thead>
              <tr class="border-b border-line">
                <th class="text-left py-3 px-4 text-text text-sm font-medium">Commande</th>
                <th class="text-left py-3 px-4 text-text text-sm font-medium">Client</th>
                <th class="text-left py-3 px-4 text-text text-sm font-medium">Quantité</th>
                <th class="text-left py-3 px-4 text-text text-sm font-medium">Montant</th>
                <th class="text-left py-3 px-4 text-text text-sm font-medium">Statut</th>
                <th class="text-left py-3 px-4 text-text text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-line">
                <td class="py-4 px-4 text-text text-sm">#CMD-001</td>
                <td class="py-4 px-4 text-text text-sm">Kaboré A.</td>
                <td class="py-4 px-4 text-text text-sm">50 kg</td>
                <td class="py-4 px-4 text-text text-sm">125 000 FCFA</td>
                <td class="py-4 px-4">
                  <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                    En attente
                  </span>
                </td>
                <td class="py-4 px-4">
                  <button class="bg-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80">
                    Valider
                  </button>
                </td>
              </tr>
              <tr class="border-b border-line">
                <td class="py-4 px-4 text-text text-sm">#CMD-002</td>
                <td class="py-4 px-4 text-text text-sm">Sawadogo M.</td>
                <td class="py-4 px-4 text-text text-sm">100 kg</td>
                <td class="py-4 px-4 text-text text-sm">250 000 FCFA</td>
                <td class="py-4 px-4">
                  <span class="bg-green-soft text-green px-3 py-1 rounded-full text-xs font-medium">
                    Payée
                  </span>
                </td>
                <td class="py-4 px-4">
                  <button class="bg-wine text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wine-dark">
                    Préparer
                  </button>
                </td>
              </tr>
              <tr>
                <td class="py-4 px-4 text-text text-sm">#CMD-003</td>
                <td class="py-4 px-4 text-text text-sm">Zongo B.</td>
                <td class="py-4 px-4 text-text text-sm">25 kg</td>
                <td class="py-4 px-4 text-text text-sm">62 500 FCFA</td>
                <td class="py-4 px-4">
                  <span class="bg-green-soft text-green px-3 py-1 rounded-full text-xs font-medium">
                    Livrée
                  </span>
                </td>
                <td class="py-4 px-4">
                  <button class="text-text text-sm font-medium hover:text-wine">
                    Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
export class ProducteurDashboardComponent {}
