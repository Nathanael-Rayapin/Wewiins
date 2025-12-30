import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "./Template";
import "../main.css";

const UserProfileFormFields = lazy(
    () => import("./UserProfileFormFields")
);
const Register = lazy(
    () => import("./pages/Register/Register")
);
const LoginVerifyEmail = lazy(
    () => import("./pages/LoginVerifyEmail/LoginVerifyEmail")
);
const Error = lazy(
    () => import("./pages/Error/Error")
);
const LoginUsername = lazy(
    () => import("./pages/LoginUsername/LoginUsername")
);
const LoginOtp = lazy(
    () => import("./pages/LoginOTP/LoginOtp")
);

const doMakeUserConfirmPassword = false;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "register.ftl": return (
                        <Register
                            {...{ kcContext, i18n, classes }}
                            Template={Template}
                            doUseDefaultCss={false}
                            UserProfileFormFields={UserProfileFormFields}
                            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                        />
                    );
                    case "login-verify-email.ftl": return (
                        <LoginVerifyEmail
                            {...{ kcContext, i18n, classes }}
                            Template={Template}
                            doUseDefaultCss={false}
                        />
                    );
                    case "login-otp.ftl": return (
                        <LoginOtp
                            {...{ kcContext, i18n, classes }}
                            Template={Template}
                            doUseDefaultCss={false}
                        />
                    );
                    case "login-username.ftl": return (
                        <LoginUsername
                            {...{ kcContext, i18n, classes }}
                            Template={Template}
                            doUseDefaultCss={false}
                        />
                    );
                    case "error.ftl": return (
                        <Error
                            {...{ kcContext, i18n, classes }}
                            Template={Template}
                            doUseDefaultCss={true}
                        />
                    );
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
