import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginPageExpired(props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { url } = kcContext;

  const { msg } = i18n;

  return (
    <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("pageExpiredTitle")}>
      <div className="kc-info">
        <p>
          {msg("pageExpiredMsg1")}{" "}
          <a id="loginRestartLink" className="kc-link" href={url.loginRestartFlowUrl}>
            {msg("doClickHere")}
          </a>
          .
        </p>
        <p>
          {msg("pageExpiredMsg2")}{" "}
          <a id="loginContinueLink" className="kc-link" href={url.loginAction}>
            {msg("doClickHere")}
          </a>
          .
        </p>
      </div>
    </Template>
  );
}
