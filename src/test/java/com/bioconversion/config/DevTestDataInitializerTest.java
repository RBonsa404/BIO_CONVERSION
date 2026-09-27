package com.bioconversion.config;

import com.bioconversion.marketplace.Produit;
import com.bioconversion.marketplace.ProduitRepository;
import com.bioconversion.utilisateur.Administrateur;
import com.bioconversion.utilisateur.Eleveur;
import com.bioconversion.utilisateur.EleveurRepository;
import com.bioconversion.utilisateur.Producteur;
import com.bioconversion.utilisateur.ProducteurRepository;
import com.bioconversion.utilisateur.StatutUtilisateur;
import com.bioconversion.utilisateur.Utilisateur;
import com.bioconversion.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DevTestDataInitializerTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private ProducteurRepository producteurRepository;

    @Mock
    private EleveurRepository eleveurRepository;

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DevTestDataInitializer initializer;

    private final Map<String, Utilisateur> accounts = new HashMap<>();
    private final Map<Long, List<Produit>> products = new HashMap<>();
    private final AtomicLong userIds = new AtomicLong();

    @BeforeEach
    void setUpRepositories() {
        when(utilisateurRepository.findByTelephone(anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(accounts.get(invocation.getArgument(0))));
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(invocation -> {
            Utilisateur user = invocation.getArgument(0);
            user.setIdUtilisateur(userIds.incrementAndGet());
            accounts.put(user.getTelephone(), user);
            return user;
        });
        when(producteurRepository.save(any(Producteur.class))).thenAnswer(invocation -> {
            Producteur producer = invocation.getArgument(0);
            producer.setIdUtilisateur(userIds.incrementAndGet());
            accounts.put(producer.getTelephone(), producer);
            return producer;
        });
        when(eleveurRepository.save(any(Eleveur.class))).thenAnswer(invocation -> {
            Eleveur farmer = invocation.getArgument(0);
            farmer.setIdUtilisateur(userIds.incrementAndGet());
            accounts.put(farmer.getTelephone(), farmer);
            return farmer;
        });
        when(produitRepository.findByProducteurIdUtilisateur(any()))
                .thenAnswer(invocation -> products.computeIfAbsent(invocation.getArgument(0), ignored -> new ArrayList<>()));
        when(produitRepository.save(any(Produit.class))).thenAnswer(invocation -> {
            Produit product = invocation.getArgument(0);
            products.computeIfAbsent(product.getProducteur().getIdUtilisateur(), ignored -> new ArrayList<>()).add(product);
            return product;
        });
        when(passwordEncoder.encode("TestPass123!")).thenReturn("encoded-test-password");
    }

    @Test
    void createsAllDevelopmentAccountsAndProductsOnlyOnce() {
        initializer.run();
        initializer.run();

        Producteur activeProducer = assertInstanceOf(Producteur.class, accounts.get("+22670000001"));
        Producteur pendingProducer = assertInstanceOf(Producteur.class, accounts.get("+22670000002"));
        Eleveur pisciculteur = assertInstanceOf(Eleveur.class, accounts.get("+22670000003"));
        Eleveur aviculteur = assertInstanceOf(Eleveur.class, accounts.get("+22670000004"));
        Administrateur administrator = assertInstanceOf(Administrateur.class, accounts.get("+22670000005"));

        assertEquals(StatutUtilisateur.ACTIF, activeProducer.getStatut());
        assertEquals(StatutUtilisateur.EN_ATTENTE_VALIDATION, pendingProducer.getStatut());
        assertEquals("PISCICULTURE", pisciculteur.getTypeElevage());
        assertEquals("AVICULTURE", aviculteur.getTypeElevage());
        assertEquals(StatutUtilisateur.ACTIF, administrator.getStatut());
        assertEquals("encoded-test-password", activeProducer.getMotDePasse());
        assertEquals(2, products.get(activeProducer.getIdUtilisateur()).size());
        assertEquals(5, accounts.size());
        verify(passwordEncoder, times(5)).encode("TestPass123!");
    }
}
