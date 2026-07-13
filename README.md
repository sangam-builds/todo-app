# TaskFlow - Premium DevOps-Enabled Todo App

TaskFlow is a modern, responsive, and DevOps-enabled Todo Application. It features standard task management alongside Google OAuth login and automated synchronization of tasks with deadlines directly to your **Google Calendar**. 

Designed with a focus on modern DevOps practices, the project includes multi-stage containerization with Docker, a fully automated CI/CD pipeline using Jenkins, and pre-configured integrations for system-level monitoring.

---

## 🚀 Key Features

*   **🔒 Google OAuth 2.0 Integration**: Safe and modern user authentication handled seamlessly via Supabase Auth.
*   **📅 Google Calendar Sync**: Automatically synchronize tasks containing due dates to your primary Google Calendar (utilizing Google Calendar API and Google OAuth Provider Tokens).
*   **📊 Rich Task Dashboard**: A clean and highly aesthetic UI featuring custom dark-mode styling, glassmorphism, responsive menus, section navigation, and beautiful interactive micro-animations.
*   **⚡ Priority & Deadlines**: Set priorities (LOW, MEDIUM, HIGH) and specific due dates/times for your tasks to stay on top of your workflow.
*   **💾 Soft Delete & History**: Safely delete tasks (soft-deleted with `deletedAt` timestamps) and view your complete historic analytics list.
*   **🐳 Containerized Architecture**: Optimized multi-stage `Dockerfile` separating the Prisma client generation step from the production runtime to keep the final image lightweight and secure.
*   **🎡 CI/CD Automation (Jenkins)**: A declarative `Jenkinsfile` pipeline that handles workspace cleanup, dependency installation, Prisma client generation, automated testing, Docker builds, and pushes to Docker Hub.
*   **📈 Prometheus & Grafana Monitoring**: Out-of-the-box support for application monitoring utilizing `prom-client` (reporting CPU, memory, API latency, and request rates) combined with Grafana dashboards.

---

## 🛠️ Technology Stack

*   **Frontend**: Vanilla HTML5, Vanilla CSS3 (Custom animations, theme management, responsive grid), Modern JavaScript.
*   **Backend**: Node.js, Express.js.
*   **Database & ORM**: PostgreSQL (Supabase), Prisma ORM.
*   **Testing**: Jest, Supertest.
*   **CI/CD**: Jenkins Declarative Pipelines, Docker.
*   **Monitoring**: Prometheus, Grafana.

---

## 💻 Local Setup & Installation

### Prerequisites
*   Node.js (v22+ recommended)
*   PostgreSQL or a Supabase Database URL

### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd devops-project
npm install
```

### Step 2: Environment Configuration
Create a `.env` file in the root directory and configure the following variables (refer to `.env.example`):
```env
PORT=3000
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>"
DIRECT_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>"
JWT_SECRET="your-jwt-signing-secret"

# Supabase Configurations
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### Step 3: Database Migration & Prisma Client
Initialize the database schemas and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### Step 4: Run the Application
To run the server in development mode with hot-reloading (nodemon):
```bash
npm run dev
```
The application will be running locally at [http://localhost:3000](http://localhost:3000).

---

## 🐳 Docker Deployment

A multi-stage `Dockerfile` is included to easily containerize and run the application.

### Build the Docker Image
```bash
docker build -t todo-app:latest .
```

### Run the Container
Run the application container by mapping port `3000` and supplying your `.env` configuration file:
```bash
docker run -d --name todo-container -p 3000:3000 --env-file .env todo-app:latest
```

---

## 🎡 Jenkins CI/CD Pipeline

The workspace contains a declarative `Jenkinsfile` designed to automate code quality verification and deployment.

### Pipeline Stages
1.  **Clean Workspace**: Discards any leftover files from previous build runs.
2.  **Checkout**: Pulls the latest commits from the active branch.
3.  **Install Dependencies**: Installs development and production packages (`npm ci`).
4.  **Generate Prisma Client**: Automatically generates the Prisma client binaries.
5.  **Test**: Runs Jest unit and integration tests using mocked connection strings.
6.  **Docker Login**: Secures credentials via Docker Hub integration (`docker-auth`).
7.  **Build Docker Image**: Builds production-ready images with the build number tag and `latest`.
8.  **Push Image**: Deploys the images to Docker Hub.

### Production Deploy Command (EC2 Manual Script)
After the image successfully pushes, you can deploy the container using:
```bash
docker pull sangambuild/todo-app:latest
docker stop todo-container || true
docker rm todo-container || true
docker run -d --name todo-container --network todo-network -p 3001:3000 --env-file .env sangambuild/todo-app:latest
```

---

## 📈 Monitoring with Prometheus & Grafana

The application incorporates a `/metrics` route powered by `prom-client` that aggregates system telemetry.

*   **Prometheus**: The server exposes vital performance indicators to a scraper target. A custom `prometheus` configuration folder holds server mapping credentials.
*   **Grafana**: Pre-configured dashboards are located in the `grafana/` directory structure for fast metrics visualization.