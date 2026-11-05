
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        AWS_REGION = 'ap-south-1'
        COMPOSE_PROJECT_NAME = 'fullstack-app'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Initialize ECR Variables') {
            steps {
                script {
                    def accountId = sh(
                        script: 'aws sts get-caller-identity --query Account --output text',
                        returnStdout: true
                    ).trim()

                    env.ECR_REGISTRY = "${accountId}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"
                }

                sh '''
                    echo "ECR Registry: ${ECR_REGISTRY}"
                    echo "Image Tag: ${IMAGE_TAG}"
                '''
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    set -eu
                    node --check backend/server.js
                    docker compose -p ${COMPOSE_PROJECT_NAME} config -q
                    echo "Validation successful."
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    docker build \
                      -t ${ECR_REGISTRY}/task-manager-backend:${IMAGE_TAG} \
                      -t ${ECR_REGISTRY}/task-manager-backend:latest \
                      ./backend

                    docker build \
                      -t ${ECR_REGISTRY}/task-manager-frontend:${IMAGE_TAG} \
                      -t ${ECR_REGISTRY}/task-manager-frontend:latest \
                      ./frontend
                '''
            }
        }

        stage('Authenticate to ECR') {
            steps {
                sh '''
                    set -eu

                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login \
                      --username AWS \
                      --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -eu

                    docker push ${ECR_REGISTRY}/task-manager-backend:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/task-manager-backend:latest

                    docker push ${ECR_REGISTRY}/task-manager-frontend:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/task-manager-frontend:latest
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                    set -eu

                    docker compose -p ${COMPOSE_PROJECT_NAME} pull
                    docker compose -p ${COMPOSE_PROJECT_NAME} up -d --force-recreate
                '''
            }
        }

        stage('Verify Application') {
            steps {
                sh '''
                    set -eu

                    for i in $(seq 1 30); do
                        if curl -fsS http://localhost:8088/api/tasks; then
                            echo
                            echo "Application verification successful."
                            docker compose -p ${COMPOSE_PROJECT_NAME} ps
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Application verification failed."
                    docker compose -p ${COMPOSE_PROJECT_NAME} ps
                    docker compose -p ${COMPOSE_PROJECT_NAME} logs --tail=50
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'CI/CD pipeline failed. Check the stage logs.'
        }
    }
}
