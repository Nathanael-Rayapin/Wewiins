package com.wewiins.services;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.jboss.logging.Logger;
import org.keycloak.authentication.requiredactions.VerifyEmail;

public class EmailService {

    private final HttpClient client;

    private static final Logger logger = Logger.getLogger(VerifyEmail.class);

    public EmailService() {
        this.client = HttpClient.newHttpClient();
    }

    public void sendOTPEmail(String email, String otpCode, String brevoApiKey, Long templateId) throws IOException, InterruptedException  {
        String url = "https://api.brevo.com/v3/smtp/email";
        logger.infof("Sending OTP email to %s with apiKey=%s and code=%s", email, brevoApiKey, otpCode);


        String json = String.format(
                "{\"to\":[{\"email\":\"%s\"}],\"templateId\":%d,\"params\":{\"otpCode\":\"%s\"}}",
                email, templateId, otpCode
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("api-key", brevoApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 300) {
            throw new IOException("Erreur lors de l'envoi de l'email : " + response.statusCode() + " - " + response.body());
        }
    }
}