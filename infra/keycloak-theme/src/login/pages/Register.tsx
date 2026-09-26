import { useState, useLayoutEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { Check } from "@phosphor-icons/react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
  UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => React.JSX.Element>;
  doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

  const { messageHeader, url, messagesPerField, recaptchaRequired, recaptchaVisible, recaptchaSiteKey, recaptchaAction, termsAcceptanceRequired } = kcContext;

  const { msg, msgStr, advancedMsg } = i18n;

  const [isFormSubmittable, setIsFormSubmittable] = useState(false);
  const [areTermsAccepted, setAreTermsAccepted] = useState(false);

  useLayoutEffect(() => {
    (window as any)["onSubmitRecaptcha"] = () => {
      // @ts-expect-error
      document.getElementById("kc-register-form").requestSubmit();
    };

    return () => {
      delete (window as any)["onSubmitRecaptcha"];
    };
  }, []);

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      headerNode={messageHeader !== undefined ? advancedMsg(messageHeader) : msg("registerTitle")}
      displayMessage={messagesPerField.exists("global")}
    >
      <form id="kc-register-form" className="kc-form" action={url.registrationAction} method="post">
        <UserProfileFormFields
          kcContext={kcContext}
          i18n={i18n}
          kcClsx={() => ""}
          onIsFormSubmittableValueChange={setIsFormSubmittable}
          doMakeUserConfirmPassword={doMakeUserConfirmPassword}
        />
        {termsAcceptanceRequired && (
          <TermsAcceptance i18n={i18n} messagesPerField={messagesPerField} areTermsAccepted={areTermsAccepted} onAreTermsAcceptedValueChange={setAreTermsAccepted} />
        )}
        {recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined) && (
          <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} data-action={recaptchaAction}></div>
        )}

        {recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined ? (
          <button className="kc-button-primary g-recaptcha" data-sitekey={recaptchaSiteKey} data-callback="onSubmitRecaptcha" data-action={recaptchaAction} type="submit">
            {msg("doRegister")}
          </button>
        ) : (
          <input
            disabled={!isFormSubmittable || (termsAcceptanceRequired && !areTermsAccepted)}
            className="kc-button-primary"
            type="submit"
            value={msgStr("doRegister")}
          />
        )}

        <p className="kc-footer">
          <a className="kc-link" href={url.loginUrl}>
            {msg("backToLogin")}
          </a>
        </p>
      </form>
    </Template>
  );
}

function TermsAcceptance(props: {
  i18n: I18n;
  messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
  areTermsAccepted: boolean;
  onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
  const { i18n, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;

  const { msg } = i18n;

  return (
    <div className="kc-field">
      <div id="kc-registration-terms-text">
        {msg("termsTitle")}
        <p className="kc-helper-text">{msg("termsText")}</p>
      </div>
      <label className="kc-checkbox">
        <span className="kc-checkbox-box">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={areTermsAccepted}
            onChange={(e) => onAreTermsAcceptedValueChange(e.target.checked)}
            aria-invalid={messagesPerField.existsError("termsAccepted")}
            className="kc-checkbox-input"
          />
          <Check size={12} weight="bold" className="kc-checkbox-check" aria-hidden />
        </span>
        {msg("acceptTerms")}
      </label>
      {messagesPerField.existsError("termsAccepted") && (
        <span id="input-error-terms-accepted" className="kc-field-error" aria-live="polite" dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("termsAccepted")) }} />
      )}
    </div>
  );
}
