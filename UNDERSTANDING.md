# Understanding the Backend System: A Developer's Narrative

This document is my personal guide to understanding the architecture and flow of this project. It breaks down the system into its core components, explaining the "why" behind the design decisions.

---

### Chapter 1: The Blueprint - Database Schema Design

The entire application is built around a single source of truth for data: the `prisma/schema.prisma` file. This is our blueprint.

**Models & Purpose:**
-   **`User`**: Stores authentication details. The `email` is unique, and the `password` is a hash, never plaintext.
-   **`Project`**: The central container for a user's work. It's owned by a `User` via a one-to-many relationship (`User` has many `Projects`). The `onDelete: Cascade` rule means if a user is deleted, all their projects are automatically deleted too, ensuring data integrity.
-   **`Asset`**: Represents a file (video, image) belonging to a `Project`. A project can have many assets.
-   **`RenderJob`**: Tracks the status of an asynchronous rendering task. It has a one-to-one relationship with a `Project`. A project can have only one render job at a time. Its `status` field (`queued`, `processing`, `completed`, `failed`) is the heart of our background processing feedback loop.
-   **`AnalyticsEvent`**: A simple model for "fire and forget" logging. It's decoupled from other models to ensure that analytics logging never interferes with core application logic.

**Why `cuid()` for IDs?**
Instead of using auto-incrementing integers, we use `cuid()`. These are collision-resistant, unique identifiers that are URL-safe. This is better than UUIDs because they are shorter and more efficient for database indexing. It also prevents malicious users from guessing sequential IDs to scrape data (e.g., trying `/projects/1`, `/projects/2`, etc.).

---

### Chapter 2: The Core - Building the API

Let's trace a single request to understand the application's structure: a `POST` request to `/api/projects`.

1.  **Entry Point (`src/index.ts`)**: The request first hits our Express server. Middleware for CORS and JSON parsing processes it. The server sees the `/api` prefix and passes the request to our master router (`src/api/routes/index.ts`).

2.  **Routing (`src/api/routes/projects.routes.ts`)**: The master router matches `/projects` and passes the request to `projectRoutes`. This router sees the `POST` method for the `/` path and finds two middleware functions: `authMiddleware` and `projectController.createProject`.

3.  **Middleware (`src/middleware/auth.middleware.ts`)**: The `authMiddleware` runs first. It checks for a valid JWT in the `Authorization` header. If valid, it attaches the `user` payload (containing `userId`) to the request object and calls `next()`. If not, it throws an error, and the request stops here.

4.  **Controller (`src/api/controllers/project.controller.ts`)**: Control now passes to `createProject`. The controller's only job is to orchestrate. It extracts the `name` from `req.body` and the `userId` from `req.user`. It doesn't know *how* to create a project; it just knows it needs to call a service to do it. It calls `projectService.createProject(name, userId)`.

5.  **Service (`src/services/project.service.ts`)**: This is where the business logic lives. The `createProject` function contains the actual database interaction. It calls `prisma.project.create(...)` with the data. Prisma's type-safe client ensures we're passing the correct data types. The service then returns the newly created project object.

6.  **Response**: The controller receives the new project from the service and sends it back to the client with a `201 Created` status code. If any step failed, an error would be thrown and caught by our `globalErrorHandler`, which would send a standardized JSON error response.

This strict **Route -> Controller -> Service** pattern is the cornerstone of a clean and maintainable API.

---

### Chapter 3: The Powerhouse - Asynchronous Jobs

The `/render` endpoint is special. A video render can take minutes or hours. We can't make a user wait. This is where the job queue comes in.

**The Concept:**
A job queue is like a to-do list for the server. The API's job is to quickly add a task to the list and tell the user, "Okay, I've added it." A separate, dedicated process called a **Worker** constantly watches this list, picks up new tasks, and completes them in the background.

**Our Flow (`POST /projects/{projectId}/render`):**
1.  The controller calls `projectService.queueRenderJob`.
2.  The service first creates a `RenderJob` record in our PostgreSQL database with `status: 'queued'`. This gives us a permanent record and an ID for the job.
3.  The service then adds a job to the BullMQ `renderQueue` using `renderQueue.add()`. The job's payload contains the `jobId` we just created.
4.  The service immediately returns, the controller sends a `202 Accepted` response, and the user is free to do other things. The entire API interaction takes milliseconds.

**The Worker's Life (`src/jobs/worker.ts`):**
-   Meanwhile, our worker process is running, listening to Redis for new jobs on the `render-video` queue.
-   It picks up our job. It immediately updates the job's status in the database to `processing`. The user could now poll our `/api/jobs/{jobId}/status` endpoint and see this change.
-   It then executes the long-running task (we simulate this with a `sleep` command, but in reality, it would be a complex `ffmpeg` command).
-   As it works, it can update the `progress` field in the database.
-   Once finished, it updates the status to `completed` and adds the `outputUrl`.
-   If at any point an error occurs, the `catch` block runs, updating the status to `failed`.

This architecture decouples the web server from the heavy processing, making the application responsive and scalable. We could even add more worker processes to handle more jobs concurrently.

---

### Chapter 4: The Gatekeeper - Authentication & Security

We use JSON Web Tokens (JWT) for authentication. It's a stateless and widely adopted standard.

**The Login Flow (`POST /api/auth/login`):**
1.  A user provides their email and password.
2.  The `authService` finds the user in the database by their email.
3.  It uses `bcrypt.compare()` to check if the provided password matches the stored hash. This is crucial – we **never** store plaintext passwords.
4.  If they match, the service creates a JWT using `jwt.sign()`. The token's payload contains the `userId`. This payload is digitally signed with our `JWT_SECRET`. This signature ensures that the token cannot be tampered with.
5.  The token is sent back to the client.

**Protecting Routes (The Middleware):**
1.  The client stores this token and includes it in the `Authorization: Bearer <token>` header for future requests to protected routes.
2.  Our `authMiddleware` intercepts these requests.
3.  It uses `jwt.verify()` with our `JWT_SECRET` to check the token's signature. If the signature is invalid (meaning the token was tampered with or signed with a different secret), it throws an error. It also checks if the token has expired.
4.  If the token is valid, the middleware extracts the `userId` from the payload and attaches it to the request object (`req.user`). Now, all subsequent handlers in the chain have access to the authenticated user's ID without needing to query the database again.

---

### Chapter 5: The Professional Touch - Dockerization & Docs

**Docker (`Dockerfile` & `docker-compose.yml`):**
-   The **`Dockerfile`** is a recipe to build a self-contained image of our application. The multi-stage build is a best practice for production: it compiles our code in a `builder` stage with all the dev tools and then copies only the final compiled JavaScript and production dependencies to a clean, lightweight final image. This reduces attack surface and image size.
-   The **`docker-compose.yml`** file is an orchestration tool. It defines our entire application stack as a set of services: `app`, `db`, and `redis`. It tells Docker how they connect to each other (e.g., the app can reach the database at the hostname `db`). This makes the development setup incredibly simple and reproducible for any team member. It's superior to a local setup because it guarantees that every developer and the production environment are running the exact same versions of Node.js, PostgreSQL, and Redis, eliminating "it works on my machine" problems.

**Swagger (`src/swagger.ts`):**
-   Swagger provides "living documentation." Instead of writing static docs that quickly go out of date, we write special JSDoc comments directly above our route definitions.
-   The `swagger-jsdoc` library parses these comments and generates an OpenAPI specification file.
-   The `swagger-ui-express` library takes this specification and hosts a beautiful, interactive UI where anyone (including the hiring manager) can see all our endpoints, their parameters, and even try them out directly from the browser. This is a hallmark of a professional, well-documented API.

---

### Conclusion: Putting It All Together

This project demonstrates a modern, scalable backend architecture. Every piece has a purpose: Express for handling HTTP, Prisma for data integrity, BullMQ for responsiveness and scalability, JWT for security, and Docker for reproducibility. The strict separation of concerns into layers (routes, controllers, services) makes the codebase clean, testable, and ready to be expanded with new features. This is the foundation of a system built for the long haul.