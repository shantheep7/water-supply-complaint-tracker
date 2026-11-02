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

output "dashboard_url" {
  description = "CloudWatch dashboard in the AWS console."
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards/dashboard/${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "log_groups" {
  description = "CloudWatch log groups for the backend, frontend and deployment logs."
  value       = { for key, group in aws_cloudwatch_log_group.app : key => group.name }
}

output "cloudwatch_agent_config_parameter" {
  description = "Parameter Store name holding the CloudWatch Agent configuration."
  value       = aws_ssm_parameter.cloudwatch_agent_config.name
}
