pipeline {
  agent any

  environment {
    IMAGE_NAME = "todo-app"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build Docker image') {
      steps {
        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
      }
    }

  }

  post {
    success {
      echo "Build #${IMAGE_TAG} succeeded."
    }
    failure {
      echo "Build #${IMAGE_TAG} failed — check the stage logs above."
    }
  }
}