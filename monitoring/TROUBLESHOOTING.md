# Monitoring, Logging and Troubleshooting

## 1. Environment
- Platform: AWS EC2
- OS: Ubuntu 26.04.1
- Container runtime: Docker 29.9.3
- Docker Compose: v5.7.0

## 2. Monitoring Architecture

| Component | Purpose | Port |
|---|---|---|
| Node Exporter | Host CPU, memory and disk metrics | 9100 |
| cAdvisor | Docker container metrics | 8081 |
| Prometheus | Metrics collection and storage | 9090 |
| Grafana | Monitoring dashboards | 3000 |

Services are accessed locally or through an SSH tunnel.

## 3. Monitoring Verification

- Prometheus targets verified as UP.
- Node Exporter metrics verified.
- cAdvisor container CPU and memory metrics verified.
- Prometheus successfully queried container metrics.
- Grafana Prometheus datasource successfully tested.
- Dashboard panels configured:
  - EC2 CPU Utilization
  - EC2 Memory Utilization
  - EC2 Disk Utilization
  - Docker Container CPU Usage
  - Docker Container Memory Usage

## 4. Application Health Checks

Production application:
- Frontend: http://localhost/
- Backend API: http://localhost/api/tasks

Both endpoints returned HTTP 200 OK during verification.
Backend and notifications containers reported healthy.

## 5. Logging and Troubleshooting

Inspected logs for:
- Backend
- Frontend Nginx
- Notifications service
- Prometheus
- Grafana

Docker service was active and running.
No Docker warning or error journal entries were found.
System journal contained EC2/Ubuntu hardware and virtual-network notices.

A previous notifications process termination (SIGTERM) was observed.
The container subsequently restarted and reported healthy.

## 6. cAdvisor Troubleshooting

Initial container metrics were unavailable with the older cAdvisor version.

Actions taken:
- Upgraded cAdvisor to v0.60.6.
- Configured Docker socket and containerd access.
- Mounted the required Docker and containerd paths.
- Verified cAdvisor API statistics.
- Confirmed per-container CPU and memory metrics.
- Confirmed Prometheus ingestion of container metrics.

## 7. Controlled Failure and Recovery Test

Used the isolated rollback-test stack on port 8089.

Baseline:
- Test API returned HTTP 200 OK.
- Production frontend returned HTTP 200 OK.

Failure simulation:
- Stopped only rollback-test-task-manager-backend-1.
- Test API request timed out.
- Nginx logged HTTP 499 for the interrupted request.

Recovery:
- Restarted the test backend.
- Confirmed the backend became healthy.
- Test API returned HTTP 200 OK again.
- Production frontend continued returning HTTP 200 OK.

The live application and monitoring services were not stopped.

## 8. Useful Troubleshooting Commands

Check containers:
    sudo docker ps -a

Check Docker service:
    sudo systemctl status docker --no-pager

Inspect container logs:
    sudo docker logs --tail 50 CONTAINER_NAME

Check Prometheus targets:
    curl -s http://localhost:9090/api/v1/targets

Check Grafana health:
    curl -s http://localhost:3000/api/health

Check application:
    curl -I http://localhost/
    curl -i http://localhost/api/tasks

Check disk:
    df -h

Check memory:
    free -h

## 9. Conclusion

Monitoring, logging and controlled troubleshooting were performed.

Host and Docker metrics were collected using Prometheus and cAdvisor.
Grafana was configured as the visualization platform.
Application and infrastructure logs were inspected.
A controlled backend failure was simulated and successfully recovered.

The test confirmed that the isolated failure did not affect the live application.
