import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const producteurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserRole() === 'PRODUCTEUR') {
    return true;
  }

  router.navigate(['/accueil']);
  return false;
};

export const eleveurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserRole() === 'ELEVEUR') {
    return true;
  }

  router.navigate(['/accueil']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserRole() === 'ADMINISTRATEUR' || authService.currentUserRole() === 'SUPER_ADMINISTRATEUR') {
    return true;
  }

  router.navigate(['/accueil']);
  return false;
};
