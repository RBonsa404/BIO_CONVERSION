import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleUtilisateur } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

/**
 * Réserve une route à certains rôles. Un utilisateur connecté avec un autre rôle
 * est renvoyé vers son propre espace plutôt que vers une page qu'il ne peut pas utiliser.
 */
export function roleGuard(...roles: RoleUtilisateur[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.currentUserRole();

    if (!role) {
      return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
    }
    return roles.includes(role) ? true : router.parseUrl(authService.homeRoute());
  };
}

export const producteurGuard = roleGuard('PRODUCTEUR');
export const eleveurGuard = roleGuard('ELEVEUR');
export const adminGuard = roleGuard('ADMINISTRATEUR', 'SUPER_ADMINISTRATEUR');
