package com.wewiins.factories;

import com.wewiins.authenticators.CustomVerifyEmail;
import org.keycloak.Config;
import org.keycloak.authentication.RequiredActionFactory;
import org.keycloak.authentication.RequiredActionProvider;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.provider.ProviderConfigurationBuilder;

import java.util.List;

public class CustomVerifyEmailFactory implements RequiredActionFactory {

    @Override
    public String getDisplayText() {
        return "Custom Verify Email";
    }

    @Override
    public RequiredActionProvider create(KeycloakSession keycloakSession) {
        return new CustomVerifyEmail();
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
        return CustomVerifyEmail.PROVIDER_ID;
    }

    @Override
    public List<ProviderConfigProperty> getConfigMetadata() {
        return ProviderConfigurationBuilder.create()
                .property()
                .name("otp_digits")
                .label("OTP digits")
                .helpText("Number of digits for email OTP")
                .type(ProviderConfigProperty.STRING_TYPE)
                .defaultValue("6")
                .add()

                .property()
                .name("otp_ttl")
                .label("OTP TTL (seconds)")
                .helpText("OTP validity duration")
                .type(ProviderConfigProperty.STRING_TYPE)
                .defaultValue("600")
                .add()
                .build();
    }
}