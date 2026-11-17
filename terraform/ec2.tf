resource "aws_instance" "app_server" {
  ami                    = "ami-0c7632fb77f35db43"
  instance_type          = "c7i-flex.large"
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = var.iam_instance_profile_name

  tags = {
    Name        = "Terraform-Microservices-Server"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }

  lifecycle {
    ignore_changes = [
      ami,
      instance_type,
      subnet_id,
      vpc_security_group_ids,
      iam_instance_profile,
      tags
    ]
  }
}
