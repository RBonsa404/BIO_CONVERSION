import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard, eleveurGuard, producteurGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' },

  /* Pages publiques, sans barre latérale */
  { path: 'accueil', loadComponent: () => import('./features/auth/accueil/accueil.component').then(m => m.AccueilComponent) },
  { path: 'connexion', canActivate: [guestGuard], loadComponent: () => import('./features/auth/connexion/connexion.component').then(m => m.ConnexionComponent) },
  { path: 'inscription/producteur', canActivate: [guestGuard], loadComponent: () => import('./features/auth/inscription-producteur/inscription-producteur.component').then(m => m.InscriptionProducteurComponent) },
  { path: 'inscription/eleveur', canActivate: [guestGuard], loadComponent: () => import('./features/auth/inscription-eleveur/inscription-eleveur.component').then(m => m.InscriptionEleveurComponent) },

  /* Espace connecté : la barre latérale est affichée une seule fois pour toutes ces pages.
     Chaque onglet a sa route, sa page et un garde aligné sur les droits du backend. */
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/espace-layout/espace-layout.component').then(m => m.EspaceLayoutComponent),
    children: [
      /* Producteur */
      { path: 'dashboard/producteur', canActivate: [producteurGuard], loadComponent: () => import('./features/producteur-dashboard/producteur-dashboard.component').then(m => m.ProducteurDashboardComponent) },
      { path: 'dashboard/commandes', canActivate: [producteurGuard], loadComponent: () => import('./features/producteur-commandes/producteur-commandes.component').then(m => m.ProducteurCommandesComponent) },
      { path: 'dashboard/produits', canActivate: [producteurGuard], loadComponent: () => import('./features/producteur-produits/producteur-produits.component').then(m => m.ProducteurProduitsComponent) },
      { path: 'dashboard/statistiques', canActivate: [producteurGuard], loadComponent: () => import('./features/producteur-statistiques/producteur-statistiques.component').then(m => m.ProducteurStatistiquesComponent) },
      { path: 'iot', canActivate: [producteurGuard], loadComponent: () => import('./features/iot/iot.component').then(m => m.IotComponent) },

      /* Marketplace : consultable par tous les rôles connectés */
      { path: 'marketplace', loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent) },
      { path: 'producteur/:id', loadComponent: () => import('./features/marketplace/producteur-detail/producteur-detail.component').then(m => m.ProducteurDetailComponent) },

      /* Éleveur */
      { path: 'commande', canActivate: [eleveurGuard], loadComponent: () => import('./features/commande/commande.component').then(m => m.CommandeComponent) },
      { path: 'confirmation', canActivate: [eleveurGuard], loadComponent: () => import('./features/commande/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
      { path: 'mes-commandes', canActivate: [eleveurGuard], loadComponent: () => import('./features/marketplace/mes-commandes/mes-commandes.component').then(m => m.MesCommandesComponent) },
      { path: 'historique', canActivate: [eleveurGuard], loadComponent: () => import('./features/marketplace/historique/historique.component').then(m => m.HistoriqueComponent) },

      /* Administration */
      { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'admin/utilisateurs', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-utilisateurs/admin-utilisateurs.component').then(m => m.AdminUtilisateursComponent) },

      /* Tous les rôles */
      { path: 'profil', loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent) }
    ]
  },

  { path: '**', redirectTo: '/accueil' }
];
