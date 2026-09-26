import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LogoutConfirm(props: PageProps<Extract<KcContext, { pageId: "logout-confirm.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { url, client, logoutConfirm } = kcContext;

  const { msg, msgStr } = i18n;

  return (
    <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("logoutConfirmTitle")}>
      <div className="kc-info">
        <p className="kc-intro-text">{msg("logoutConfirmHeader")}</p>
        <form className="kc-form" action={url.logoutConfirmAction} method="POST">
          <input type="hidden" name="session_code" value={logoutConfirm.code} />
          <button className="kc-button-primary" name="confirmLogout" id="kc-logout" type="submit">
            {msgStr("doLogout")}
          </button>
        </form>
        {!logoutConfirm.skipLink && client.baseUrl && (
          <a className="kc-link" href={client.baseUrl}>
            {msg("backToApplication")}
          </a>
        )}
      </div>
    </Template>
  );
}
