# -----------------------------------------------------------------------------
# Values printed after `terraform apply` (and by `terraform output`).
# -----------------------------------------------------------------------------

output "instance_id" {
  description = "EC2 instance ID (used to start a Session Manager session)."
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IPv4 address. It changes if the instance is stopped and started."
  value       = aws_instance.app.public_ip
}

output "app_url" {
  description = "Website URL once you have started the containers."
  value       = "http://${aws_instance.app.public_dns}"
}

output "session_manager_command" {
  description = "Open a shell on the instance (needs the AWS CLI + Session Manager plugin on your computer)."
  value       = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.aws_region}"
}

output "ami_id" {
  description = "Amazon Linux 2023 AMI the instance was launched from."
  value       = aws_instance.app.ami
}

output "availability_zone" {
  description = "Availability Zone the instance runs in."
  value       = aws_instance.app.availability_zone
}

output "security_group_id" {
  description = "Security group attached to the instance."
  value       = aws_security_group.app.id
}
