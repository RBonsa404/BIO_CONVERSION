package com.bioconversion.marketplace;

import com.bioconversion.common.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Service de gestion de l'idempotence et protection anti double-soumission côté serveur (fenêtre de 30s).
 *
 * <p>
 * Permet d'éviter la création en doublon d'une commande lorsqu'un utilisateur clique plusieurs fois
 * rapidement ou lorsque le réseau mobile rejoue la même requête HTTP POST.
 * </p>
 */
@Service
public class IdempotencyService {

    private static final long EXPIRATION_SECONDS = 30L;

    private static class Entry {
        final Commande commande;
        final Instant timestamp;
        final boolean enCours;

        Entry(Commande commande, Instant timestamp, boolean enCours) {
            this.commande = commande;
            this.timestamp = timestamp;
            this.enCours = enCours;
        }
    }

    private final ConcurrentHashMap<String, Entry> cache = new ConcurrentHashMap<>();

    /**
     * Exécute une opération avec garantie d'idempotence sur une clé donnée.
     *
     * @param idempotencyKey Clé d'idempotence unique (fournie par le client ou calculée)
     * @param action L'action de création de commande à exécuter si la clé est nouvelle
     * @return La commande créée ou celle précédemment enregistrée pour cette même clé
     */
    public Commande executerAvecIdempotence(String idempotencyKey, Supplier<Commande> action) {
        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            return action.get();
        }

        nettoyerClesExpirees();

        Entry existing = cache.get(idempotencyKey);
        if (existing != null) {
            if (existing.enCours) {
                throw new BusinessException("Une commande identique avec cette clé est actuellement en cours de traitement.");
            }
            // Si la commande existe déjà dans la fenêtre de 30 secondes, on la retourne directement
            return existing.commande;
        }

        // Marquer comme en cours
        Entry lockEntry = new Entry(null, Instant.now(), true);
        Entry previous = cache.putIfAbsent(idempotencyKey, lockEntry);
        if (previous != null) {
            if (previous.enCours) {
                throw new BusinessException("Une commande identique avec cette clé est actuellement en cours de traitement.");
            }
            return previous.commande;
        }

        try {
            Commande commandeCreee = action.get();
            cache.put(idempotencyKey, new Entry(commandeCreee, Instant.now(), false));
            return commandeCreee;
        } catch (RuntimeException ex) {
            cache.remove(idempotencyKey);
            throw ex;
        }
    }

    private void nettoyerClesExpirees() {
        Instant limite = Instant.now().minusSeconds(EXPIRATION_SECONDS);
        cache.entrySet().removeIf(e -> e.getValue().timestamp.isBefore(limite));
    }

    public void viderCache() {
        cache.clear();
    }
}
