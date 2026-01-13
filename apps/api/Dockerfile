FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /api

# Copier seulement pom.xml pour cache des dépendances
COPY pom.xml .

# Télécharger les dépendances (layer cachée si pom.xml ne change pas)
RUN mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Build l'application (skip tests pour accélérer)
RUN mvn clean package -DskipTests -B

# Stage final : image légère pour exécution
FROM eclipse-temurin:21-jre-alpine

WORKDIR /api

# Copier le JAR depuis le stage de build
COPY --from=build /api/target/*.jar app.jar

# Copier le .env.dev
COPY .env.dev .

EXPOSE 8080

# Lancer l'application via le JAR directement (plus rapide que Maven)
CMD ["java", "-jar", "app.jar", "--spring.profiles.active=dev"]