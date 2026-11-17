output "ec2_instance_id" {
  description = "Existing application EC2 instance ID"
  value       = aws_instance.app_server.id
}

output "ec2_public_ip" {
  description = "Public IP address of the application server"
  value       = aws_instance.app_server.public_ip
}

output "ec2_private_ip" {
  description = "Private IP address of the application server"
  value       = aws_instance.app_server.private_ip
}

output "vpc_id" {
  description = "Existing VPC ID"
  value       = data.aws_vpc.main.id
}

output "subnet_id" {
  description = "Existing application subnet ID"
  value       = data.aws_subnet.app_subnet.id
}

output "security_group_id" {
  description = "Existing application security group ID"
  value       = aws_security_group.app_sg.id
}

output "iam_instance_profile" {
  description = "Existing EC2 IAM instance profile"
  value       = data.aws_iam_instance_profile.app_profile.name
}

output "backend_ecr_repository_url" {
  description = "Existing backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repository_url" {
  description = "Existing frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "notifications_ecr_repository_url" {
  description = "Third microservice ECR repository URL"
  value       = aws_ecr_repository.notifications.repository_url
}
