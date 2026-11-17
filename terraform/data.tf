# Existing VPC
data "aws_vpc" "main" {
  id = var.vpc_id
}

# Existing subnet
data "aws_subnet" "app_subnet" {
  id = var.subnet_id
}

# Existing IAM instance profile
data "aws_iam_instance_profile" "app_profile" {
  name = var.iam_instance_profile_name
}
