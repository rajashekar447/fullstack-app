
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_CONFIG_FILE = '/etc/aws/config'
        AWS_PROFILE = 'jenkins-ecr-push'
        COMPOSE_PROJECT_NAME = 'fullstack-app'
        DOCKER_CONFIG = "/tmp/jenkins-docker-${BUILD_NUMBER}"

        DEPLOYMENT_STATE_FILE = '/var/lib/jenkins/fullstack-app-last-known-good'
        DEPLOYMENT_STARTED = 'false'
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

                    env.ECR_REGISTRY =
                        "${accountId}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"

                    env.IMAGE_TAG = env.BUILD_NUMBER

                    def stateFileStatus = sh(
                        script: "test -s '${env.DEPLOYMENT_STATE_FILE}'",
                        returnStatus: true
                    )

                    if (stateFileStatus != 0) {
                       error("Deployment state file is missing or empty: ${env.DEPLOYMENT_STATE_FILE}")
                    }

                    def previousTag = sh(
                        script: "cat '${env.DEPLOYMENT_STATE_FILE}'",
                        returnStdout: true
                    ).trim()

                    if (!(previousTag ==~ /[A-Za-z0-9_.-]+/)) {
                        error("Invalid previous deployment tag: ${previousTag}")
                    }

                    env.ROLLBACK_TAG = previousTag

                    echo "Current build tag: ${env.IMAGE_TAG}"
                    echo "Last known-good tag: ${env.ROLLBACK_TAG}"
                }

                sh '''
                    set -eu

                    printf 'ECR_REGISTRY=%s\\nIMAGE_TAG=%s\\n' \
                      "$ECR_REGISTRY" "$IMAGE_TAG" > .env

                    echo "ECR Registry: $ECR_REGISTRY"
                    echo "Image Tag: $IMAGE_TAG"
                '''
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    set -eu

                    docker compose \
                      --env-file .env \
                      -p "$COMPOSE_PROJECT_NAME" config -q

                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                    test -f notifications/Dockerfile

                    echo "Validation successful."
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    docker build \
                      -t "$ECR_REGISTRY/task-manager-backend:$IMAGE_TAG" \
                      ./backend

                    docker build \
                      -t "$ECR_REGISTRY/task-manager-frontend:$IMAGE_TAG" \
                      ./frontend

                    docker build \
                      -t "$ECR_REGISTRY/task-manager-notifications:$IMAGE_TAG" \
                      ./notifications

                    echo "All three Docker images built successfully."
                '''
            }
        }

        stage('Authenticate to ECR') {
            steps {
                sh '''
                    set -eu

                    mkdir -p "$DOCKER_CONFIG"
                    chmod 700 "$DOCKER_CONFIG"

                    aws ecr get-login-password \
                      --region "$AWS_REGION" \
                      --profile "$AWS_PROFILE" | \
                    docker login \
                      --username AWS \
                      --password-stdin "$ECR_REGISTRY"
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -eu

                    docker push "$ECR_REGISTRY/task-manager-backend:$IMAGE_TAG"
                    docker push "$ECR_REGISTRY/task-manager-frontend:$IMAGE_TAG"
                    docker push "$ECR_REGISTRY/task-manager-notifications:$IMAGE_TAG"

                    echo "All three images pushed successfully."
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    env.DEPLOYMENT_STARTED = 'true'
                    echo "Deployment started. Rollback target: ${env.ROLLBACK_TAG}"
                }

                sh '''
                    set -eu

                    docker compose \
                      --env-file .env \
                      -p "$COMPOSE_PROJECT_NAME" pull

                    docker compose \
                      --env-file .env \
                      -p "$COMPOSE_PROJECT_NAME" up -d --force-recreate

                    echo "Deployment command completed."
                '''
            }
        }

        stage('Verify Application') {
            steps {
                sh '''
                    set -eu

                    echo "Checking application endpoints..."

                    for i in $(seq 1 30); do
                        if curl -fsS http://localhost/ >/dev/null && \
                           curl -fsS http://localhost/api/tasks >/dev/null && \
                           curl -fsS http://localhost/notifications/health >/dev/null && \
                           curl -fsS http://localhost/notifications/api/notifications >/dev/null
                        then
                            echo "All application endpoints are healthy."

                            docker compose \
                              --env-file .env \
                              -p "$COMPOSE_PROJECT_NAME" ps

                            exit 0
                        fi

                        echo "Waiting for application... attempt $i/30"
                        sleep 2
                    done

                    echo "Application verification failed."

                    docker compose \
                      --env-file .env \
                      -p "$COMPOSE_PROJECT_NAME" ps

                    docker compose \
                      --env-file .env \
                      -p "$COMPOSE_PROJECT_NAME" logs --tail=50

                    exit 1
                '''

                sh '''
                    set -eu

                    printf '%s\\n' "$IMAGE_TAG" \
                      > "$DEPLOYMENT_STATE_FILE"

                    echo "Last known-good release updated to: $IMAGE_TAG"
                '''
            }
        }
    }

    post {
        success {
            echo 'Three-service CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'

            script {
                if (env.DEPLOYMENT_STARTED == 'true') {
                    echo "Attempting automatic rollback to release ${env.ROLLBACK_TAG}"

                    int rollbackStatus = sh(
                        returnStatus: true,
                        script: '''
                            set -eu

                            printf 'ECR_REGISTRY=%s\\nIMAGE_TAG=%s\\n' \
                              "$ECR_REGISTRY" "$ROLLBACK_TAG" > .env

                            echo "Restoring release: $ROLLBACK_TAG"

                            docker compose \
                              --env-file .env \
                              -p "$COMPOSE_PROJECT_NAME" pull

                            docker compose \
                              --env-file .env \
                              -p "$COMPOSE_PROJECT_NAME" up -d --force-recreate

                            for i in $(seq 1 30); do
                                if curl -fsS http://localhost/ >/dev/null && \
                                   curl -fsS http://localhost/api/tasks >/dev/null && \
                                   curl -fsS http://localhost/notifications/health >/dev/null && \
                                   curl -fsS http://localhost/notifications/api/notifications >/dev/null
                                then
                                    echo "Automatic rollback successful."

                                    docker compose \
                                      --env-file .env \
                                      -p "$COMPOSE_PROJECT_NAME" ps

                                    exit 0
                                fi

                                echo "Waiting for rollback verification... attempt $i/30"
                                sleep 2
                            done

                            echo "Rollback verification failed."

                            docker compose \
                              --env-file .env \
                              -p "$COMPOSE_PROJECT_NAME" ps || true

                            docker compose \
                              --env-file .env \
                              -p "$COMPOSE_PROJECT_NAME" logs --tail=50 || true

                            exit 1
                        '''
                    )

                    if (rollbackStatus == 0) {
                        echo "Rollback completed. Restored release: ${env.ROLLBACK_TAG}"
                    } else {
                        echo "CRITICAL: Automatic rollback failed. Manual investigation is required."
                    }
                } else {
                    echo 'Deployment was not started. No rollback is necessary.'
                }
            }
        }

        always {
            sh '''
                if [ -d "$DOCKER_CONFIG" ]; then
                    if [ -n "${ECR_REGISTRY:-}" ]; then
                        docker logout "$ECR_REGISTRY" || true
                    fi

                    rm -rf "$DOCKER_CONFIG"
                fi
            '''
        }
    }
}
