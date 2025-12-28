import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-verify-email.ftl" });

const meta = {
    title: "login/login-verify-email.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                user: {
                    email: "john.doe@gmail.com"
                },
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

/**
 * WithSuccessMessage:
 * - Purpose: Tests when the email verification is successful, and the user receives a confirmation message.
 * - Scenario: The component renders a success message instead of a warning or error.
 * - Key Aspect: Ensures the success message is displayed correctly when the email is successfully verified.
 */
export const WithSuccessMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "Votre adresse e-mail a été vérifiée avec succès.",
                    type: "success"
                },
                user: {
                    email: "john.doe@gmail.com"
                },
                url: {
                    loginAction: "/mock-login-action"
                },
                locale: {
                    currentLanguageTag: "fr"
                },
                otpInputDefaultValue: "123456"
            }}
        />
    )
};

/**
 * WithErrorMessage:
 * - Purpose: Tests when there is an error during the email verification process.
 * - Scenario: The component renders an error message indicating the email verification failed.
 * - Key Aspect: Ensures the error message is shown correctly when the verification process encounters an issue.
 */
export const WithErrorMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "Une erreur s'est produite lors de la vérification de votre adresse e-mail. Veuillez réessayer.",
                    type: "error"
                },
                user: {
                    email: "john.doe@gmail.com"
                },
                url: {
                    loginAction: "/mock-login-action"
                },
                locale: {
                    currentLanguageTag: "fr"
                },
                otpInputDefaultValue: "123456"
            }}
        />
    )
};

/**
 * WithInfoMessage:
 * - Purpose: Tests when the user is prompted to verify their email without any urgency.
 * - Scenario: The component renders with an informational message for email verification.
 * - Key Aspect: Ensures the informational message is displayed properly.
 */
export const WithInfoMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "Veuillez vérifier votre adresse e-mail pour continuer à utiliser nos services.",
                    type: "info"
                },
                user: {
                    email: "john.doe@gmail.com"
                },
                url: {
                    loginAction: "/mock-login-action"
                },
                locale: {
                    currentLanguageTag: "fr"
                },
            }}
        />
    )
};
