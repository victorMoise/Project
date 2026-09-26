/**
 * Combined Username + Password login page (login.ftl) with optional WebAuthn passkey support.
 * Renders standard login form plus conditional passkey authenticator section.
 */
import { useState } from "react";
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { useScript } from "keycloakify/login/pages/Login.useScript";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField, enableWebAuthnConditionalUI, authenticators } =
    kcContext;

  const { msg, msgStr } = i18n;

  const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

  const webAuthnButtonId = "authenticateWebAuthnButton";

  useScript({
    webAuthnButtonId,
    kcContext,
    i18n,
  });

  const hasFieldError = messagesPerField.existsError("username", "password");

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!hasFieldError}
      headerNode={msg("loginAccountTitle")}
      infoNode={
        realm.password && realm.registrationAllowed && !registrationDisabled ? (
          <span>
            {msg("noAccount")}{" "}
            <a className="kc-link" href={url.registrationUrl}>
              {msg("doRegister")}
            </a>
          </span>
        ) : undefined
      }
      socialProvidersNode={
        realm.password && social?.providers !== undefined && social.providers.length !== 0 ? (
          <div id="kc-social-providers">
            <p className="kc-divider">{msg("identity-provider-login-label")}</p>
            <ul className="kc-social-list">
              {social.providers.map((p) => (
                <li key={p.alias}>
                  <a id={`social-${p.alias}`} className="kc-social-button" href={p.loginUrl}>
                    {p.iconClasses && <i className={clsx(p.iconClasses)} aria-hidden="true"></i>}
                    <span dangerouslySetInnerHTML={{ __html: kcSanitize(p.displayName) }}></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : undefined
      }
    >
      {realm.password && (
        <form
          id="kc-form-login"
          className="kc-form"
          onSubmit={() => {
            setIsLoginButtonDisabled(true);
            return true;
          }}
          action={url.loginAction}
          method="post"
        >
          {!usernameHidden && (
            <div className="kc-field">
              <label htmlFor="username" className="kc-label">
                {!realm.loginWithEmailAllowed ? msg("username") : !realm.registrationEmailAsUsername ? msg("usernameOrEmail") : msg("email")}
              </label>
              <input
                id="username"
                className="kc-input"
                name="username"
                defaultValue={login.username ?? ""}
                type="text"
                autoFocus
                autoCapitalize="none"
                spellCheck={false}
                autoComplete={enableWebAuthnConditionalUI ? "username webauthn" : "username"}
                aria-invalid={hasFieldError}
              />
              {hasFieldError && (
                <span className="kc-field-error" id="input-error" aria-live="polite">
                  <WarningCircle size={16} weight="fill" aria-hidden />
                  <span dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.getFirstError("username", "password")) }} />
                </span>
              )}
            </div>
          )}

          <div className="kc-field">
            <label htmlFor="password" className="kc-label">
              {msg("password")}
            </label>
            <PasswordField i18n={i18n} hasError={!!usernameHidden && hasFieldError} />
            {usernameHidden && hasFieldError && (
              <span className="kc-field-error" id="input-error" aria-live="polite">
                <WarningCircle size={16} weight="fill" aria-hidden />
                <span dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.getFirstError("username", "password")) }} />
              </span>
            )}
          </div>

          <div className="kc-options-row">
            {realm.rememberMe && !usernameHidden && (
              <label className="kc-checkbox">
                <input id="rememberMe" name="rememberMe" type="checkbox" defaultChecked={!!login.rememberMe} />
                {msg("rememberMe")}
              </label>
            )}
            {realm.resetPasswordAllowed && (
              <a className="kc-link" href={url.loginResetCredentialsUrl}>
                {msg("doForgotPassword")}
              </a>
            )}
          </div>

          <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
          <button disabled={isLoginButtonDisabled} className="kc-button-primary" name="login" id="kc-login" type="submit">
            {isLoginButtonDisabled && <span className="kc-spinner" aria-hidden />}
            {isLoginButtonDisabled ? msgStr("doLogIn") + "…" : msgStr("doLogIn")}
          </button>
        </form>
      )}

      {enableWebAuthnConditionalUI && (
        <>
          <form id="webauth" action={url.loginAction} method="post">
            <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
            <input type="hidden" id="authenticatorData" name="authenticatorData" />
            <input type="hidden" id="signature" name="signature" />
            <input type="hidden" id="credentialId" name="credentialId" />
            <input type="hidden" id="userHandle" name="userHandle" />
            <input type="hidden" id="error" name="error" />
          </form>

          {authenticators !== undefined && authenticators.authenticators.length !== 0 && (
            <form id="authn_select">
              {authenticators.authenticators.map((authenticator, i) => (
                <input key={i} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
              ))}
            </form>
          )}

          <button id={webAuthnButtonId} type="button" className="kc-button-primary">
            {msgStr("passkey-doAuthenticate")}
          </button>
        </>
      )}
    </Template>
  );
}

function PasswordField(props: { i18n: I18n; hasError: boolean }) {
  const { i18n, hasError } = props;
  const { msgStr } = i18n;
  const passwordInputId = "password";

  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

  return (
    <div className="kc-input-group">
      <input
        id={passwordInputId}
        className="kc-input"
        name="password"
        type="password"
        autoComplete="current-password"
        aria-invalid={hasError}
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
