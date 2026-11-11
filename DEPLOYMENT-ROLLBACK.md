

# Deployment and Rollback Guide

## 1. Application Details

| Item | Value |
|---|---|
| AWS Region | ap-south-1 |
| ECR Registry | 610849077185.dkr.ecr.ap-south-1.amazonaws.com |
| Compose Project | fullstack-app |
| GitHub Repository | rajashekar447/fullstack-app |
| Git Branch | develop |
| Jenkins Job | fullstack-app-3service-cicd |
| Current Deployment | Jenkins Build 1 |
| Previous Release | 2.0.0 |

## 2. Application Services

- Backend: task-manager-backend (port 3000)
- Frontend: task-manager-frontend (port 80)
- Notifications: task-manager-notifications (port 3001)

## 3. CI/CD Deployment Process

Jenkins performs these steps:

1. Checkout source code from GitHub.
2. Initialize AWS ECR variables.
3. Validate Docker Compose configuration.
4. Build all three Docker images.
5. Authenticate to Amazon ECR.
6. Push images using the Jenkins build number as the tag.
7. Pull images from ECR.
8. Deploy containers using Docker Compose.
9. Verify application endpoints.

## 4. Deployment Verification

Run on the EC2 instance:

```bash
sudo docker ps
```

Check the application endpoints:

```bash
curl -fsS http://localhost/
curl -fsS http://localhost/api/tasks
curl -fsS http://localhost/notifications/health
curl -fsS http://localhost/notifications/api/notifications
```

Check container health:

```bash
sudo docker compose --env-file .env -p fullstack-app ps
```

## 5. Manual Rollback to Release 2.0.0

Use this procedure if a new deployment causes application problems.

### Step 1: Enter the application directory

```bash
cd ~/projects/fullstack-app
```

### Step 2: Confirm rollback version

```bash
cat .env
```

Ensure the file contains:

```env
ECR_REGISTRY=610849077185.dkr.ecr.ap-south-1.amazonaws.com
IMAGE_TAG=2.0.0
```

### Step 3: Authenticate to Amazon ECR

```bash
aws ecr get-login-password --region ap-south-1 | \
sudo docker login \
  --username AWS \
  --password-stdin \
  610849077185.dkr.ecr.ap-south-1.amazonaws.com
```

### Step 4: Pull previous release images

```bash
sudo docker compose --env-file .env \
  -p fullstack-app pull
```

### Step 5: Restore previous release

```bash
sudo docker compose --env-file .env \
  -p fullstack-app up -d --force-recreate
```

### Step 6: Verify rollback

```bash
sudo docker compose --env-file .env \
  -p fullstack-app ps
```

Confirm all three services are running and healthy.

Test endpoints again:

```bash
curl -fsS http://localhost/
curl -fsS http://localhost/api/tasks
curl -fsS http://localhost/notifications/health
curl -fsS http://localhost/notifications/api/notifications
```

## 6. Troubleshooting

View application containers:

```bash
sudo docker ps -a
```

View application logs:

```bash
sudo docker compose --env-file .env \
  -p fullstack-app logs --tail=100
```

Check disk usage:

```bash
df -h /
sudo docker system df
```

Check memory:

```bash
free -h
```

## 7. Important Notes

- Do not delete ECR images required for rollback.
- Keep the previous known-good release available.
- The .env file contains local deployment configuration and must not be committed.
- Jenkins build numbers are used as image tags.
- Manual rollback does not change the Jenkins build number.
- A future Jenkins deployment can replace the rolled-back version.
- Notification data is stored in memory and may reset when containers are recreated.
- Do not run Terraform destroy or delete existing AWS infrastructure as part of rollback.
