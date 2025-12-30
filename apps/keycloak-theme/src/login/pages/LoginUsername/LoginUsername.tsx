import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../../KcContext";
import type { I18n } from "../../i18n";
import { useScript } from "keycloakify/login/pages/LoginUsername.useScript";

import "./LoginUsername.css";
import logo from "../../../../assets/images/logo_with_text.svg";
import emailIcon from "../../../../assets/icons/email.svg";

export default function LoginUsername(props: PageProps<Extract<KcContext, { pageId: "login-username.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, registrationDisabled, messagesPerField, enableWebAuthnConditionalUI, authenticators } =
        kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const [username, setUsername] = useState("");

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({
        webAuthnButtonId,
        kcContext,
        i18n
    });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            headerNode={undefined}
            socialProvidersNode={
                <>
                    {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                        <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>
                            <hr />
                            <h2>{msg("identity-provider-login-label")}</h2>
                            <ul className={kcClsx("kcFormSocialAccountListClass", social.providers.length > 3 && "kcFormSocialAccountListGridClass")}>
                                {social.providers.map((...[p, , providers]) => (
                                    <li key={p.alias}>
                                        <a
                                            id={`social-${p.alias}`}
                                            className={kcClsx(
                                                "kcFormSocialAccountListButtonClass",
                                                providers.length > 3 && "kcFormSocialAccountGridItem"
                                            )}
                                            type="button"
                                            href={p.loginUrl}
                                        >
                                            {p.iconClasses && <i className={clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses)} aria-hidden="true"></i>}
                                            <span className={clsx(kcClsx("kcFormSocialAccountNameClass"), p.iconClasses && "kc-social-icon-text")}>
                                                {p.displayName}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            }
        >

            <div className="flex flex-row min-h-screen">
                <div className="w-full lg:w-1/2 px-8 lg:px-0">
                    <div id="kc-form">
                        <div id="kc-form-wrapper">
                            {realm.password && (
                                <form
                                    id="kc-form-login"
                                    onSubmit={() => {
                                        setIsLoginButtonDisabled(true);
                                        return true;
                                    }}
                                    className={kcClsx("kcFormClass")}
                                    action={url.loginAction}
                                    method="post"
                                >
                                    <h1 className="login-title font-bold text-black text-center">
                                        {msg("loginTitle")}
                                    </h1>
                                    {!usernameHidden && (
                                        <div className={`${kcClsx("kcFormGroupClass")} flex flex-col gap-2`}>
                                            <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                                                {!realm.loginWithEmailAllowed
                                                    ? msg("username")
                                                    : !realm.registrationEmailAsUsername
                                                        ? msg("email")
                                                        : msg("email")}
                                            </label>
                                            <div className="icon-wrapper">
                                                <input
                                                    tabIndex={2}
                                                    id="username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value.trim())}
                                                    className={kcClsx("kcInputClass")}
                                                    name="username"
                                                    defaultValue={login.username ?? ""}
                                                    type="text"
                                                    placeholder="john.doe@example.com"
                                                    autoFocus
                                                    autoComplete="username"
                                                    aria-invalid={messagesPerField.existsError("username")}
                                                />
                                                <img src={emailIcon} alt="Icon" />
                                            </div>
                                            {messagesPerField.existsError("username") && (
                                                <span id="input-error" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                                    {messagesPerField.getFirstError("username")}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className={kcClsx("kcFormGroupClass", "kcFormSettingClass")}>
                                        <div id="kc-form-options">
                                            {realm.rememberMe && !usernameHidden && (
                                                <div className="checkbox">
                                                    <label>
                                                        <input
                                                            tabIndex={3}
                                                            id="rememberMe"
                                                            name="rememberMe"
                                                            type="checkbox"
                                                            defaultChecked={!!login.rememberMe}
                                                        />{" "}
                                                        {msg("rememberMe")}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                                        <input
                                            tabIndex={4}
                                            disabled={isLoginButtonDisabled || username.length === 0}
                                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                                            name="login"
                                            id="kc-login"
                                            type="submit"
                                            value={msgStr("doLogIn")}
                                        />
                                    </div>

                                    <div id="kc-registration">
                                        <span>
                                            {msg("noAccount")}
                                            <a tabIndex={6} href={url.registrationUrl}>
                                                {msg("createAccount")}
                                            </a>
                                        </span>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
                <div className="wewiins-bg w-1/2 hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
                    <img src={logo} alt="WeWiins Logo" />
                </div>
            </div>
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
                        <>
                            <form id="authn_select" className={kcClsx("kcFormClass")}>
                                {authenticators.authenticators.map((authenticator, i) => (
                                    <input key={i} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
                                ))}
                            </form>
                        </>
                    )}
                    <br />

                    <input
                        id={webAuthnButtonId}
                        type="button"
                        className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                        value={msgStr("passkey-doAuthenticate")}
                    />
                </>
            )}
        </Template>
    );
}
