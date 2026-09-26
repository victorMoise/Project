import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { WarningCircle } from "@phosphor-icons/react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { url, realm, auth, messagesPerField } = kcContext;

  const { msg, msgStr } = i18n;

  const hasFieldError = messagesPerField.existsError("username");

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!hasFieldError}
      headerNode={msg("emailForgotTitle")}
    >
      <form id="kc-reset-password-form" className="kc-form" action={url.loginAction} method="post">
        <p className="kc-intro-text">{realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")}</p>
        <div className="kc-field">
          <label htmlFor="username" className="kc-label">
            {!realm.loginWithEmailAllowed ? msg("username") : !realm.registrationEmailAsUsername ? msg("usernameOrEmail") : msg("email")}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="kc-input"
            autoFocus
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={auth.attemptedUsername ?? ""}
            aria-invalid={hasFieldError}
          />
          {hasFieldError && (
            <span className="kc-field-error" id="input-error-username" aria-live="polite">
              <WarningCircle size={16} weight="fill" aria-hidden />
              <span dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("username")) }} />
            </span>
          )}
        </div>

        <button className="kc-button-primary" type="submit">
          {msgStr("doSubmit")}
        </button>

        <p className="kc-footer">
          <a className="kc-link" href={url.loginUrl}>
            {msg("backToLogin")}
          </a>
        </p>
      </form>
    </Template>
  );
}
