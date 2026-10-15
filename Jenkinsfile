
pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        COMPOSE_PROJECT_NAME = 'task-manager-ci-cd'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Validate') {
            steps {
                sh 'docker-compose -p task-manager-ci-cd -f compose.yaml config -q'
                sh 'node --check backend/server.js'
                echo 'Validation successful.'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -p task-manager-ci-cd -f compose.yaml build'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker-compose -p task-manager-ci-cd -f compose.yaml up -d --force-recreate'
            }
        }

        stage('Verify Application') {
            steps {
                sh '''
                    set -eu

                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost:8088/api/tasks; then
                            echo
                            echo "Application verification successful."
                            docker-compose -p task-manager-ci-cd -f compose.yaml ps
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Application verification failed."
                    docker-compose -p task-manager-ci-cd -f compose.yaml ps
                    docker-compose -p task-manager-ci-cd -f compose.yaml logs --tail=50
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
