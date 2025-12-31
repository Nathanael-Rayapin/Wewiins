# Client – Angular Application (SaaS)

This project is an **Angular** application designed to build the **SaaS dashboard**.  
It handles authentication via **Keycloak** depending on the environment (development, staging, production) and consumes user and realm information to drive the application interface.

The project was generated with **Angular CLI v21.0.3**.

## 🧭 Project Objective

The main objective of this Angular application is to:

- Build the **SaaS dashboard**
- Manage the profile via **Keycloak**
- Retrieve information:
  - from the **realm**
  - from the **user profile** (email, name, etc.)

## 🔐 Keycloak Authentication

### Initialization

Authentication is initialized **at application startup** via an `APP_INITIALIZER` in the file: `src/app/app.config.ts`

For the environments:
- **development**
- **staging** (to be created)
- **production**

Keycloak is initialized with the option:

```ts
onLoad: 'login-required'
```