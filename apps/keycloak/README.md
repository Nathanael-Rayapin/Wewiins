# Keycloak – Custom Authentication & SPI

This project contains the **Keycloak** configuration for SaaS as well as **custom SPI (Service Provider Interfaces)** that allow you to extend or override Keycloak's standard behavior.

Keycloak is used as a **centralized authentication server** for:
- user management
- roles and permissions
- authentication flows
- tokens (OIDC / OAuth2)
- integration with SaaS applications

## 🔐 What is Keycloak?

**Keycloak** is an open-source **Identity and Access Management (IAM)** solution.

It allows you to:
- manage authentication (login, logout, MFA, OTP, etc.)
- centralize users and their roles
- secure applications via **OpenID Connect** and **OAuth2**
- customize user journeys via **flows**
- extend its behavior via **SPIs**

In this project, Keycloak acts as the **source of authority** for the identity of SaaS users.


## 🧩 SPI (Service Provider Interface)

### What are SPIs used for?

**SPIs** allow you to:
- modify existing Keycloak behavior
- add specific business rules
- customize authentication flows
- manage advanced user actions (custom OTP, custom email, etc.)

👉 In most cases, **SPIs already exist** and we simply **override** them.

---

### SPI structure

Translated with DeepL.com (free version)

Custom SPIs must be developed in the folder: /spi


To create an SPI, you need **at least**:

1. **An interface/implementation**
   - contains the business logic
2. **A factory**
   - allows Keycloak to instantiate and register the SPI

> ⚠️ Without a factory, Keycloak will not detect the SPI.


## 🏗️ Building an SPI

Once the SPI has been developed:

1. Compile the SPI project
This generates a file: .name-of-the-spi.jar



2. Copy the generated `.jar` to the Keycloak folder: /providers


## 🔄 Integrating the SPI into Keycloak

After placing the `.jar` in `/providers`, it is **mandatory** to run the Keycloak build command:

## 🔄 Integrating the SPI into Keycloak

After placing the `.jar` file in the `/providers` folder, you **must** run the build command so that Keycloak integrates the SPI.

### On Linux/Mac

```bash
bin/kc.sh build
```

### On Windows

```bash
bin\kc.bat build
```

These steps allow Keycloak to:

- detect the new SPI
- register it
- make it available in the realm

## ▶️ Starting Keycloak

Once the build is complete:

1. Start Keycloak
2. Log in to the administration console
3. Select the relevant realm
4. Configure:
   - authentication flows
   - required actions
   - or any other configuration related to the SPI