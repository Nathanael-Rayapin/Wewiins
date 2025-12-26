package com.wewiins.factories;

import com.wewiins.authenticators.CustomRegistrationUserCreation;
import org.keycloak.Config;
import org.keycloak.authentication.FormAction;
import org.keycloak.authentication.FormActionFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

import java.util.List;

public class CustomRegistrationUserCreationFactory implements FormActionFactory {

    public static final String PROVIDER_ID = "custom-registration-user-creation";

    @Override
    public String getDisplayType() {
        return "Custom Registration User Profile Creation";
    }

    @Override
    public String getReferenceCategory() {
        return null;
    }

    @Override
    public boolean isConfigurable() {
        return false;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return new AuthenticationExecutionModel.Requirement[] {
                AuthenticationExecutionModel.Requirement.REQUIRED,
                AuthenticationExecutionModel.Requirement.DISABLED
        };
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public String getHelpText() {
        return "This action must always be first! Validates the username and user profile of the user in validation phase.  In success phase, this will create the user in the database including his user profile.";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return null;
    }

    @Override
    public FormAction create(KeycloakSession keycloakSession) {
        return new CustomRegistrationUserCreation();
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
        return PROVIDER_ID;
    }
}