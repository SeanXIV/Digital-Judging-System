# Backend Deployment Guide

This guide explains how to build and deploy the Spring Boot backend for the Digital Judging System using a JAR file and a hosted PostgreSQL database.

## Prerequisites

- Java 21
- Maven
- PostgreSQL (for local development)
- A hosted PostgreSQL service (e.g., Render, Railway, Neon, Supabase)

## Building the JAR

Navigate to the `backend` directory and run:

```bash
mvn clean package -DskipTests
```

This will create a JAR file in `target/*.jar`.

## Running Locally (Development)

To run the application in development mode with local PostgreSQL:

1. Ensure PostgreSQL is running on `localhost:5432` with database `mydb`, user `postgres`, password `postgres`.
2. Run:

```bash
java -jar target/*.jar
```

The application will start on port 8081 by default (as per dev profile).

## Running in Production

To run the application in production mode with environment variables:

Set the following environment variables:

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_DATASOURCE_URL` - JDBC URL for your hosted PostgreSQL (e.g., `jdbc:postgresql://host:port/database`)
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ALLOWED_ORIGIN` - Allowed origin for CORS (e.g., `https://yourfrontend.com`)
- `PORT` - Port to run the application on (default 8080)

Then run:

```bash
java -Dspring.profiles.active=prod -jar target/*.jar
```

## Connecting to Hosted PostgreSQL

1. Create a PostgreSQL database on your hosting provider.
2. Note the connection details: host, port, database name, username, password.
3. Construct the JDBC URL: `jdbc:postgresql://host:port/database`
4. Set the environment variables as above.
5. Ensure your hosting provider allows connections from your deployment environment.

## Required Environment Variables for Production

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGIN`
- `PORT` (optional, defaults to 8080)

## Notes

- The application uses Spring Profiles: `dev` for local development, `prod` for production.
- In production, all database configurations are read from environment variables.
- CORS is configured to allow requests from the origin specified in `CORS_ALLOWED_ORIGIN`.
- The application is compatible with PostgreSQL and does not use H2.