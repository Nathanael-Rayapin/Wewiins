/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withExtraLanguages({/* ... */})
    .withCustomTranslations({
        en: {
            email: "Email",
            firstName: "Representative's first name",
            lastName: "Representative's name",
        },
        fr: {
            email: "Adresse e-mail",
            firstName: "Prénom du représentant",
            lastName: "Nom du représentant",
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
