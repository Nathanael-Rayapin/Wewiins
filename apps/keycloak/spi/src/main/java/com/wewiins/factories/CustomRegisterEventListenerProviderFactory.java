package com.wewiins.factories;

import com.wewiins.authenticators.CustomRegisterEventListenerProvider;
import org.keycloak.Config;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

public class CustomRegisterEventListenerProviderFactory implements EventListenerProviderFactory {

    @Override
    public EventListenerProvider create(KeycloakSession keycloakSession) {
        return new CustomRegisterEventListenerProvider(keycloakSession);
    }

    @Override
    public void init(Config.Scope scope) {
        // No implementation needed
    }

    @Override
    public void postInit(KeycloakSessionFactory keycloakSessionFactory) {
        // No implementation needed
    }

    @Override
    public void close() {
        // No implementation needed
    }

    @Override
    public String getId() {
        return CustomRegisterEventListenerProvider.PROVIDER_ID;
    }
}