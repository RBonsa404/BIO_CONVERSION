import { Routes } from '@angular/router';
import { AccueilComponent } from './features/auth/accueil/accueil.component';

export const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' },
  { path: 'accueil', loadComponent: () => import('./features/auth/accueil/accueil.component').then(m => m.AccueilComponent) },
  { path: 'connexion', loadComponent: () => import('./features/auth/connexion/connexion.component').then(m => m.ConnexionComponent) },
  { path: 'inscription/producteur', loadComponent: () => import('./features/auth/inscription-producteur/inscription-producteur.component').then(m => m.InscriptionProducteurComponent) },
  { path: 'inscription/eleveur', loadComponent: () => import('./features/auth/inscription-eleveur/inscription-eleveur.component').then(m => m.InscriptionEleveurComponent) },
  { path: 'dashboard/producteur', loadComponent: () => import('./features/producteur-dashboard/producteur-dashboard.component').then(m => m.ProducteurDashboardComponent) },
  { path: 'marketplace', loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent) },
  { path: 'producteur/:id', loadComponent: () => import('./features/marketplace/producteur-detail/producteur-detail.component').then(m => m.ProducteurDetailComponent) },
  { path: 'commande', loadComponent: () => import('./features/commande/commande.component').then(m => m.CommandeComponent) },
  { path: 'confirmation', loadComponent: () => import('./features/commande/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
  { path: 'iot', loadComponent: () => import('./features/iot/iot.component').then(m => m.IotComponent) },
  { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: '**', redirectTo: '/accueil' }
];
