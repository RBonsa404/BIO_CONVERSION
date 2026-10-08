import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Réserve une route aux utilisateurs connectés ; sinon renvoie vers la connexion. */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** Pages de connexion / inscription : un utilisateur déjà connecté rejoint son espace. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? router.parseUrl(authService.homeRoute())
    : true;
};
