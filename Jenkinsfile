pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKERHUB_USER = "sangambuild"

        CONTAINER_NAME = "todo-container"
        HOST_PORT = "3001"
        CONTAINER_PORT = "3000"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                bat 'npx prisma generate'
            }
        }

        stage('Test') {
            environment {
                DATABASE_URL = "postgresql://mock_user:mock_pass@localhost:5432/mock_db?schema=public"
                JWT_SECRET = "placeholder-jwt-session-secret-key-32-chars-long"
            }
            steps {
                bat 'npm test'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-auth',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat '''
                    docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                docker build ^
                -t %DOCKERHUB_USER%/%IMAGE_NAME%:%IMAGE_TAG% ^
                -t %DOCKERHUB_USER%/%IMAGE_NAME%:latest .
                """
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                bat """
                docker push %DOCKERHUB_USER%/%IMAGE_NAME%:%IMAGE_TAG%
                docker push %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                """
            }
        }
    }

    post {
        success {
            echo "Build #${IMAGE_TAG} succeeded. Image pushed to Docker Hub as ${IMAGE_TAG} and latest."
            echo "To deploy manually on EC2, run: docker pull sangambuild/todo-app:latest && docker stop todo-container && docker rm todo-container && docker run -d --name todo-container --network todo-network -p 3001:3000 --env-file .env sangambuild/todo-app:latest"
        }

        failure {
            echo "Build #${IMAGE_TAG} failed."
        }

        always {
            echo "Pipeline execution completed."
        }
    }
}