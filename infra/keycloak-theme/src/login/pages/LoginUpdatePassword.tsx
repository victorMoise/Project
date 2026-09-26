import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { Check, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { I18n } from "../i18n";
import type { KcContext } from "../KcContext";

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { msg, msgStr } = i18n;

  const { url, messagesPerField, isAppInitiatedAction } = kcContext;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!messagesPerField.existsError("password", "password-confirm")}
      headerNode={msg("updatePasswordTitle")}
    >
      <form id="kc-passwd-update-form" className="kc-form" action={url.loginAction} method="post">
        <div className="kc-field">
          <label htmlFor="password-new" className="kc-label">
            {msg("passwordNew")}
          </label>
          <PasswordField i18n={i18n} passwordInputId="password-new" name="password-new" autoFocus aria-invalid={messagesPerField.existsError("password", "password-confirm")} />
          {messagesPerField.existsError("password") && (
            <span className="kc-field-error" id="input-error-password" aria-live="polite">
              <WarningCircle size={16} weight="fill" aria-hidden />
              <span dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("password")) }} />
            </span>
          )}
        </div>

        <div className="kc-field">
          <label htmlFor="password-confirm" className="kc-label">
            {msg("passwordConfirm")}
          </label>
          <PasswordField i18n={i18n} passwordInputId="password-confirm" name="password-confirm" aria-invalid={messagesPerField.existsError("password", "password-confirm")} />
          {messagesPerField.existsError("password-confirm") && (
            <span className="kc-field-error" id="input-error-password-confirm" aria-live="polite">
              <WarningCircle size={16} weight="fill" aria-hidden />
              <span dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("password-confirm")) }} />
            </span>
          )}
        </div>

        <label className="kc-checkbox">
          <span className="kc-checkbox-box">
            <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" className="kc-checkbox-input" />
            <Check size={12} weight="bold" className="kc-checkbox-check" aria-hidden />
          </span>
          {msg("logoutOtherSessions")}
        </label>

        <button className="kc-button-primary" type="submit">
          {msgStr("doSubmit")}
        </button>
        {isAppInitiatedAction && (
          <button className="kc-button-primary" type="submit" name="cancel-aia" value="true">
            {msg("doCancel")}
          </button>
        )}
      </form>
    </Template>
  );
}

function PasswordField(props: { i18n: I18n; passwordInputId: string; name: string; autoFocus?: boolean; "aria-invalid": boolean }) {
  const { i18n, passwordInputId, name, autoFocus, "aria-invalid": ariaInvalid } = props;
  const { msgStr } = i18n;

  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

  return (
    <div className="kc-input-group">
      <input
        id={passwordInputId}
        name={name}
        className="kc-input"
        type="password"
        autoFocus={autoFocus}
        autoComplete="new-password"
        aria-invalid={ariaInvalid}
      />
      <button
        type="button"
        className="kc-password-toggle"
        aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
        aria-controls={passwordInputId}
        onClick={toggleIsPasswordRevealed}
      >
        {isPasswordRevealed ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
      </button>
    </div>
  );
}
