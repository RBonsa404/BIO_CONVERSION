import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { telephoneBurkinabe } from './validators';

describe('telephoneBurkinabe', () => {
  const valider = (valeur: string) => telephoneBurkinabe(new FormControl(valeur));

  it('accepte les écritures usuelles d’un numéro à 8 chiffres', () => {
    for (const numero of ['70123456', '70 12 34 56', '+226 70 12 34 56', '0022670123456', '+22670123456']) {
      expect(valider(numero), numero).toBeNull();
    }
  });

  it('accepte un numéro local commençant par 226', () => {
    expect(valider('22612345')).toBeNull();
  });

  it('refuse un numéro trop court, trop long ou sans chiffres', () => {
    for (const numero of ['7012345', '701234567', '+226 70 12 34', 'abc']) {
      expect(valider(numero), numero).toEqual({ telephone: true });
    }
  });

  it('laisse le champ vide au validateur « requis »', () => {
    expect(valider('')).toBeNull();
  });
});
