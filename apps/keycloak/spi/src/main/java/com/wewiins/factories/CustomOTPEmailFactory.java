package com.wewiins.factories;

import com.wewiins.authenticators.CustomOTPEmail;
import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.provider.ProviderConfigurationBuilder;

import java.util.List;

public class CustomOTPEmailFactory implements AuthenticatorFactory {

    @Override
    public String getDisplayType() {
        return "Custom Email OTP Authentication";
    }

    @Override
    public String getReferenceCategory() {
        return "otp";
    }

    @Override
    public boolean isConfigurable() {
        return true;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return new AuthenticationExecutionModel.Requirement[]{
                AuthenticationExecutionModel.Requirement.REQUIRED,
                AuthenticationExecutionModel.Requirement.ALTERNATIVE,
                AuthenticationExecutionModel.Requirement.DISABLED
        };
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public String getHelpText() {
        return "Sends a one-time password via email for passwordless authentication";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return ProviderConfigurationBuilder.create()
                .property()
                .name(CustomOTPEmail.CONFIG_OTP_DIGITS)
                .label("OTP Digits")
                .helpText("Number of digits for the OTP code")
                .type(ProviderConfigProperty.STRING_TYPE)
                .defaultValue(CustomOTPEmail.DEFAULT_OTP_DIGITS)
                .add()

                .property()
                .name(CustomOTPEmail.CONFIG_OTP_TTL)
                .label("OTP TTL (seconds)")
                .helpText("Time-to-live for OTP code in seconds")
                .type(ProviderConfigProperty.STRING_TYPE)
                .defaultValue(CustomOTPEmail.DEFAULT_OTP_TTL)
                .add()

                .property()
                .name(CustomOTPEmail.CONFIG_MAX_FAILED_ATTEMPTS)
                .label("Max Failed Attempts")
                .helpText("Maximum number of failed OTP verification attempts before locking")
                .type(ProviderConfigProperty.STRING_TYPE)
                .defaultValue(CustomOTPEmail.DEFAULT_MAX_FAILED_ATTEMPTS)
                .add()

                .property()
                .name(CustomOTPEmail.CONFIG_LOCK_DURATION)
                .label("Lock Duration (seconds)")
                .helpText("Account lock duration after max failed attempts")
                .type(ProviderConfigProperty.STRING_TYPE)
                .defaultValue(CustomOTPEmail.DEFAULT_LOCK_DURATION)
                .add()

                .build();
    }

    @Override
    public Authenticator create(KeycloakSession keycloakSession) {
        return new CustomOTPEmail();
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
        return CustomOTPEmail.PROVIDER_ID;
    }
}