package com.wewiins.authenticators;

import com.wewiins.models.OrganizationInvitationModel;
import com.wewiins.organization.InvitationManager;
import com.wewiins.organization.OrganizationProvider;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import org.keycloak.authentication.*;
import org.keycloak.authentication.actiontoken.inviteorg.InviteOrgActionToken;
import org.keycloak.authentication.forms.RegistrationPage;
import org.keycloak.authentication.requiredactions.TermsAndConditions;
import org.keycloak.common.Profile;
import org.keycloak.common.VerificationException;
import org.keycloak.common.util.Time;
import org.keycloak.events.Details;
import org.keycloak.events.Errors;
import org.keycloak.events.EventType;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.*;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.organization.utils.Organizations;
import org.keycloak.protocol.oidc.OIDCLoginProtocol;
import org.keycloak.services.messages.Messages;
import org.keycloak.services.validation.Validation;
import org.keycloak.userprofile.*;

import java.util.List;
import java.util.function.Consumer;

public class CustomRegistrationUserCreation implements FormAction {

    public final String COMPAGNY_NAME = "compagnyName";
    public final String PHONE_NUMBER = "phoneNumber";

    public CustomRegistrationUserCreation() {}

    @Override
    public void buildPage(FormContext formContext, LoginFormsProvider loginFormsProvider) {
        checkNotOtherUserAuthenticating(formContext);
    }

    @Override
    public void validate(ValidationContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        context.getEvent().detail(Details.REGISTER_METHOD, "form");

        UserProfile profile = getOrCreateUserProfile(context, formData);
        Attributes attributes = profile.getAttributes();
        String email = attributes.getFirst(UserModel.EMAIL);

        if (!validateOrganizationInvitation(context, formData, email)) {
            return;
        }

        String username = attributes.getFirst(UserModel.USERNAME);
        String firstName = attributes.getFirst(UserModel.FIRST_NAME);
        String lastName = attributes.getFirst(UserModel.LAST_NAME);
        String compagnyName = attributes.getFirst(COMPAGNY_NAME);
        String phoneNumber = attributes.getFirst(PHONE_NUMBER);

        context.getEvent().detail(Details.EMAIL, email);
        context.getEvent().detail(Details.USERNAME, username);
        context.getEvent().detail(Details.FIRST_NAME, firstName);
        context.getEvent().detail(Details.LAST_NAME, lastName);
        context.getEvent().detail("compagny_name", compagnyName);
        context.getEvent().detail("phone_number", phoneNumber);

        if (context.getRealm().isRegistrationEmailAsUsername()) {
            context.getEvent().detail(Details.USERNAME, email);
        }

        try {
            profile.validate();
        } catch (ValidationException pve) {
            List<FormMessage> errors = Validation.getFormErrorsFromValidation(pve.getErrors());

            if (pve.hasError(Messages.EMAIL_EXISTS, Messages.INVALID_EMAIL)) {
                context.getEvent().detail(Details.EMAIL, attributes.getFirst(UserModel.EMAIL));
            }

            if (pve.hasError(Messages.EMAIL_EXISTS)) {
                context.error(Errors.EMAIL_IN_USE);
            } else if (pve.hasError(Messages.USERNAME_EXISTS)) {
                context.error(Errors.USERNAME_IN_USE);
            } else {
                context.error(Errors.INVALID_REGISTRATION);
            }

            context.validationError(formData, errors);
            return;
        }
        context.success();
    }

    @Override
    public void success(FormContext context) {
        checkNotOtherUserAuthenticating(context);

        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();

        String email = formData.getFirst(UserModel.EMAIL);
        String username = formData.getFirst(UserModel.USERNAME);

        if (context.getRealm().isRegistrationEmailAsUsername()) {
            username = email;
        }

        context.getEvent().detail(Details.USERNAME, username)
                .detail(Details.REGISTER_METHOD, "form")
                .detail(Details.EMAIL, email);

        UserProfile profile = getOrCreateUserProfile(context, formData);
        UserModel user = profile.create();

        addOrganizationMember(context, user);

        user.setEnabled(true);
        user.addRequiredAction(UserModel.RequiredAction.VERIFY_EMAIL);

        if ("on".equals(formData.getFirst("termsAccepted"))) {
            // if accepted terms and conditions checkbox, remove action and add the attribute if enabled
            RequiredActionProviderModel tacModel = context.getRealm().getRequiredActionProviderByAlias(
                    UserModel.RequiredAction.TERMS_AND_CONDITIONS.name());
            if (tacModel != null && tacModel.isEnabled()) {
                user.setSingleAttribute(TermsAndConditions.USER_ATTRIBUTE, Integer.toString(Time.currentTime()));
                context.getAuthenticationSession().removeRequiredAction(UserModel.RequiredAction.TERMS_AND_CONDITIONS);
                user.removeRequiredAction(UserModel.RequiredAction.TERMS_AND_CONDITIONS);
            }
        }

        context.setUser(user);

        context.getAuthenticationSession().setClientNote(OIDCLoginProtocol.LOGIN_HINT_PARAM, username);

        context.getEvent().user(user);
        context.getEvent().success();
        context.newEvent().event(EventType.LOGIN);
        context.getEvent().client(context.getAuthenticationSession().getClient().getClientId())
                .detail(Details.REDIRECT_URI, context.getAuthenticationSession().getRedirectUri())
                .detail(Details.AUTH_METHOD, context.getAuthenticationSession().getProtocol());
        String authType = context.getAuthenticationSession().getAuthNote(Details.AUTH_TYPE);
        if (authType != null) {
            context.getEvent().detail(Details.AUTH_TYPE, authType);
        }
    }

    @Override
    public boolean requiresUser() {
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession keycloakSession, RealmModel realmModel, UserModel userModel) {
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession keycloakSession, RealmModel realmModel, UserModel userModel) {
        // No implementation needed
    }

    @Override
    public void close() {
        // No implementation needed
    }

    private boolean validateOrganizationInvitation(ValidationContext context, MultivaluedMap<String, String> formData, String email) {
        if (Profile.isFeatureEnabled(Profile.Feature.ORGANIZATION)) {
            Consumer<List<FormMessage>> error = messages -> {
                context.error(Errors.INVALID_TOKEN);
                context.validationError(formData, messages);
            };

            InviteOrgActionToken token;

            try {
                token = Organizations.parseInvitationToken(context.getHttpRequest());
            } catch (VerificationException e) {
                error.accept(List.of(new FormMessage("Unexpected error parsing the invitation token")));
                return false;
            }

            if (token == null) {
                return true;
            }

            KeycloakSession session = context.getSession();
            OrganizationProvider provider = session.getProvider(OrganizationProvider.class);
            OrganizationModel organization = provider.getById(token.getOrgId());

            if (organization == null) {
                error.accept(List.of(new FormMessage("The provided token contains an invalid organization id")));
                return false;
            }

            // make sure the organization is set to the session so that UP org-related validators can run
            session.getContext().setOrganization(organization);
            session.setAttribute(InviteOrgActionToken.class.getName(), token);

            if (token.isExpired() || !token.getActionId().equals(InviteOrgActionToken.TOKEN_TYPE)) {
                error.accept(List.of(new FormMessage("The provided token is not valid or has expired.")));
                return false;
            }

            // Validate that the invitation still exists in the database
            InvitationManager invitationManager = provider.getInvitationManager();
            OrganizationInvitationModel invitation = invitationManager.getById(token.getId());

            if (invitation == null || invitation.isExpired()) {
                error.accept(List.of(new FormMessage("The invitation has expired or is no longer valid.")));
                return false;
            }

            if (!token.getEmail().equals(email)) {
                error.accept(List.of(new FormMessage(UserModel.EMAIL, "Email does not match the invitation")));
                return false;
            }
        }

        return true;
    }

    private MultivaluedMap<String, String> normalizeFormParameters(MultivaluedMap<String, String> formParams) {
        MultivaluedHashMap<String, String> copy = new MultivaluedHashMap<>(formParams);

        // Remove google recaptcha form property to avoid length errors
        copy.remove(RegistrationPage.FIELD_RECAPTCHA_RESPONSE);
        // Remove "password" and "password-confirm" to avoid leaking them in the user-profile data
        copy.remove(RegistrationPage.FIELD_PASSWORD);
        copy.remove(RegistrationPage.FIELD_PASSWORD_CONFIRM);

        return copy;
    }

    /**
     * Get user profile instance for current HTTP request (KeycloakSession) and for given context. This assumes that there is
     * single user registered within HTTP request, which is always the case in Keycloak
     */
    public UserProfile getOrCreateUserProfile(FormContext formContext, MultivaluedMap<String, String> formData) {
        KeycloakSession session = formContext.getSession();
        UserProfile profile = (UserProfile) session.getAttribute("UP_REGISTER");
        if (profile == null) {
            formData = normalizeFormParameters(formData);
            UserProfileProvider profileProvider = session.getProvider(UserProfileProvider.class);
            profile = profileProvider.create(UserProfileContext.REGISTRATION, formData);
            session.setAttribute("UP_REGISTER", profile);
        }
        return profile;
    }

    private void checkNotOtherUserAuthenticating(FormContext context) {
        if (context.getUser() != null) {
            // the user probably did some back navigation in the browser, hitting this page in a strange state
            context.getEvent().detail(Details.EXISTING_USER, context.getUser().getUsername());
            throw new AuthenticationFlowException(AuthenticationFlowError.GENERIC_AUTHENTICATION_ERROR, Errors.DIFFERENT_USER_AUTHENTICATING, Messages.EXPIRED_ACTION);
        }
    }

    private void addOrganizationMember(FormContext context, UserModel user) {
        if (Profile.isFeatureEnabled(Profile.Feature.ORGANIZATION)) {
            InviteOrgActionToken token = (InviteOrgActionToken) context.getSession().getAttribute(InviteOrgActionToken.class.getName());

            if (token != null) {
                KeycloakSession session = context.getSession();
                OrganizationProvider provider = session.getProvider(OrganizationProvider.class);
                OrganizationModel orgModel = provider.getById(token.getOrgId());
                provider.addManagedMember(orgModel, user);
                context.getEvent().detail(Details.ORG_ID, orgModel.getId());
                context.getAuthenticationSession().setRedirectUri(token.getRedirectUri());

                // Delete the invitation since it has been used
                InvitationManager invitationManager = provider.getInvitationManager();
                invitationManager.remove(token.getId());
            }
        }
    }
}