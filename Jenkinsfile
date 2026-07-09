pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKERHUB_USER = "sangambuild"

        CONTAINER_NAME = "todo-container"
        HOST_PORT = "3001"
        CONTAINER_PORT = "3000"

        DOCKER_NETWORK = "todo-network"
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

        stage('Deploy Container') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    bat """
                    ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %SSH_USER%@13.60.95.90 "docker pull %DOCKERHUB_USER%/%IMAGE_NAME%:latest && docker stop %CONTAINER_NAME% || true && docker rm %CONTAINER_NAME% || true && docker run -d --name %CONTAINER_NAME% --network %DOCKER_NETWORK% -p %HOST_PORT%:%CONTAINER_PORT% --env-file .env %DOCKERHUB_USER%/%IMAGE_NAME%:latest"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Build #${IMAGE_TAG} succeeded."
            echo "Application available at http://localhost:${HOST_PORT}"
        }

        failure {
            echo "Build #${IMAGE_TAG} failed."
        }

        always {
            echo "Pipeline execution completed."
        }
    }
}