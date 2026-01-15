FROM maven:3.9.9-eclipse-temurin-21-alpine

WORKDIR /api

# Copier seulement pom.xml pour cache des dépendances
COPY pom.xml .

# Télécharger les dépendances (layer cachée si pom.xml ne change pas)
RUN mvn dependency:resolve dependency:resolve-plugins -B

# Copier le code source
COPY src ./src

# Copier le .env.dev
COPY .env.dev .

EXPOSE 8080

# Lancer l'application via Maven
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]