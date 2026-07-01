pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKERHUB_USER = "sangambuild"
        CONTAINER_NAME = "todo-container"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
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
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
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
                bat """
                docker stop %CONTAINER_NAME% 2>nul || exit /b 0
                docker rm %CONTAINER_NAME% 2>nul || exit /b 0
                docker run -d --name %CONTAINER_NAME% -p 3000:3000 %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                """
            }
        }
    }

    post {
        success {
            echo "Build #${IMAGE_TAG} succeeded."
        }

        failure {
            echo "Build #${IMAGE_TAG} failed."
        }

        always {
            echo "Pipeline execution completed."
        }
    }
}