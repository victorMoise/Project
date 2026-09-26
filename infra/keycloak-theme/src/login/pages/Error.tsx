import type { PageProps } from "keycloakify/login/pages/PageProps";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

  const { message, client, skipLink } = kcContext;

  const { msg } = i18n;

  return (
    <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} displayMessage={false} headerNode={msg("errorTitle")}>
      <div className="kc-info">
        <p dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
        {!skipLink && !!client?.baseUrl && (
          <a id="backToApplication" className="kc-link" href={client.baseUrl}>
            {msg("backToApplication")}
          </a>
        )}
      </div>
    </Template>
  );
}
