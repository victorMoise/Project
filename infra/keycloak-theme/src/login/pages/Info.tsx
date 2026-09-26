import type { PageProps } from "keycloakify/login/pages/PageProps";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Info(props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { advancedMsgStr, msg } = i18n;

  const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={false}
      headerNode={<span dangerouslySetInnerHTML={{ __html: kcSanitize(messageHeader ? advancedMsgStr(messageHeader) : message.summary) }} />}
    >
      <div className="kc-info">
        <p
          dangerouslySetInnerHTML={{
            __html: kcSanitize(
              (() => {
                let html = message.summary?.trim();

                if (requiredActions) {
                  html += " <b>";
                  html += requiredActions.map((requiredAction) => advancedMsgStr(`requiredAction.${requiredAction}`)).join(", ");
                  html += "</b>";
                }

                return html;
              })(),
            ),
          }}
        />
        {!skipLink &&
          (() => {
            if (pageRedirectUri) {
              return (
                <a className="kc-link" href={pageRedirectUri}>
                  {msg("backToApplication")}
                </a>
              );
            }
            if (actionUri) {
              return (
                <a className="kc-link" href={actionUri}>
                  {msg("proceedWithAction")}
                </a>
              );
            }
            if (client.baseUrl) {
              return (
                <a className="kc-link" href={client.baseUrl}>
                  {msg("backToApplication")}
                </a>
              );
            }
          })()}
      </div>
    </Template>
  );
}
