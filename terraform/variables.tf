variable "aws_region" {
  description = "AWS region for the infrastructure"
  type        = string
  default     = "ap-south-1"
}


variable "vpc_id" {
  description = "Existing VPC ID"
  type        = string
  default     = "vpc-0fb4c7cd254081b46"
}

variable "subnet_id" {
  description = "Existing subnet ID"
  type        = string
  default     = "subnet-082c81bb2c51f2c48"
}

variable "iam_instance_profile_name" {
  description = "Existing EC2 IAM instance profile"
  type        = string
  default     = "Microservices-EC2-ECR-Pull-Role"
}

variable "backend_repository_name" {
  description = "Backend ECR repository name"
  type        = string
  default     = "task-manager-backend"
}

variable "frontend_repository_name" {
  description = "Frontend ECR repository name"
  type        = string
  default     = "task-manager-frontend"
}

variable "third_repository_name" {
  description = "Notifications ECR repository name"
  type        = string
  default     = "task-manager-notifications"
}

variable "admin_cidr" {
  description = "Administrator public IP in CIDR notation, for example 203.0.113.10/32"
  type        = string
}

variable "jenkins_allowed_cidr" {
  description = "Trusted CIDR allowed to access Jenkins on port 8080"
  type        = string
}
