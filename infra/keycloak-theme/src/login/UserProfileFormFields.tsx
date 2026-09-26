import { useEffect, Fragment } from "react";
import { assert } from "keycloakify/tools/assert";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { Check, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { useUserProfileForm, getButtonToDisplayForMultivaluedAttributeField, type FormAction, type FormFieldError } from "keycloakify/login/lib/useUserProfileForm";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { Attribute } from "keycloakify/login/KcContext";
import type { KcContext } from "./KcContext";
import type { I18n } from "./i18n";

export default function UserProfileFormFields(props: UserProfileFormFieldsProps<KcContext, I18n>) {
  const { kcContext, i18n, onIsFormSubmittableValueChange, doMakeUserConfirmPassword, BeforeField, AfterField } = props;

  const { advancedMsg } = i18n;

  const {
    formState: { formFieldStates, isFormSubmittable },
    dispatchFormAction,
  } = useUserProfileForm({
    kcContext,
    i18n,
    doMakeUserConfirmPassword,
  });

  useEffect(() => {
    onIsFormSubmittableValueChange(isFormSubmittable);
  }, [isFormSubmittable]);

  const groupNameRef = { current: "" };

  return (
    <>
      {formFieldStates.map(({ attribute, displayableErrors, valueOrValues }) => (
        <Fragment key={attribute.name}>
          <GroupLabel attribute={attribute} groupNameRef={groupNameRef} i18n={i18n} />
          {BeforeField !== undefined && (
            <BeforeField
              attribute={attribute}
              dispatchFormAction={dispatchFormAction}
              displayableErrors={displayableErrors}
              valueOrValues={valueOrValues}
              kcClsx={() => ""}
              i18n={i18n}
            />
          )}
          <div
            className="kc-field"
            style={{
              display: attribute.annotations.inputType === "hidden" || (attribute.name === "password-confirm" && !doMakeUserConfirmPassword) ? "none" : undefined,
            }}
          >
            <label htmlFor={attribute.name} className="kc-label">
              {advancedMsg(attribute.displayName ?? "")}
              {attribute.required && " *"}
            </label>
            {attribute.annotations.inputHelperTextBefore !== undefined && (
              <p className="kc-helper-text" id={`form-help-text-before-${attribute.name}`} aria-live="polite">
                {advancedMsg(attribute.annotations.inputHelperTextBefore)}
              </p>
            )}
            <InputFieldByType attribute={attribute} valueOrValues={valueOrValues} displayableErrors={displayableErrors} dispatchFormAction={dispatchFormAction} i18n={i18n} />
            <FieldErrors attribute={attribute} displayableErrors={displayableErrors} fieldIndex={undefined} />
            {attribute.annotations.inputHelperTextAfter !== undefined && (
              <p className="kc-helper-text" id={`form-help-text-after-${attribute.name}`} aria-live="polite">
                {advancedMsg(attribute.annotations.inputHelperTextAfter)}
              </p>
            )}
            {AfterField !== undefined && (
              <AfterField
                attribute={attribute}
                dispatchFormAction={dispatchFormAction}
                displayableErrors={displayableErrors}
                valueOrValues={valueOrValues}
                kcClsx={() => ""}
                i18n={i18n}
              />
            )}
            {/* NOTE: Downloading of html5DataAnnotations scripts is done in the useUserProfileForm hook */}
          </div>
        </Fragment>
      ))}
    </>
  );
}

function GroupLabel(props: { attribute: Attribute; groupNameRef: { current: string }; i18n: I18n }) {
  const { attribute, groupNameRef, i18n } = props;

  const { advancedMsg } = i18n;

  if (attribute.group?.name !== groupNameRef.current) {
    groupNameRef.current = attribute.group?.name ?? "";

    if (groupNameRef.current !== "") {
      assert(attribute.group !== undefined);

      const groupDisplayHeader = attribute.group.displayHeader ?? "";
      const groupHeaderText = groupDisplayHeader !== "" ? advancedMsg(groupDisplayHeader) : attribute.group.name;

      const groupDisplayDescription = attribute.group.displayDescription ?? "";

      return (
        <div
          className="kc-group-header"
          {...Object.fromEntries(Object.entries(attribute.group.html5DataAnnotations).map(([key, value]) => [`data-${key}`, value]))}
        >
          <p className="kc-group-header-title" id={`header-${attribute.group.name}`}>
            {groupHeaderText}
          </p>
          {groupDisplayDescription !== "" && (
            <p className="kc-helper-text" id={`description-${attribute.group.name}`}>
              {advancedMsg(groupDisplayDescription)}
            </p>
          )}
        </div>
      );
    }
  }

  return null;
}

function FieldErrors(props: { attribute: Attribute; displayableErrors: FormFieldError[]; fieldIndex: number | undefined }) {
  const { attribute, fieldIndex } = props;

  const displayableErrors = props.displayableErrors.filter((error) => error.fieldIndex === fieldIndex);

  if (displayableErrors.length === 0) {
    return null;
  }

  return (
    <span className="kc-field-error" id={`input-error-${attribute.name}${fieldIndex === undefined ? "" : `-${fieldIndex}`}`} aria-live="polite">
      <WarningCircle size={16} weight="fill" aria-hidden />
      <span>
        {displayableErrors.map(({ errorMessage }, i, arr) => (
          <Fragment key={i}>
            {errorMessage}
            {arr.length - 1 !== i && <br />}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

type InputFieldByTypeProps = {
  attribute: Attribute;
  valueOrValues: string | string[];
  displayableErrors: FormFieldError[];
  dispatchFormAction: React.Dispatch<FormAction>;
  i18n: I18n;
};

function InputFieldByType(props: InputFieldByTypeProps) {
  const { attribute, valueOrValues } = props;

  switch (attribute.annotations.inputType) {
    // NOTE: Unfortunately, keycloak won't let you define input type="hidden" in the Admin Console.
    // sometimes in the future it might.
    case "hidden":
      return <input type="hidden" name={attribute.name} value={valueOrValues} />;
    case "textarea":
      return <TextareaTag {...props} />;
    case "select":
    case "multiselect":
      return <SelectTag {...props} />;
    case "select-radiobuttons":
    case "multiselect-checkboxes":
      return <InputTagSelects {...props} />;
    default: {
      if (valueOrValues instanceof Array) {
        return (
          <>
            {valueOrValues.map((...[, i]) => (
              <InputTag key={i} {...props} fieldIndex={i} />
            ))}
          </>
        );
      }

      const inputNode = <InputTag {...props} fieldIndex={undefined} />;

      if (attribute.name === "password" || attribute.name === "password-confirm") {
        return (
          <PasswordWrapper i18n={props.i18n} passwordInputId={attribute.name}>
            {inputNode}
          </PasswordWrapper>
        );
      }

      return inputNode;
    }
  }
}

function PasswordWrapper(props: { i18n: I18n; passwordInputId: string; children: React.ReactNode }) {
  const { i18n, passwordInputId, children } = props;

  const { msgStr } = i18n;

  const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

  return (
    <div className="kc-input-group">
      {children}
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

function InputTag(props: InputFieldByTypeProps & { fieldIndex: number | undefined }) {
  const { attribute, fieldIndex, dispatchFormAction, valueOrValues, i18n, displayableErrors } = props;

  const { advancedMsgStr } = i18n;

  return (
    <>
      <input
        type={(() => {
          const { inputType } = attribute.annotations;

          if (inputType?.startsWith("html5-")) {
            return inputType.slice(6);
          }

          return inputType ?? "text";
        })()}
        id={attribute.name}
        name={attribute.name}
        value={(() => {
          if (fieldIndex !== undefined) {
            assert(valueOrValues instanceof Array);
            return valueOrValues[fieldIndex];
          }

          assert(typeof valueOrValues === "string");

          return valueOrValues;
        })()}
        className="kc-input"
        aria-invalid={displayableErrors.find((error) => error.fieldIndex === fieldIndex) !== undefined}
        disabled={attribute.readOnly}
        autoComplete={attribute.autocomplete}
        placeholder={attribute.annotations.inputTypePlaceholder === undefined ? undefined : advancedMsgStr(attribute.annotations.inputTypePlaceholder)}
        pattern={attribute.annotations.inputTypePattern}
        size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`)}
        maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)}
        minLength={attribute.annotations.inputTypeMinlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMinlength}`)}
        max={attribute.annotations.inputTypeMax}
        min={attribute.annotations.inputTypeMin}
        step={attribute.annotations.inputTypeStep}
        {...Object.fromEntries(Object.entries(attribute.html5DataAnnotations ?? {}).map(([key, value]) => [`data-${key}`, value]))}
        onChange={(event) =>
          dispatchFormAction({
            action: "update",
            name: attribute.name,
            valueOrValues: (() => {
              if (fieldIndex !== undefined) {
                assert(valueOrValues instanceof Array);

                return valueOrValues.map((value, i) => (i === fieldIndex ? event.target.value : value));
              }

              return event.target.value;
            })(),
          })
        }
        onBlur={() =>
          dispatchFormAction({
            action: "focus lost",
            name: attribute.name,
            fieldIndex: fieldIndex,
          })
        }
      />
      {(() => {
        if (fieldIndex === undefined) {
          return null;
        }

        assert(valueOrValues instanceof Array);

        return (
          <>
            <FieldErrors attribute={attribute} displayableErrors={displayableErrors} fieldIndex={fieldIndex} />
            <AddRemoveButtonsMultiValuedAttribute attribute={attribute} values={valueOrValues} fieldIndex={fieldIndex} dispatchFormAction={dispatchFormAction} i18n={i18n} />
          </>
        );
      })()}
    </>
  );
}

function AddRemoveButtonsMultiValuedAttribute(props: {
  attribute: Attribute;
  values: string[];
  fieldIndex: number;
  dispatchFormAction: React.Dispatch<Extract<FormAction, { action: "update" }>>;
  i18n: I18n;
}) {
  const { attribute, values, fieldIndex, dispatchFormAction, i18n } = props;

  const { msg } = i18n;

  const { hasAdd, hasRemove } = getButtonToDisplayForMultivaluedAttributeField({ attribute, values, fieldIndex });

  const idPostfix = `-${attribute.name}-${fieldIndex + 1}`;

  return (
    <div className="kc-multivalue-actions">
      {hasRemove && (
        <button
          id={`kc-remove${idPostfix}`}
          type="button"
          className="kc-link"
          onClick={() =>
            dispatchFormAction({
              action: "update",
              name: attribute.name,
              valueOrValues: values.filter((_, i) => i !== fieldIndex),
            })
          }
        >
          {msg("remove")}
        </button>
      )}
      {hasAdd && (
        <button
          id={`kc-add${idPostfix}`}
          type="button"
          className="kc-link"
          onClick={() =>
            dispatchFormAction({
              action: "update",
              name: attribute.name,
              valueOrValues: [...values, ""],
            })
          }
        >
          {msg("addValue")}
        </button>
      )}
    </div>
  );
}

function InputTagSelects(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, i18n, valueOrValues } = props;

  const inputType = (() => {
    assert(attribute.annotations.inputType === "select-radiobuttons" || attribute.annotations.inputType === "multiselect-checkboxes");
    return attribute.annotations.inputType === "select-radiobuttons" ? ("radio" as const) : ("checkbox" as const);
  })();

  const options = (() => {
    walk: {
      const { inputOptionsFromValidation } = attribute.annotations;

      if (inputOptionsFromValidation === undefined) {
        break walk;
      }

      const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

      if (validator?.options === undefined) {
        break walk;
      }

      return validator.options;
    }

    return attribute.validators.options?.options ?? [];
  })();

  return (
    <div className="kc-option-list">
      {options.map((option) => (
        <label key={option} className={inputType === "radio" ? "kc-radio-option" : "kc-checkbox"}>
          <span className={inputType === "radio" ? "kc-radio-box" : "kc-checkbox-box"}>
            <input
              type={inputType}
              id={`${attribute.name}-${option}`}
              name={attribute.name}
              value={option}
              className={inputType === "radio" ? "kc-radio-input" : "kc-checkbox-input"}
              aria-invalid={props.displayableErrors.length !== 0}
              disabled={attribute.readOnly}
              checked={valueOrValues instanceof Array ? valueOrValues.includes(option) : valueOrValues === option}
              onChange={(event) =>
                dispatchFormAction({
                  action: "update",
                  name: attribute.name,
                  valueOrValues: (() => {
                    const isChecked = event.target.checked;

                    if (valueOrValues instanceof Array) {
                      const newValues = [...valueOrValues];

                      if (isChecked) {
                        newValues.push(option);
                      } else {
                        newValues.splice(newValues.indexOf(option), 1);
                      }

                      return newValues;
                    }

                    return isChecked ? option : "";
                  })(),
                })
              }
              onBlur={() =>
                dispatchFormAction({
                  action: "focus lost",
                  name: attribute.name,
                  fieldIndex: undefined,
                })
              }
            />
            {inputType === "checkbox" && <Check size={12} weight="bold" className="kc-checkbox-check" aria-hidden />}
          </span>
          {inputLabel(i18n, attribute, option)}
        </label>
      ))}
    </div>
  );
}

function TextareaTag(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, displayableErrors, valueOrValues } = props;

  assert(typeof valueOrValues === "string");

  return (
    <textarea
      id={attribute.name}
      name={attribute.name}
      className="kc-input kc-textarea"
      aria-invalid={displayableErrors.length !== 0}
      disabled={attribute.readOnly}
      cols={attribute.annotations.inputTypeCols === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeCols}`)}
      rows={attribute.annotations.inputTypeRows === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeRows}`)}
      maxLength={attribute.annotations.inputTypeMaxlength === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeMaxlength}`)}
      value={valueOrValues}
      onChange={(event) =>
        dispatchFormAction({
          action: "update",
          name: attribute.name,
          valueOrValues: event.target.value,
        })
      }
      onBlur={() =>
        dispatchFormAction({
          action: "focus lost",
          name: attribute.name,
          fieldIndex: undefined,
        })
      }
    />
  );
}

function SelectTag(props: InputFieldByTypeProps) {
  const { attribute, dispatchFormAction, displayableErrors, i18n, valueOrValues } = props;

  const isMultiple = attribute.annotations.inputType === "multiselect";

  return (
    <select
      id={attribute.name}
      name={attribute.name}
      className="kc-input kc-select"
      aria-invalid={displayableErrors.length !== 0}
      disabled={attribute.readOnly}
      multiple={isMultiple}
      size={attribute.annotations.inputTypeSize === undefined ? undefined : parseInt(`${attribute.annotations.inputTypeSize}`)}
      value={valueOrValues}
      onChange={(event) =>
        dispatchFormAction({
          action: "update",
          name: attribute.name,
          valueOrValues: isMultiple ? Array.from(event.target.selectedOptions).map((option) => option.value) : event.target.value,
        })
      }
      onBlur={() =>
        dispatchFormAction({
          action: "focus lost",
          name: attribute.name,
          fieldIndex: undefined,
        })
      }
    >
      {!isMultiple && <option value=""></option>}
      {(() => {
        const options = (() => {
          walk: {
            const { inputOptionsFromValidation } = attribute.annotations;

            if (inputOptionsFromValidation === undefined) {
              break walk;
            }

            assert(typeof inputOptionsFromValidation === "string");

            const validator = (attribute.validators as Record<string, { options?: string[] }>)[inputOptionsFromValidation];

            if (validator?.options === undefined) {
              break walk;
            }

            return validator.options;
          }

          return attribute.validators.options?.options ?? [];
        })();

        return options.map((option) => (
          <option key={option} value={option}>
            {inputLabel(i18n, attribute, option)}
          </option>
        ));
      })()}
    </select>
  );
}

function inputLabel(i18n: I18n, attribute: Attribute, option: string) {
  const { advancedMsg } = i18n;

  if (attribute.annotations.inputOptionLabels !== undefined) {
    const { inputOptionLabels } = attribute.annotations;

    return advancedMsg(inputOptionLabels[option] ?? option);
  }

  if (attribute.annotations.inputOptionLabelsI18nPrefix !== undefined) {
    return advancedMsg(`${attribute.annotations.inputOptionLabelsI18nPrefix}.${option}`);
  }

  return option;
}
