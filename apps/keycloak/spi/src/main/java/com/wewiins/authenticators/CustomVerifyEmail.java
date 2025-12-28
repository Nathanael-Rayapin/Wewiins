package com.wewiins.authenticators;

import jakarta.ws.rs.core.Response;
import org.keycloak.authentication.RequiredActionContext;
import org.keycloak.authentication.RequiredActionProvider;
import org.keycloak.authentication.requiredactions.VerifyEmail;
import org.keycloak.authentication.requiredactions.util.EmailCooldownManager;
import org.keycloak.common.util.Time;
import org.keycloak.events.Details;
import org.keycloak.events.Errors;
import org.keycloak.events.EventBuilder;
import org.keycloak.events.EventType;
import org.keycloak.forms.login.LoginFormsProvider;
import org.keycloak.models.*;

import org.jboss.logging.Logger;
import org.keycloak.protocol.AuthorizationEndpointBase;
import org.keycloak.services.messages.Messages;
import org.keycloak.services.validation.Validation;
import org.keycloak.sessions.AuthenticationSessionModel;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.Objects;

import com.wewiins.services.EmailService;

public class CustomVerifyEmail implements RequiredActionProvider {
    public static final String EMAIL_RESEND_COOLDOWN_KEY_PREFIX = "verify-email-cooldown-";
    public static final String PROVIDER_ID = "CUSTOM_VERIFY_EMAIL";
    private static final Logger logger = Logger.getLogger(VerifyEmail.class);

    public static final String AUTH_NOTE_EMAIL_OTP_CODE = "EMAIL_OTP_CODE";
    public static final String AUTH_NOTE_EMAIL_OTP_GENERATED_AT = "EMAIL_OTP_GENERATED_AT";
    public static final String AUTH_NOTE_OTP_FAILED_ATTEMPTS = "OTP_FAILED_ATTEMPTS";
    public static final String AUTH_NOTE_OTP_LOCKED_UNTIL = "OTP_LOCKED_UNTIL";
    public static final String VERIFY_EMAIL_TEMPLATE = "login-verify-email.ftl";

    private final EmailService emailService = new EmailService();

    public CustomVerifyEmail() {
    }

    @Override
    public void evaluateTriggers(RequiredActionContext context) {
        if (context.getRealm().isVerifyEmail() && !context.getUser().isEmailVerified()) {
            // Don't add VERIFY_EMAIL if UPDATE_EMAIL is already present (UPDATE_EMAIL takes precedence)
            if (context.getUser().getRequiredActionsStream().noneMatch(action -> UserModel.RequiredAction.UPDATE_EMAIL.name().equals(action))) {
                context.getUser().addRequiredAction(PROVIDER_ID);
                logger.debug("User is required to verify email");
            } else {
                logger.debug("Skipping VERIFY_EMAIL because UPDATE_EMAIL is already present");
            }
        }
    }

    @Override
    public void requiredActionChallenge(RequiredActionContext context) {
        process(context, true);
    }

    @Override
    public void processAction(RequiredActionContext context) {
        AuthenticationSessionModel authSession = context.getAuthenticationSession();

        // Vérifie si l'utilisateur est temporairement bloqué
        if (isAccountLocked(authSession)) {
            long lockedUntil = Long.parseLong(authSession.getAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL));
            long remainingLockTime = lockedUntil - Time.currentTime();
            long remainingMinutes = remainingLockTime / 60;

            Response errorPage = context.form()
                    .setError("Trop de tentatives échouées. Votre compte est temporairement bloqué pour des raisons de sécurité.")
                    .setAttribute("lockRemainingTime", remainingMinutes)
                    .createErrorPage(Response.Status.FORBIDDEN);

            context.challenge(errorPage);
            return;
        }

        // Vérifie si c'est une soumission de code OTP
        String submittedCode = context.getHttpRequest().getDecodedFormParameters().getFirst("otp_code");

        if (submittedCode != null) {
            // CAS 1 : Validation du code OTP
            String storedCode = authSession.getAuthNote(AUTH_NOTE_EMAIL_OTP_CODE);

            if (submittedCode.equals(storedCode)) {
                // Vérifie l'expiration
                Long generatedAt = Long.parseLong(authSession.getAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT));
                if (Time.currentTime() - generatedAt > getOtpTtl(context)) {
                    context.challenge(context.form()
                            .setError("Code expiré")
                            .setAttribute("otpRemainingTime", 0L)
                            .createForm(VERIFY_EMAIL_TEMPLATE));
                    return;
                }

                // Valide l'email
                authSession.removeAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);
                authSession.removeAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL);

                context.getUser().setEmailVerified(true);
                authSession.removeAuthNote(AUTH_NOTE_EMAIL_OTP_CODE);
                authSession.removeAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT);
                context.success();
            } else {
                // Code invalide - incrémente les tentatives échouées
                int failedAttempts = incrementFailedAttempts(authSession);
                int maxAttempts = getMaxFailedAttempts(context);

                if (failedAttempts >= maxAttempts) {
                    // Bloque le compte temporairement
                    long lockDuration = getLockDuration(context);
                    long lockedUntil = Time.currentTime() + lockDuration;
                    authSession.setAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL, String.valueOf(lockedUntil));

                    logger.warnf("User %s locked after %d failed OTP attempts",
                            context.getUser().getUsername(), failedAttempts);

                    context.challenge(context.form()
                            .setError("Trop de tentatives échouées. Compte bloqué pendant " + (lockDuration / 60) + " minutes.")
                            .setAttribute("otpRemainingTime", getRemainingOtpTime(context))
                            .setAttribute("accountLocked", true)
                            .setAttribute("lockRemainingTime", lockDuration)
                            .createForm(VERIFY_EMAIL_TEMPLATE));
                } else {
                    int remainingAttempts = maxAttempts - failedAttempts;
                    context.challenge(context.form()
                            .setError("Code invalide. Il vous reste " + remainingAttempts + " tentative(s).")
                            .setAttribute("otpRemainingTime", getRemainingOtpTime(context))
                            .setAttribute("failedAttempts", failedAttempts)
                            .setAttribute("remainingAttempts", remainingAttempts)
                            .createForm(VERIFY_EMAIL_TEMPLATE));
                }
            }
        } else {
            // CAS 2 : Réenvoie de l'email
            logger.debugf("Re-sending email requested for user: %s", context.getUser().getUsername());

            Long remaining = EmailCooldownManager.retrieveCooldownEntry(context, EMAIL_RESEND_COOLDOWN_KEY_PREFIX);
            if (remaining != null) {
                Response retryPage = context.form()
                        .setError(Messages.COOLDOWN_VERIFICATION_EMAIL, remaining)
                        .setAttribute("otpRemainingTime", getRemainingOtpTime(context))
                        .createForm(VERIFY_EMAIL_TEMPLATE);
                context.challenge(retryPage);
                return;
            }

            // Permet de régénérer un nouveau code
            authSession.removeAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);
            authSession.removeAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL);
            context.getAuthenticationSession().removeAuthNote(Constants.VERIFY_EMAIL_KEY);
            process(context, false);
        }
    }

    @Override
    public void close() {
        // No implementation needed
    }

    private void process(RequiredActionContext context, boolean isChallenge) {
        AuthenticationSessionModel authSession = context.getAuthenticationSession();

        if (context.getUser().isEmailVerified()) {
            context.success();
            authSession.removeAuthNote(Constants.VERIFY_EMAIL_KEY);
            return;
        }

        String email = context.getUser().getEmail();
        if (Validation.isBlank(email)) {
            context.ignore();
            return;
        }

        LoginFormsProvider loginFormsProvider = context.form();
        loginFormsProvider.setAuthenticationSession(context.getAuthenticationSession());
        Response challenge;
        authSession.setClientNote(AuthorizationEndpointBase.APP_INITIATED_FLOW, null);

        // Do not allow resending e-mail by simple page refresh, i.e. when e-mail sent, it should be resent properly via email-verification endpoint
        if (!Objects.equals(authSession.getAuthNote(Constants.VERIFY_EMAIL_KEY), email) && !(isCurrentActionTriggeredFromAIA(context) && isChallenge)) {
            // Adding the cooldown entry first to prevent concurrent operations
            EmailCooldownManager.addCooldownEntry(context, EMAIL_RESEND_COOLDOWN_KEY_PREFIX);
            authSession.setAuthNote(Constants.VERIFY_EMAIL_KEY, email);
            EventBuilder event = context.getEvent().clone().event(EventType.SEND_VERIFY_EMAIL).detail(Details.EMAIL, email);

            String otpCode = generateOTP(context);
            authSession.setAuthNote(AUTH_NOTE_EMAIL_OTP_CODE, otpCode);
            authSession.setAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT, String.valueOf(Time.currentTime()));
            authSession.removeAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);
            authSession.removeAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL);

            challenge = sendVerifyEmail(context, event);
        } else {
            challenge = loginFormsProvider
                    .setAttribute("otpRemainingTime", getOtpTtl(context))
                    .createForm(VERIFY_EMAIL_TEMPLATE);
        }

        context.challenge(challenge);
    }

    private boolean isCurrentActionTriggeredFromAIA(RequiredActionContext context) {
        return Objects.equals(context.getAuthenticationSession().getClientNote(Constants.KC_ACTION), PROVIDER_ID);
    }

    private Response sendVerifyEmail(RequiredActionContext context, EventBuilder event) {
        UserModel user = context.getUser();
        AuthenticationSessionModel authSession = context.getAuthenticationSession();

        try {
            String otpCode = authSession.getAuthNote(AUTH_NOTE_EMAIL_OTP_CODE);
            emailService.sendOTPEmail(user.getEmail(), otpCode, getBrevoApiKey(context));

            event.success();
            return context.form()
                    .setAttribute("otpRemainingTime", getRemainingOtpTime(context))
                    .createForm(VERIFY_EMAIL_TEMPLATE);

        } catch (IOException | InterruptedException e) {
            event.clone().event(EventType.SEND_VERIFY_EMAIL)
                    .detail(Details.REASON, e.getMessage())
                    .user(user)
                    .error(Errors.EMAIL_SEND_FAILED);

            logger.error("Failed to send OTP email via Brevo", e);
            context.failure(Messages.EMAIL_SENT_ERROR);

            return context.form()
                    .setError(Messages.EMAIL_SENT_ERROR)
                    .createErrorPage(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    private String generateOTP(RequiredActionContext context) {
        int digits = getOtpDigits(context);
        SecureRandom random = new SecureRandom();
        int max = (int) Math.pow(10, digits);
        int otp = random.nextInt(max);
        return String.format("%0" + digits + "d", otp);
    }

    private int getOtpDigits(RequiredActionContext context) {
        return Integer.parseInt(
                context.getRealm()
                        .getRequiredActionProviderByAlias(PROVIDER_ID)
                        .getConfig()
                        .getOrDefault("otp_digits", "6")
        );
    }

    private int getOtpTtl(RequiredActionContext context) {
        return Integer.parseInt(
                context.getRealm()
                        .getRequiredActionProviderByAlias(PROVIDER_ID)
                        .getConfig()
                        .getOrDefault("otp_ttl", "600")
        );
    }

    private String getBrevoApiKey(RequiredActionContext context) {
        return context.getRealm()
                .getRequiredActionProviderByAlias(PROVIDER_ID)
                .getConfig()
                .getOrDefault("brevoApiKey", "");
    }

    private long getRemainingOtpTime(RequiredActionContext context) {
        AuthenticationSessionModel authSession = context.getAuthenticationSession();
        String generatedAtStr = authSession.getAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT);

        if (generatedAtStr == null) {
            return getOtpTtl(context);
        }

        long generatedAt = Long.parseLong(generatedAtStr);
        long elapsed = Time.currentTime() - generatedAt;
        long remaining = getOtpTtl(context) - elapsed;

        return Math.max(0, remaining);
    }

    private boolean isAccountLocked(AuthenticationSessionModel authSession) {
        String lockedUntilStr = authSession.getAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL);
        if (lockedUntilStr == null) {
            return false;
        }

        long lockedUntil = Long.parseLong(lockedUntilStr);
        if (Time.currentTime() < lockedUntil) {
            return true;
        }

        // Le délai de blocage est passé, on nettoie
        authSession.removeAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL);
        authSession.removeAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);
        return false;
    }

    private int incrementFailedAttempts(AuthenticationSessionModel authSession) {
        String attemptsStr = authSession.getAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);
        int attempts = attemptsStr == null ? 0 : Integer.parseInt(attemptsStr);
        attempts++;
        authSession.setAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS, String.valueOf(attempts));
        return attempts;
    }

    private int getMaxFailedAttempts(RequiredActionContext context) {
        return Integer.parseInt(
                context.getRealm()
                        .getRequiredActionProviderByAlias(PROVIDER_ID)
                        .getConfig()
                        .getOrDefault("max_failed_attempts", "3")
        );
    }

    private long getLockDuration(RequiredActionContext context) {
        // Durée en secondes (par défaut 15 minutes = 900 secondes)
        return Long.parseLong(
                context.getRealm()
                        .getRequiredActionProviderByAlias(PROVIDER_ID)
                        .getConfig()
                        .getOrDefault("lock_duration", "900")
        );
    }
}
