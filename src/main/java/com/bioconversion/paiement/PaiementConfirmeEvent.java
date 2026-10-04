package com.bioconversion.paiement;

import org.springframework.context.ApplicationEvent;

/**
 * Event published when a payment is confirmed successfully.
 * Triggers PDF generation asynchronously after the transaction is committed.
 */
public class PaiementConfirmeEvent extends ApplicationEvent {

    private final Paiement paiement;

    public PaiementConfirmeEvent(Object source, Paiement paiement) {
        super(source);
        this.paiement = paiement;
    }

    public Paiement getPaiement() {
        return paiement;
    }
}
