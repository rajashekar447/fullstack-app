# Terraform Infrastructure

## Overview

This configuration describes the AWS infrastructure used by the three-service application in ap-south-1 (Mumbai).

It covers:
- Existing EC2 application server
- Existing VPC and subnet
- Application security group
- Backend, frontend and notifications ECR repositories
- Existing EC2 IAM instance profile, referenced as a data source

**Important:** This is an existing-infrastructure configuration, not a fresh-environment deployment guide. Import existing managed resources into Terraform state before managing them from a new checkout. Review every plan before applying.

The IAM role and instance profile are not created by this configuration.

## Files

| File | Purpose |
|---|---|
| versions.tf | Terraform and AWS provider requirements |
| variables.tf | Configurable values |
| data.tf | Looks up the VPC, subnet and IAM profile |
| ec2.tf | EC2 instance configuration |
| security_group.tf | Security group and ingress rules |
| ecr.tf | Three ECR repositories |
| outputs.tf | Infrastructure IDs and repository URLs |
| terraform.tfvars.example | Example variable values |

## Prerequisites

- Terraform 1.12 or later
- AWS CLI and authorized AWS credentials
- Permissions to describe and manage the required AWS resources
- Access to the existing VPC, subnet, EC2 instance, security group and ECR repositories

## Configure variables

From the repository root:

    cp terraform/terraform.tfvars.example terraform/terraform.tfvars

Edit terraform/terraform.tfvars with the correct VPC, subnet, IAM instance profile and approved network CIDRs. Do not commit this file.

## Initialize and validate

Run these commands from the terraform directory:

    cd terraform
    terraform init
    terraform fmt -recursive
    terraform validate

## Existing infrastructure and state

A new checkout has no Terraform state. Import existing resources only after confirming resource addresses, AWS IDs, credentials and state location.

After importing, run:

    terraform state list
    terraform plan

Review the complete plan. Do not apply unexpected replacements or deletions.

## Outputs

    terraform output

## Safety and cleanup

- Keep Terraform state and plan files private.
- Never commit .tfstate, .tfvars, .tfplan or AWS credentials.
- Do not run terraform destroy against the existing application environment.
- Back up state securely before state operations.
