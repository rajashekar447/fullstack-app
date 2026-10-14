
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out by Jenkins from GitHub.'
            }
        }

        stage('Validate') {
            steps {
                sh 'docker-compose -f compose.yaml config -q'
                sh 'node --check backend/server.js'
                echo 'Validation successful.'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f compose.yaml build'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker-compose -f compose.yaml up -d --force-recreate'
            }
        }

        stage('Verify Application') {
            steps {
                sh '''
                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost:8088/api/tasks; then
                            echo "Application verification successful."
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Application verification failed."
                    docker-compose -f compose.yaml ps
                    docker-compose -f compose.yaml logs --tail=50
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
