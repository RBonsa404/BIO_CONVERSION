package com.bioconversion.paiement;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class WebhookSignatureVerifier {

    private static final String HMAC_SHA256 = "HmacSHA256";

    public boolean verifySignature(String payload, String signature, String secret) {
        if (payload == null || signature == null || secret == null) {
            return false;
        }

        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);

            byte[] expectedSignature = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedBase64 = Base64.getEncoder().encodeToString(expectedSignature);

            return signature.equals(expectedBase64);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }
}
