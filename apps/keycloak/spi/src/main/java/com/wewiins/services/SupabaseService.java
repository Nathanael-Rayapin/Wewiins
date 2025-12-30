package com.wewiins.services;

import org.jboss.logging.Logger;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Service responsible for synchronizing provider data with Supabase.
 * Uses native Java HTTP client to avoid external dependencies.
 */
public class SupabaseService {

    private static final Logger log = Logger.getLogger(SupabaseService.class);

    private static final String SUPABASE_URL = "https://ngwnbrplzkleqagsrjvr.supabase.co/functions/v1/provider_init_data";
    private static final String SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY";
    private static final String SUPABASE_EDGE_FUNCTION_SECRET = "SUPABASE_EDGE_FUNCTION_SECRET";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

    private final HttpClient httpClient;
    private final String anonKey;
    private final String edgeFunctionSecret;

    public SupabaseService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
        this.anonKey = System.getenv(SUPABASE_ANON_KEY);
        this.edgeFunctionSecret = System.getenv(SUPABASE_EDGE_FUNCTION_SECRET);

        if (anonKey == null || anonKey.isBlank() || edgeFunctionSecret == null || edgeFunctionSecret.isBlank()) {
            log.warn("Supabase env are not configured. Provider sync will fail.");
        }
    }

    /**
     * Creates a provider record in Supabase.
     *
     * @param email       Provider email address
     * @param companyName Provider company name
     * @param phoneNumber Provider phone number
     * @return true if creation was successful, false otherwise
     */
    public boolean createProvider(String email, String companyName, String phoneNumber) {
        if (anonKey == null || anonKey.isBlank() || edgeFunctionSecret == null || edgeFunctionSecret.isBlank()) {
            log.error("Cannot create provider: Supabase env are not configured");
            return false;
        }

        try {
            String jsonPayload = buildJsonPayload(email, companyName, phoneNumber);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(SUPABASE_URL))
                    .timeout(REQUEST_TIMEOUT)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + anonKey)
                    .header("edge-function-secret", edgeFunctionSecret)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            log.infof("Sending provider data to Supabase for email: %s", email);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.infof("Successfully created provider in Supabase. Status: %d", response.statusCode());
                return true;
            } else {
                log.errorf("Failed to create provider in Supabase. Status: %d, Response: %s",
                        response.statusCode(), response.body());
                return false;
            }

        } catch (IOException e) {
            log.errorf(e, "IO error while creating provider in Supabase for email: %s", email);
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.errorf(e, "Request interrupted while creating provider in Supabase for email: %s", email);
            return false;
        } catch (Exception e) {
            log.errorf(e, "Unexpected error while creating provider in Supabase for email: %s", email);
            return false;
        }
    }

    /**
     * Builds the JSON payload for provider creation.
     * Sets default values for verified (false) and role (PROVIDER).
     */
    private String buildJsonPayload(String email, String companyName, String phoneNumber) {
        StringBuilder json = new StringBuilder();
        json.append("{");

        appendJsonField(json, "email", email, true);
        appendJsonField(json, "company_name", companyName, true);
        appendJsonField(json, "phone_number", phoneNumber, false);

        json.append("}");
        return json.toString();
    }

    /**
     * Helper method to append a JSON field with proper escaping.
     */
    private void appendJsonField(StringBuilder json, String key, Object value, boolean addComma) {
        json.append("\"").append(key).append("\":");

        if (value == null) {
            json.append("null");
        } else if (value instanceof String) {
            json.append("\"").append(escapeJson((String) value)).append("\"");
        } else {
            json.append("\"").append(value).append("\"");
        }

        if (addComma) {
            json.append(",");
        }
    }

    /**
     * Escapes special characters in JSON strings.
     */
    private String escapeJson(String value) {
        if (value == null) {
            return null;
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}