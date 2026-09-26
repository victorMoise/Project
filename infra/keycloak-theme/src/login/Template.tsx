import { useEffect } from "react";
import { CheckCircle, Info, Warning, WarningCircle } from "@phosphor-icons/react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import "../theme/fonts.css";
import "./login.css";

const alertIcons = {
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  info: Info,
} as const;

export default function Template(props: TemplateProps<KcContext, I18n>) {
  const {
    displayMessage = true,
    headerNode,
    socialProvidersNode = null,
    infoNode = null,
    documentTitle,
    kcContext,
    i18n,
    doUseDefaultCss,
    children,
  } = props;

  const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

  const { realm, auth, url, message, isAppInitiatedAction } = kcContext;

  useEffect(() => {
    document.title = documentTitle ?? msgStr("loginTitle", realm.displayName || realm.name);
  }, []);

  const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

  if (!isReadyToRender) {
    return null;
  }

  const AlertIcon = message ? alertIcons[message.type] : undefined;

  return (
    <div className="kc-page">
      {enabledLanguages.length > 1 && (
        <div className="kc-locale">
          <select
            className="kc-locale-select"
            aria-label={msgStr("languages")}
            value={currentLanguage.languageTag}
            onChange={(event) => {
              const target = enabledLanguages.find((language) => language.languageTag === event.target.value);
              if (target) window.location.href = target.href;
            }}
          >
            {enabledLanguages.map(({ languageTag, label }) => (
              <option key={languageTag} value={languageTag}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      <main className="kc-main">
        <div className="kc-panel">
          <p className="kc-wordmark">{realm.displayName || realm.name}</p>

          {auth?.showUsername && !auth.showResetCredentials ? (
            <div className="kc-field">
              <span className="kc-label">{auth.attemptedUsername}</span>
              <a className="kc-link" href={url.loginRestartFlowUrl}>
                {msg("restartLoginTooltip")}
              </a>
            </div>
          ) : (
            <h1 className="kc-heading">{headerNode}</h1>
          )}

          {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && AlertIcon && (
            <div className={`kc-alert kc-alert-${message.type}`} role="alert">
              <AlertIcon size={22} weight="fill" className="kc-alert-icon" aria-hidden />
              <span dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
            </div>
          )}

          {children}

          {auth !== undefined && auth.showTryAnotherWayLink && (
            <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
              <input type="hidden" name="tryAnotherWay" value="on" />
              <a
                className="kc-link"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  document.forms["kc-select-try-another-way-form" as never].requestSubmit();
                }}
              >
                {msg("doTryAnotherWay")}
              </a>
            </form>
          )}

          {socialProvidersNode}

          {infoNode && <div className="kc-footer">{infoNode}</div>}
        </div>
      </main>
    </div>
  );
}
