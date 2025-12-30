package com.wewiins.authenticators;

import com.wewiins.services.SupabaseService;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerTransaction;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;

import org.jboss.logging.Logger;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

public class CustomRegisterEventListenerProvider implements EventListenerProvider {
    public static final String PROVIDER_ID = "custom-register-event-listener";

    private static final Logger log = Logger.getLogger(CustomRegisterEventListenerProvider.class);

    private final KeycloakSession session;
    private final KeycloakSessionFactory sessionFactory;
    private final EventListenerTransaction tx;
    private final SupabaseService supabaseService;

    public CustomRegisterEventListenerProvider(KeycloakSession session) {
        this.session = session;
        this.sessionFactory = session.getKeycloakSessionFactory();
        this.supabaseService = new SupabaseService();
        this.tx = new EventListenerTransaction(null, this::handleRegistrationEvent);
        this.session.getTransactionManager().enlistAfterCompletion(tx);
    }

    @Override
    public void onEvent(Event event) {
        if (EventType.REGISTER.equals(event.getType())) {
            if (event.getRealmId() != null && event.getUserId() != null) {
                log.infof("Registration event detected for user: %s in realm: %s",
                        event.getUserId(), event.getRealmId());
                tx.addEvent(event);
            }
        }
    }

    private void handleRegistrationEvent(Event event) {
        try {
            RealmModel realm = session.realms().getRealm(event.getRealmId());
            UserModel user = session.users().getUserById(realm, event.getUserId());

            if (user == null) {
                log.warnf("User not found for registration event: %s", event.getUserId());
                return;
            }

            // Extract user attributes
            String email = user.getEmail();
            String companyName = user.getFirstAttribute("compagnyName");
            String phoneNumber = user.getFirstAttribute("phoneNumber");

            log.infof("Extracted user data - Email: %s, Company: %s, Phone: %s",
                    email, companyName, phoneNumber);

            // Call Supabase service to create provider record
            boolean success = supabaseService.createProvider(email, companyName, phoneNumber);

            if (success) {
                log.infof("Successfully synchronized provider to Supabase for user: %s", event.getUserId());
            } else {
                log.warnf("Failed to synchronize provider to Supabase for user: %s. User created in Keycloak but not in Supabase.",
                        event.getUserId());
            }

        } catch (Exception e) {
            log.errorf(e, "Failed to handle registration event for user: %s", event.getUserId());
        }
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean b) {
        // No implementation needed
    }

    @Override
    public void close() {
        // No implementation needed
    }
}