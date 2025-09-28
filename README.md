Of course. It's a great idea to include instructions for both setups. Here is the updated `README.md` with the new section for running the project locally.

# Backend Engineer Hiring Test Submission

This project is a production-ready backend service for a hypothetical video rendering platform. It features user authentication, project management, asset uploads, and an asynchronous job queue for handling long-running rendering tasks.

The entire application stack is containerized using Docker and can be launched with a single command.

-----

## \#\# Architectural Choices

  - **Node.js with TypeScript & Express**: Chosen for its robust ecosystem, performance, and the type-safety provided by TypeScript, which is critical for building maintainable, large-scale applications. Express provides a minimal and flexible foundation for the API.

  - **PostgreSQL with Prisma**: PostgreSQL is a powerful, open-source relational database known for its reliability and data integrity. Prisma was chosen as the ORM for its exceptional developer experience, auto-generated type-safe client, and intuitive schema definition, which serves as the single source of truth for our data models.

  - **BullMQ with Redis**: For long-running tasks like video rendering, synchronous processing is not feasible as it would lock up the server and lead to client timeouts. BullMQ, a robust and fast job queue system built on Redis, was chosen to manage these tasks asynchronously. The API can accept a job, queue it, and respond to the client immediately, while a separate worker process handles the job in the background.

  - **Docker & Docker Compose**: Containerization is essential for modern development and deployment. Docker allows us to package the application with all its dependencies into a reproducible environment. Docker Compose orchestrates the entire multi-service stack (Node app, Postgres DB, Redis), enabling a seamless "one-command" setup (`docker-compose up`) for any developer or CI/CD pipeline.

-----

## \#\# Setup & Installation

### \#\#\# Prerequisites

For the **Docker setup**, you only need:

  - Docker
  - Docker Compose

For the **Local setup**, you will need:

  - Node.js (v18 or later)
  - PostgreSQL
  - Redis

### \#\#\# Running with Docker (Recommended)

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create an environment file:**
    Copy the example `.env` file. The default values are configured to work with Docker Compose out of the box.

    ```bash
    cp .env.example .env
    ```

3.  **Build and run the services:**
    This command will build the Docker image for the application and start the app, database, and Redis containers.

    ```bash
    docker-compose up --build
    ```

4.  **Run database migrations:**
    In a separate terminal, run the Prisma migration command to set up the database schema.

    ```bash
    docker-compose exec app npx prisma migrate dev --name init
    ```

### \#\#\# Running Locally Without Docker (Alternative)

1.  **Clone the repository and install dependencies:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    npm install
    ```

2.  **Create and configure the environment file:**
    Copy the example file, then **edit it** to connect to your local services.

    ```bash
    cp .env.example .env
    ```

    Open the `.env` file and change the URLs to use `localhost`. Replace `YOUR_POSTGRES_PASSWORD` with the password for your local PostgreSQL user.

    ```env
    DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/mydatabase?schema=public"
    REDIS_URL="redis://localhost:6379"
    ```

3.  **Set up the database:**
    Make sure your local PostgreSQL server is running. You will need to manually create a database named `mydatabase`. Then, run the Prisma migration command:

    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Start the application:**
    You will need to open **two separate terminals**.

      * In your **first terminal**, start the main API server:
        ```bash
        npm run dev
        ```
      * In your **second terminal**, start the background worker:
        ```bash
        npx ts-node-dev src/jobs/worker.ts
        ```

The application will be running on `http://localhost:3000`.
Interactive API documentation (Swagger) is available at `http://localhost:3000/api-docs`.

-----

## \#\# API Usage Guide

The API is documented using Swagger UI. Please visit `http://localhost:3000/api-docs` for a full, interactive list of endpoints.

**Authentication:**

1.  Register a new user via `POST /api/auth/register`.
2.  Log in with the new credentials via `POST /api/auth/login` to receive a JWT.
3.  Include the token in the `Authorization` header for all protected endpoints: `Authorization: Bearer <your-token>`.

**Example Flow:**

1.  `POST /api/projects` (with auth) to create a new project.
2.  `POST /projects/{projectId}/assets` (with auth) to upload a file.
3.  `POST /projects/{projectId}/render` (with auth) to start the render job.
4.  `GET /api/jobs/{jobId}/status` (with auth) to check the progress of the render.