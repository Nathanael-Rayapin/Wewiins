import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "error.ftl" });

const meta = {
    title: "login/error.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => <KcPageStory kcContext={{locale: {currentLanguageTag: "fr"}}} />
};

export const WithAnotherMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { summary: "Avec un autre message d'erreur" },
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

export const WithHtmlErrorMessage: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: {
                    summary: "<strong>Erreur:</strong> Une erreur s'est produite.. <a href='https://example.com'>Retour</a>"
                },
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

export const WithSkipLink: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                message: { summary: "Une erreur s'est produite" },
                skipLink: true,
                client: {
                    baseUrl: "https://example.com"
                },
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};
