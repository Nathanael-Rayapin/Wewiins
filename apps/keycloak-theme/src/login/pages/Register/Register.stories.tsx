import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory } from "../../KcPageStory";
import type { Attribute } from "keycloakify/login";

const { KcPageStory } = createKcPageStory({ pageId: "register.ftl" });

const meta = {
    title: "login/register.ftl",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                },
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: ""
                        },
                        firstName: {
                            value: ""
                        },
                        email: {
                            value: ""
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "",
                            annotations: {
                                inputType: "text"
                            }
                        },
                    }
                },
                passwordRequired: false,
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

export const WithEmailAlreadyExists: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                },
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        },
                    }
                },
                passwordRequired: false,
                messagesPerField: {
                    // NOTE: The other functions of messagesPerField are derived from get() and
                    // existsError() so they are the only ones that need to mock.
                    existsError: (fieldName: string, ...otherFieldNames: string[]) => [fieldName, ...otherFieldNames].includes("email"),
                    get: (fieldName: string) => (fieldName === "email" ? "L'adresse e-mail existe déjà." : undefined)
                },
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

export const WithRestrictedToMITStudents: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            validators: {
                                pattern: {
                                    pattern: "^[^@]+@([^.]+\\.)*((mit\\.edu)|(berkeley\\.edu))$",
                                    "error-message": "${profile.attributes.email.pattern.error}"
                                }
                            },
                            annotations: {
                                inputHelperTextBefore: "${profile.attributes.email.inputHelperTextBefore}"
                            }
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                },
                "x-keycloakify": {
                    messages: {
                        "profile.attributes.email.inputHelperTextBefore": "Veuillez utiliser votre adresse e-mail MIT ou Berkeley.",
                        "profile.attributes.email.pattern.error":
                            "Ceci n'est pas un e-mail du MIT  (<strong>@mit.edu</strong>) ni de Berkeley (<strong>@berkeley.edu</strong>)"
                    }
                },
                locale: {
                    currentLanguageTag: "fr"
                }
            }}
        />
    )
};

export const WithNewsletter: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        newsletter: {
                            name: "newsletter",
                            displayName: "Sign up to the newsletter",
                            validators: {
                                options: {
                                    options: ["yes"]
                                }
                            },
                            annotations: {
                                inputOptionLabels: {
                                    yes: "I want my email inbox filled with spam"
                                },
                                inputType: "multiselect-checkboxes"
                            },
                            required: false,
                            readOnly: false
                        } satisfies Attribute
                    }
                }
            }}
        />
    )
};

export const WithEmailAsUsername: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                }
            }}
        />
    )
};

export const WithRecaptcha: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                scripts: ["https://www.google.com/recaptcha/api.js?hl=en"],
                recaptchaRequired: true,
                recaptchaSiteKey: "6LfQHvApAAAAAE73SYTd5vS0lB1Xr7zdiQ-6iBVa",
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                }
            }}
        />
    )
};

export const WithRecaptchaFrench: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                locale: {
                    currentLanguageTag: "fr"
                },
                scripts: ["https://www.google.com/recaptcha/api.js?hl=fr"],
                recaptchaRequired: true,
                recaptchaSiteKey: "6LfQHvApAAAAAE73SYTd5vS0lB1Xr7zdiQ-6iBVa",
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                }
            }}
        />
    )
};

export const WithTermsAcceptance: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                termsAcceptanceRequired: true,
                "x-keycloakify": {
                    messages: {
                        termsText: "<a href='https://example.com/terms'>Service Terms of Use</a>"
                    }
                },
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                }
            }}
        />
    )
};

export const WithTermsNotAccepted: Story = {
    render: args => (
        <KcPageStory
            {...args}
            kcContext={{
                termsAcceptanceRequired: true,
                messagesPerField: {
                    existsError: (fieldName: string) => fieldName === "termsAccepted",
                    get: (fieldName: string) => (fieldName === "termsAccepted" ? "You must accept the terms." : undefined)
                },
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "john.doe@gmail.com"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                }
            }}
        />
    )
};
export const WithFieldErrors: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe"
                        },
                        firstName: {
                            value: "John"
                        },
                        email: {
                            value: "invalid-email"
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: false,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                },
                messagesPerField: {
                    existsError: (fieldName: string) => ["username", "email"].includes(fieldName),
                    get: (fieldName: string) => {
                        if (fieldName === "username") return "Username is required.";
                        if (fieldName === "email") return "Invalid email format.";
                    }
                }
            }}
        />
    )
};
export const WithReadOnlyFields: Story = {
    render: () => (
        <KcPageStory
            kcContext={{
                realm: {
                    registrationEmailAsUsername: true
                },
                passwordRequired: false,
                profile: {
                    attributesByName: {
                        username: undefined,
                        lastName: {
                            value: "Doe",
                            readOnly: true
                        },
                        firstName: {
                            value: "John",
                            readOnly: true
                        },
                        email: {
                            value: "john.doe@gmail.com",
                            readOnly: true
                        },
                        companyName: {
                            name: "companyName",
                            displayName: "Nom de l'entreprise",
                            required: true,
                            readOnly: true,
                            validators: {},
                            value: "Atelier Doe",
                            annotations: {
                                inputType: "text"
                            }
                        },
                        phoneNumber: {
                            name: "phoneNumber",
                            displayName: "Numéro de téléphone",
                            required: true,
                            readOnly: true,
                            validators: {},
                            value: "0612345678",
                            annotations: {
                                inputType: "text"
                            }
                        }
                    }
                }
            }}
        />
    )
};
