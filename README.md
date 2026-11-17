# Three-Service Application – DevOps CI/CD Project

## Project Overview

This project demonstrates containerization, automated CI/CD, AWS infrastructure management, deployment, monitoring and rollback for a three-service application.

## Architecture

The application contains:

- Frontend: Nginx-based web application
- Backend: Node.js task management API
- Notifications: Node.js notifications API
- Amazon ECR: Container image registry
- Amazon EC2: Application deployment host
- Jenkins: CI/CD automation
- Terraform: AWS infrastructure configuration
- Prometheus: Metrics collection
- Grafana: Monitoring dashboards
- Node Exporter: Host metrics
- cAdvisor: Container metrics

## Repository Structure

- backend/ – Backend application and Dockerfile
- frontend/ – Frontend application, Dockerfile and Nginx configuration
- notifications/ – Notifications service and Dockerfile
- terraform/ – Terraform infrastructure configuration
- monitoring/ – Prometheus, Grafana and monitoring configuration
- compose.yaml – Three-service application deployment
- Jenkinsfile – Jenkins CI/CD pipeline
- DEPLOYMENT.md – Deployment instructions
- DEPLOYMENT-ROLLBACK.md – Release rollback instructions

## Prerequisites

- Ubuntu/Linux server
- Docker Engine and Docker Compose
- Git
- AWS CLI
- Terraform 1.12 or later
- AWS account with appropriate EC2 and ECR permissions
- Jenkins with required pipeline and AWS credentials configuration

## Run the Application

Configure the required environment variables, including ECR_REGISTRY and IMAGE_TAG.

Authenticate Docker with Amazon ECR:

    aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

Deploy the application:

    docker compose pull
    docker compose up -d

Verify running services:

    docker compose ps

Check application endpoints:

    curl -i http://localhost/
    curl -i http://localhost/api/tasks
    curl -i http://localhost/notifications/health
    curl -i http://localhost/notifications/api/notifications

Replace YOUR_ACCOUNT_ID with the AWS account ID. Use approved image tags and configured environment variables.

## Jenkins CI/CD

The Jenkins pipeline performs:

1. GitHub source checkout
2. Configuration and Dockerfile validation
3. Docker image builds
4. Amazon ECR authentication
5. Image tagging and pushing
6. Application deployment using Docker Compose
7. Health endpoint verification
8. Last-known-good release tracking
9. Automatic rollback on deployment failure

The rollback test is maintained as a separate Jenkins job.

## Terraform

Terraform configuration is available in the terraform/ directory.

See [Terraform README](terraform/README.md) for prerequisites, configuration, validation and state safety instructions.

The configuration references existing infrastructure. Do not apply it from a fresh checkout without reviewing and importing the existing resources into the correct state.

## Monitoring

Monitoring configuration is available in monitoring/.

Components:

- Prometheus – Metrics collection
- Grafana – Dashboards and visualization
- Node Exporter – Host-level metrics
- cAdvisor – Container-level metrics

See monitoring/TROUBLESHOOTING.md for verification and troubleshooting instructions.

## Deployment and Rollback

See:

- DEPLOYMENT.md
- DEPLOYMENT-ROLLBACK.md

Use the Jenkins rollback pipeline and approved release tags when recovering from an unsuccessful deployment.

## Security Notes

- Never commit .env files, AWS credentials, private keys or Terraform state.
- Use IAM roles and least-privilege permissions.
- Restrict SSH and Jenkins access to approved IP ranges.
- Keep monitoring interfaces private or protected.
- Review Terraform plans before applying changes.
- Do not run Terraform destroy against existing production infrastructure.

## Cleanup

Stop application containers only when intentionally performing maintenance:

    docker compose down

Monitoring services have a separate Compose configuration:

    cd monitoring
    docker compose down

Do not remove persistent volumes unless their data is no longer required.
