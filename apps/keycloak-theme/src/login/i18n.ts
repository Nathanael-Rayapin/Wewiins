/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withExtraLanguages({/* ... */})
    .withCustomTranslations({
        en: {
            // Verify Email
            emailVerifyTitle: "Email verification",
            emailVerifyCTA: "Verify",
            // Register
            email: "Email",
            firstName: "First name",
            lastName: "Last name",
            alternateLastName: "Last name",
            registerTitle: "We are delighted to welcome you",
            doRegister: "Register",
            doConnect: "Log in",
            alreadyHaveAccount: "Do you have an account ? This way, please !",
            phoneNumberError: "Please enter a valid French phone number",

        },
        fr: {
            // Verify Email
            emailVerifyTitle: "Code de vérification",
            emailVerifyCTA: "Vérifier",
            // Register
            email: "Adresse e-mail",
            firstName: "Prénom",
            lastName: "Nom",
            alternateLastName: "Nom",
            registerTitle: "Heureux de vous accueillir",
            doRegister: "S'inscrire",
            doConnect: "Se connecter",
            alreadyHaveAccount: "Vous avez un compte ? C'est par ici ! ",
            phoneNumberError: "Veuillez saisir un numéro de téléphone français valide"
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
