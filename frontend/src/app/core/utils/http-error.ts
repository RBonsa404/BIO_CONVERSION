import { HttpErrorResponse } from '@angular/common/http';

/**
 * Message à afficher pour une erreur HTTP : celui du backend quand il en fournit un
 * (erreur métier ou premier champ invalide), sinon le message de repli.
 */
export function messageErreur(error: unknown, repli: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return repli;
  }
  if (error.status === 0) {
    return 'Le serveur est injoignable. Vérifiez votre connexion et réessayez.';
  }
  const body = error.error as { message?: unknown; fieldErrors?: Record<string, string> } | null;
  const champs = body?.fieldErrors ? Object.values(body.fieldErrors) : [];
  if (champs.length > 0) {
    return champs[0];
  }
  return typeof body?.message === 'string' && body.message ? body.message : repli;
}
