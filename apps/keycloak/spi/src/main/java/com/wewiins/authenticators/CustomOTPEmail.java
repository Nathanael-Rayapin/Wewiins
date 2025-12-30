package com.wewiins.authenticators;

import com.wewiins.services.EmailService;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.Authenticator;
import org.keycloak.common.util.Time;
import org.keycloak.events.Details;
import org.keycloak.events.Errors;
import org.keycloak.events.EventType;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.sessions.AuthenticationSessionModel;

import java.io.IOException;
import java.security.SecureRandom;

/**
 * Custom authenticator that sends an OTP code via email for passwordless authentication.
 */
public class CustomOTPEmail implements Authenticator {

    private static final Logger log = Logger.getLogger(CustomOTPEmail.class);

    public static final String PROVIDER_ID = "custom-otp-email-authenticator";

    // Auth notes keys
    private static final String AUTH_NOTE_EMAIL_OTP_CODE = "EMAIL_OTP_CODE";
    private static final String AUTH_NOTE_EMAIL_OTP_GENERATED_AT = "EMAIL_OTP_GENERATED_AT";
    private static final String AUTH_NOTE_OTP_FAILED_ATTEMPTS = "OTP_FAILED_ATTEMPTS";
    private static final String AUTH_NOTE_OTP_LOCKED_UNTIL = "OTP_LOCKED_UNTIL";

    // Configuration keys
    public static final String CONFIG_OTP_DIGITS = "otp_digits";
    public static final String CONFIG_OTP_TTL = "otp_ttl";
    public static final String CONFIG_MAX_FAILED_ATTEMPTS = "max_failed_attempts";
    public static final String CONFIG_LOCK_DURATION = "lock_duration";

    // Default values
    public static final int DEFAULT_OTP_DIGITS = 6;
    public static final int DEFAULT_OTP_TTL = 300; // 5 minutes
    public static final int DEFAULT_MAX_FAILED_ATTEMPTS = 3;
    public static final long DEFAULT_LOCK_DURATION = 900; // 15 minutes

    private static final String BREVO_API_KEY = System.getenv("BREVO_API_KEY");
    private static final String LOGIN_OTP_TEMPLATE = "login-otp.ftl";

    private final EmailService emailService = new EmailService();

    public CustomOTPEmail() {}

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        UserModel user = context.getUser();

        if (user == null) {
            log.error("User not found in authentication context");
            context.failure(org.keycloak.authentication.AuthenticationFlowError.INVALID_USER);
            return;
        }

        String email = user.getEmail();
        if (email == null || email.isBlank()) {
            log.warnf("User %s has no email configured", user.getUsername());
            context.failure(org.keycloak.authentication.AuthenticationFlowError.INVALID_USER);
            return;
        }

        AuthenticationSessionModel authSession = context.getAuthenticationSession();

        // Check if account is locked
        if (isAccountLocked(authSession)) {
            long lockedUntil = Long.parseLong(authSession.getAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL));
            long remainingLockTime = (lockedUntil - Time.currentTime()) / 60;

            Response challenge = context.form()
                    .setError("Trop de tentatives échouées. Compte temporairement bloqué.")
                    .setAttribute("lockRemainingTime", remainingLockTime)
                    .createForm(LOGIN_OTP_TEMPLATE);

            context.challenge(challenge);
            return;
        }

        // Generate and send OTP
        String otpCode = generateOTP(context);
        authSession.setAuthNote(AUTH_NOTE_EMAIL_OTP_CODE, otpCode);
        authSession.setAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT, String.valueOf(Time.currentTime()));
        authSession.removeAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);

        log.infof("Sending OTP to user %s at email %s", user.getUsername(), email);

        try {
            emailService.sendOTPEmail(email, otpCode, BREVO_API_KEY, 24L);

            context.getEvent()
                    .clone()
                    .event(EventType.SEND_VERIFY_EMAIL)
                    .detail(Details.EMAIL, email)
                    .success();

            Response challenge = context.form()
                    .setAttribute("otpRemainingTime", getOtpTtl(context))
                    .createForm(LOGIN_OTP_TEMPLATE);

            context.challenge(challenge);

        } catch (IOException | InterruptedException e) {
            log.errorf(e, "Failed to send OTP email to %s", email);

            context.getEvent()
                    .clone()
                    .event(EventType.SEND_VERIFY_EMAIL)
                    .detail(Details.EMAIL, email)
                    .detail(Details.REASON, e.getMessage())
                    .error(Errors.EMAIL_SEND_FAILED);

            Response errorPage = context.form()
                    .setError("Erreur lors de l'envoi de l'email. Veuillez réessayer.")
                    .createErrorPage(Response.Status.INTERNAL_SERVER_ERROR);

            context.challenge(errorPage);
        }
    }

    @Override
    public void action(AuthenticationFlowContext context) {
        MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();
        String submittedCode = formData.getFirst("otp");

        if (submittedCode == null || submittedCode.isBlank()) {
            Response challenge = context.form()
                    .setError("Veuillez saisir le code OTP")
                    .setAttribute("otpRemainingTime", getRemainingOtpTime(context))
                    .createForm(LOGIN_OTP_TEMPLATE);

            context.challenge(challenge);
            return;
        }

        AuthenticationSessionModel authSession = context.getAuthenticationSession();

        // Check if account is locked
        if (isAccountLocked(authSession)) {
            long lockedUntil = Long.parseLong(authSession.getAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL));
            long remainingLockTime = (lockedUntil - Time.currentTime()) / 60;

            Response challenge = context.form()
                    .setError("Trop de tentatives échouées. Compte temporairement bloqué.")
                    .setAttribute("lockRemainingTime", remainingLockTime)
                    .createForm(LOGIN_OTP_TEMPLATE);

            context.challenge(challenge);
            return;
        }

        String storedCode = authSession.getAuthNote(AUTH_NOTE_EMAIL_OTP_CODE);
        String generatedAtStr = authSession.getAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT);

        if (storedCode == null || generatedAtStr == null) {
            log.warn("OTP code or generation time not found in session");
            context.failure(org.keycloak.authentication.AuthenticationFlowError.INVALID_CREDENTIALS);
            return;
        }

        // Check expiration
        long generatedAt = Long.parseLong(generatedAtStr);
        long elapsed = Time.currentTime() - generatedAt;

        if (elapsed > getOtpTtl(context)) {
            Response challenge = context.form()
                    .setError("Code expiré. Veuillez demander un nouveau code.")
                    .setAttribute("otpRemainingTime", 0L)
                    .createForm(LOGIN_OTP_TEMPLATE);

            context.challenge(challenge);
            return;
        }

        // Validate code
        if (submittedCode.equals(storedCode)) {
            // Success
            log.infof("OTP validated successfully for user %s", context.getUser().getUsername());

            authSession.removeAuthNote(AUTH_NOTE_EMAIL_OTP_CODE);
            authSession.removeAuthNote(AUTH_NOTE_EMAIL_OTP_GENERATED_AT);
            authSession.removeAuthNote(AUTH_NOTE_OTP_FAILED_ATTEMPTS);
            authSession.removeAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL);

            context.success();

        } else {
            // Invalid code - increment failed attempts
            int failedAttempts = incrementFailedAttempts(authSession);
            int maxAttempts = getMaxFailedAttempts(context);

            log.warnf("Invalid OTP code for user %s. Failed attempts: %d/%d",
                    context.getUser().getUsername(), failedAttempts, maxAttempts);

            if (failedAttempts >= maxAttempts) {
                // Lock account
                long lockDuration = getLockDuration(context);
                long lockedUntil = Time.currentTime() + lockDuration;
                authSession.setAuthNote(AUTH_NOTE_OTP_LOCKED_UNTIL, String.valueOf(lockedUntil));

                log.warnf("User %s locked after %d failed OTP attempts",
                        context.getUser().getUsername(), failedAttempts);

                Response challenge = context.form()
                        .setError("Trop de tentatives échouées. Compte bloqué pendant " + (lockDuration / 60) + " minutes.")
                        .setAttribute("accountLocked", true)
                        .setAttribute("lockRemainingTime", lockDuration / 60)
                        .createForm(LOGIN_OTP_TEMPLATE);

                context.challenge(challenge);

            } else {
                int remainingAttempts = maxAttempts - failedAttempts;

                Response challenge = context.form()
                        .setError("Code invalide. Il vous reste " + remainingAttempts + " tentative(s).")
                        .setAttribute("otpRemainingTime", getRemainingOtpTime(context))
                        .setAttribute("failedAttempts", failedAttempts)
                        .setAttribute("remainingAttempts", remainingAttempts)
                        .createForm(LOGIN_OTP_TEMPLATE);

                context.challenge(challenge);
            }
        }
    }

    @Override
    public boolean requiresUser() {
        return true; // User must be identified before OTP
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true; // Always available (email-based)
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
        // No required actions needed
    }

    @Override
    public void close() {
        // No resources to clean up
    }

    // Helper methods

    private String generateOTP(AuthenticationFlowContext context) {
        int digits = getOtpDigits(context);
        SecureRandom random = new SecureRandom();
        int max = (int) Math.pow(10, digits);
        int otp = random.nextInt(max);
        return String.format("%0" + digits + "d", otp);
    }

    private int getOtpDigits(AuthenticationFlowContext context) {
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        if (config != null && config.getConfig().containsKey(CONFIG_OTP_DIGITS)) {
            return Integer.parseInt(config.getConfig().get(CONFIG_OTP_DIGITS));
        }
        return DEFAULT_OTP_DIGITS;
    }

    private int getOtpTtl(AuthenticationFlowContext context) {
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        if (config != null && config.getConfig().containsKey(CONFIG_OTP_TTL)) {
            return Integer.parseInt(config.getConfig().get(CONFIG_OTP_TTL));
        }
        return DEFAULT_OTP_TTL;
    }

    private long getRemainingOtpTime(AuthenticationFlowContext context) {
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

        // Lock expired - clean up
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

    private int getMaxFailedAttempts(AuthenticationFlowContext context) {
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        if (config != null && config.getConfig().containsKey(CONFIG_MAX_FAILED_ATTEMPTS)) {
            return Integer.parseInt(config.getConfig().get(CONFIG_MAX_FAILED_ATTEMPTS));
        }
        return DEFAULT_MAX_FAILED_ATTEMPTS;
    }

    private long getLockDuration(AuthenticationFlowContext context) {
        AuthenticatorConfigModel config = context.getAuthenticatorConfig();
        if (config != null && config.getConfig().containsKey(CONFIG_LOCK_DURATION)) {
            return Long.parseLong(config.getConfig().get(CONFIG_LOCK_DURATION));
        }
        return DEFAULT_LOCK_DURATION;
    }
}