import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../../KcContext";
import type { I18n } from "../../i18n";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import OtpInput from 'react-otp-input';

import "./LoginVerifyEmail.css";
import logo from "../../../../assets/images/logo_with_text.svg";
import { useEffect, useState } from "react";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;

    const { url, user, otpInputDefaultValue } = kcContext;

    const initialRemainingTime = kcContext.otpRemainingTime ?? 600;

    const [remainingTime, setRemainingTime] = useState(initialRemainingTime);
    const [otp, setOtp] = useState(otpInputDefaultValue ?? '');

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    useEffect(() => {
        if (remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo
            headerNode={undefined}
        >
            <div className="flex flex-row min-h-screen">
                <div className="w-full lg:w-1/2 px-8 lg:px-0">

                    <div className="verification-code">
                        <h1 className="verification-title font-bold text-black text-center">
                            {msg("emailVerifyTitle")}
                        </h1>
                        <p className="instruction1">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>

                        <form action={url.loginAction} method="post">
                            <input type="hidden" name="otp_code" value={otp} />
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={6}
                                renderInput={(props) => <input {...props} />}
                                inputType="text"
                                inputStyle={{
                                    width: '60px',
                                    height: '60px',
                                    border: `1px solid ${kcContext.message?.type === "error" ? "#ff5963" : "#cccccc"}`,
                                    borderRadius: '12px',
                                    fontSize: '20px'
                                }}
                                containerStyle={{
                                    justifyContent: 'space-evenly',
                                    margin: '20px 0 20px 0'
                                }}
                            />

                            {remainingTime > 0 ? (
                                <p>Temps restant : {formatTime(remainingTime)}</p>
                            ) : (
                                <p className="text-red-600">Code expiré</p>
                            )}

                            <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                                <button
                                    disabled={remainingTime <= 0 || otp.length !== 6}
                                    className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                                    type="submit"
                                >
                                    {msg("emailVerifyCTA")}
                                </button>
                            </div>
                        </form>

                        <p className="instruction2">
                            {msg("emailVerifyInstruction2")}
                            <br />
                            <a href={url.loginAction}>{msg("doClickHere")}</a>
                            &nbsp;
                            {msg("emailVerifyInstruction3")}
                        </p>
                    </div>

                </div>
                <div className="wewiins-bg w-1/2 hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
                    <img src={logo} alt="WeWiins Logo" />
                </div>
            </div>
        </Template>
    );
}
