# Backend Deployment Guide

This guide explains how to build and deploy the Spring Boot backend for the Digital Judging System using Docker and a hosted PostgreSQL database.

## Prerequisites

- Docker
- Docker Compose (for local development)
- PostgreSQL (for local development)
- A hosted PostgreSQL service (e.g., Render, Railway, Neon, Supabase)

## Building the Docker Image

Navigate to the `backend` directory and run:

```bash
mvn clean package -DskipTests
docker build -t judging-system-backend .
```

This will create a Docker image with the Spring Boot application.

## Running Locally (Development)

To run the application in development mode with local PostgreSQL:

1. Ensure PostgreSQL is running on `localhost:5432` with database `mydb`, user `postgres`, password `postgres`.
2. Run:

```bash
docker run -p 8081:8081 judging-system-backend
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
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=$SPRING_DATASOURCE_URL \
  -e SPRING_DATASOURCE_USERNAME=$SPRING_DATASOURCE_USERNAME \
  -e SPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD \
  -e JWT_SECRET=$JWT_SECRET \
  -e CORS_ALLOWED_ORIGIN=$CORS_ALLOWED_ORIGIN \
  judging-system-backend
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

## Deploying to Render

1. Push your code to GitHub.
2. Connect your GitHub repo to Render.
3. Create a new Web Service.
4. Set the runtime to Docker.
5. Configure the environment variables in Render's dashboard.
6. Deploy.

## Notes

- The application uses Spring Profiles: `dev` for local development, `prod` for production.
- In production, all database configurations are read from environment variables.
- CORS is configured to allow requests from the origin specified in `CORS_ALLOWED_ORIGIN`.
- The application is compatible with PostgreSQL and does not use H2.