import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Numéro burkinabè : 8 chiffres, avec ou sans indicatif (+226 / 00226), espaces tolérés.
 * Même règle que PhoneUtils côté backend, pour signaler l'erreur avant l'envoi.
 */
export function telephoneBurkinabe(control: AbstractControl): ValidationErrors | null {
  const valeur = String(control.value ?? '').trim();
  if (!valeur) {
    return null;
  }
  let chiffres = valeur.replace(/\D/g, '');
  if (chiffres.startsWith('00226')) {
    chiffres = chiffres.slice(5);
  } else if (chiffres.startsWith('226') && chiffres.length > 8) {
    chiffres = chiffres.slice(3);
  }
  return chiffres.length === 8 ? null : { telephone: true };
}

/** Vérifie que deux champs d'un même formulaire portent la même valeur. */
export function champsIdentiques(champ: string, confirmation: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(champ)?.value;
    const b = group.get(confirmation)?.value;
    return a && b && a !== b ? { confirmation: true } : null;
  };
}

export interface Position {
  latitude: number;
  longitude: number;
}

/** Position GPS du navigateur ; rejette avec un message affichable. */
export function obtenirPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject('La géolocalisation n’est pas disponible sur cet appareil.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6))
      }),
      () => reject('Position indisponible. Autorisez la localisation ou réessayez.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
