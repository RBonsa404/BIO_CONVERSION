import { StatutUtilisateur } from '../models/auth.model';
import { StatutCommande, StatutPaiement, TypeProduit } from '../services/marketplace.service';

export type BadgeVariant = 'warning' | 'success' | 'gray' | 'orange';

const COMMANDE: Record<StatutCommande, { label: string; variant: BadgeVariant }> = {
  EN_ATTENTE: { label: 'En attente du producteur', variant: 'warning' },
  CONFIRME: { label: 'Confirmée — à payer', variant: 'orange' },
  PAYE: { label: 'Payée', variant: 'success' },
  EXPEDIE: { label: 'Expédiée', variant: 'success' },
  LIVRE: { label: 'Livrée', variant: 'success' },
  REFUSE: { label: 'Refusée', variant: 'gray' },
  ANNULE: { label: 'Annulée', variant: 'gray' },
  NON_CONFIRMEE: { label: 'Expirée (non confirmée)', variant: 'gray' }
};

const PAIEMENT: Record<StatutPaiement, string> = {
  EN_ATTENTE: 'En attente de l’opérateur',
  CONFIRME: 'Confirmé',
  ECHOUE: 'Échoué',
  REMBOURSE: 'À rembourser'
};

const UTILISATEUR: Record<StatutUtilisateur, { label: string; variant: BadgeVariant }> = {
  ACTIF: { label: 'Actif', variant: 'success' },
  EN_ATTENTE_VALIDATION: { label: 'En attente', variant: 'warning' },
  SUSPENDU: { label: 'Suspendu', variant: 'orange' },
  REFUSE: { label: 'Refusé', variant: 'gray' }
};

/** Commandes encore en cours ; les autres relèvent de l'historique. */
export const STATUTS_COMMANDE_ACTIFS: readonly StatutCommande[] = ['EN_ATTENTE', 'CONFIRME', 'PAYE', 'EXPEDIE'];

export function libelleCommande(statut: StatutCommande): string {
  return COMMANDE[statut]?.label ?? statut;
}

export function varianteCommande(statut: StatutCommande): BadgeVariant {
  return COMMANDE[statut]?.variant ?? 'gray';
}

export function libellePaiement(statut: StatutPaiement | null): string {
  return statut ? PAIEMENT[statut] ?? statut : 'Non initié';
}

export function libelleUtilisateur(statut: StatutUtilisateur): string {
  return UTILISATEUR[statut]?.label ?? statut;
}

export function varianteUtilisateur(statut: StatutUtilisateur): BadgeVariant {
  return UTILISATEUR[statut]?.variant ?? 'gray';
}

export function libelleRole(role: string | null | undefined, typeElevage?: string): string {
  switch (role) {
    case 'PRODUCTEUR': return 'Producteur';
    case 'ELEVEUR': return libelleElevage(typeElevage) ?? 'Éleveur';
    case 'ADMINISTRATEUR': return 'Administrateur';
    case 'SUPER_ADMINISTRATEUR': return 'Super administrateur';
    default: return 'Visiteur';
  }
}

export function libelleElevage(typeElevage?: string | null): string | null {
  switch (typeElevage) {
    case 'PISCICULTURE': return 'Pisciculteur';
    case 'AVICULTURE': return 'Aviculteur';
    default: return typeElevage || null;
  }
}

export function libelleTypeProduit(type: TypeProduit): string {
  return type === 'RESIDU_PRODUCTION' ? 'Résidu de production (frass)' : 'Larves';
}
