import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

// Romanian ("ro") ships as a complete built-in bundle in Keycloak's base
// theme (messages_ro.properties) -- no withExtraLanguages/full translation
// file needed. withCustomTranslations below is only for keys THIS theme
// introduces beyond Keycloak's defaults (see docs.keycloakify.dev/features/i18n).
/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder.withThemeName<ThemeName>().build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
