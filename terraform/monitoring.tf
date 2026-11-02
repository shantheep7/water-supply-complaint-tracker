# -----------------------------------------------------------------------------
# Amazon CloudWatch monitoring
#
#   Metrics (free, sent by EC2 itself) --> 2 alarms + the dashboard
#   backend / frontend containers --(Docker "awslogs" driver)--> log groups
#   deploy script output --(CloudWatch Agent)--> deployment log group
#
# Nothing here changes the EC2 instance, its security group or the database.
# The server side (agent install, Docker logging) is done by
# scripts/setup-cloudwatch-logging.sh - see README.md "Monitoring".
# -----------------------------------------------------------------------------

locals {
  log_group_prefix = "/${var.project_name}/${var.environment}"

  log_groups = {
    backend    = "${local.log_group_prefix}/backend"
    frontend   = "${local.log_group_prefix}/frontend"
    deployment = "${local.log_group_prefix}/deployment"
  }

  app_metrics_namespace = "WaterSupply/Application"

  masked_data_identifiers = [
    "arn:aws:dataprotection::aws:data-identifier/IpAddress",
    "arn:aws:dataprotection::aws:data-identifier/EmailAddress",
    "arn:aws:dataprotection::aws:data-identifier/AwsSecretKey",
  ]
}

# -----------------------------------------------------------------------------
# Log groups: 7-day retention keeps storage cost close to zero.
# -----------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "app" {
  for_each = local.log_groups

  name              = each.value
  retention_in_days = var.log_retention_days
}

# Masks IP addresses, e-mail addresses and AWS keys before anyone reads the
# logs (Nginx access lines contain visitor IPs). Charged per GB scanned;
# these logs are a few MB per month, so it costs well under US$0.01.
resource "aws_cloudwatch_log_data_protection_policy" "containers" {
  for_each = toset(["backend", "frontend"])

  log_group_name = aws_cloudwatch_log_group.app[each.key].name

  policy_document = jsonencode({
    Name    = "${local.name_prefix}-${each.key}-pii-masking"
    Version = "2021-06-01"
    Statement = [
      {
        Sid            = "Audit"
        DataIdentifier = local.masked_data_identifiers
        Operation      = { Audit = { FindingsDestination = {} } }
      },
      {
        Sid            = "Redact"
        DataIdentifier = local.masked_data_identifiers
        Operation      = { Deidentify = { MaskConfig = {} } }
      },
    ]
  })
}

# Counts backend log lines at ERROR level (Spring Boot writes
# "<timestamp> ERROR <pid> --- ..."). Only publishes when an error is
# logged, so the custom metric costs nothing on quiet days (max ~US$0.30/month).
resource "aws_cloudwatch_log_metric_filter" "backend_errors" {
  name           = "${local.name_prefix}-backend-errors"
  log_group_name = aws_cloudwatch_log_group.app["backend"].name
  pattern        = "\" ERROR \""

  metric_transformation {
    name      = "BackendErrors"
    namespace = local.app_metrics_namespace
    value     = "1"
    unit      = "Count"
  }
}

# -----------------------------------------------------------------------------
# Alarms (the first 10 alarms per account are free).
# No alarm_actions: nothing is e-mailed or sent to SNS. Add an SNS topic later
# if you want notifications.
# -----------------------------------------------------------------------------

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name        = "WaterSupply-HighCPU"
  alarm_description = "CPU above 80% for 10 minutes (2 x 5-minute periods) on ${aws_instance.app.id}."

  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  dimensions          = { InstanceId = aws_instance.app.id }
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  datapoints_to_alarm = 2
  comparison_operator = "GreaterThanThreshold"
  threshold           = 80

  # A stopped instance sends no data; treat that as OK rather than an alarm.
  treat_missing_data = "notBreaching"
}

resource "aws_cloudwatch_metric_alarm" "ec2_health" {
  alarm_name        = "WaterSupply-EC2-Health"
  alarm_description = "EC2 instance or system status check failed on ${aws_instance.app.id}."

  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed" # 1 if either the instance or the system check fails
  dimensions          = { InstanceId = aws_instance.app.id }
  statistic           = "Maximum"
  period              = 300
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0

  treat_missing_data = "notBreaching"
}

# -----------------------------------------------------------------------------
# Dashboard. It was first created by hand in the console; the import block
# brings it under Terraform instead of creating a duplicate. Its old widgets
# are saved in backup/. The DiskRead/DiskWrite graphs were dropped because
# EC2 only reports them for instance-store disks, so they were always empty
# on this EBS-only instance.
# -----------------------------------------------------------------------------

import {
  to = aws_cloudwatch_dashboard.main
  id = var.dashboard_name
}

locals {
  instance_dimension = ["InstanceId", aws_instance.app.id]

  dashboard_widgets = concat(
    [
      {
        type   = "alarm"
        x      = 0
        y      = 0
        width  = 24
        height = 3
        properties = {
          title  = "Alarm status"
          alarms = [aws_cloudwatch_metric_alarm.ec2_health.arn, aws_cloudwatch_metric_alarm.high_cpu.arn]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 3
        width  = 12
        height = 6
        properties = {
          title   = "CPU utilization (%)"
          region  = var.aws_region
          view    = "timeSeries"
          period  = 300
          stat    = "Average"
          metrics = [concat(["AWS/EC2", "CPUUtilization"], local.instance_dimension, [{ label = "CPU" }])]
          yAxis   = { left = { min = 0, max = 100 } }
          annotations = {
            horizontal = [{ label = "Alarm at 80%", value = 80 }]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 3
        width  = 12
        height = 6
        properties = {
          title  = "Network traffic (bytes per 5 minutes)"
          region = var.aws_region
          view   = "timeSeries"
          period = 300
          stat   = "Sum"
          metrics = [
            concat(["AWS/EC2", "NetworkIn"], local.instance_dimension, [{ label = "In" }]),
            concat(["AWS/EC2", "NetworkOut"], local.instance_dimension, [{ label = "Out" }]),
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 9
        width  = 12
        height = 6
        properties = {
          title  = "EC2 status checks (0 = healthy, 1 = failed)"
          region = var.aws_region
          view   = "timeSeries"
          period = 300
          stat   = "Maximum"
          metrics = [
            concat(["AWS/EC2", "StatusCheckFailed_Instance"], local.instance_dimension, [{ label = "Instance check" }]),
            concat(["AWS/EC2", "StatusCheckFailed_System"], local.instance_dimension, [{ label = "System check" }]),
          ]
          yAxis = { left = { min = 0, max = 1 } }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 9
        width  = 12
        height = 6
        properties = {
          title  = "Backend errors (ERROR log lines per 5 minutes)"
          region = var.aws_region
          view   = "timeSeries"
          period = 300
          # FILL turns "no errors logged" into 0 instead of an empty graph.
          metrics = [
            [{ expression = "FILL(errors, 0)", label = "Errors", id = "total" }],
            [local.app_metrics_namespace, "BackendErrors", { id = "errors", stat = "Sum", visible = false }],
          ]
          yAxis = { left = { min = 0 } }
        }
      },
    ],
    var.enable_host_metrics ? [
      {
        type   = "metric"
        x      = 0
        y      = 15
        width  = 24
        height = 6
        properties = {
          title  = "Memory and disk used (%)"
          region = var.aws_region
          view   = "timeSeries"
          period = 300
          stat   = "Average"
          metrics = [
            concat(["CWAgent", "mem_used_percent"], local.instance_dimension, [{ label = "Memory" }]),
            concat(["CWAgent", "disk_used_percent"], local.instance_dimension, ["path", "/", "device", "nvme0n1p1", "fstype", "xfs", { label = "Disk /" }]),
          ]
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
    ] : [],
  )
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = var.dashboard_name
  dashboard_body = jsonencode({ widgets = local.dashboard_widgets })
}

# -----------------------------------------------------------------------------
# CloudWatch Agent configuration, stored in Parameter Store (standard tier,
# free). The agent only tails the deployment log; container logs go through
# Docker's awslogs driver. With enable_host_metrics = false it sends no
# metrics, so there are no custom-metric charges.
# -----------------------------------------------------------------------------

locals {
  cloudwatch_agent_config = merge(
    {
      agent = {
        metrics_collection_interval = 300
        run_as_user                 = "root" # needed to read /var/log/water-supply
      }
      logs = {
        force_flush_interval = 15
        logs_collected = {
          files = {
            collect_list = [
              {
                file_path       = "/var/log/water-supply/deploy.log"
                log_group_name  = local.log_groups["deployment"]
                log_stream_name = "{instance_id}"
                # The timer checks for new images every minute. Skip the routine
                # "nothing changed" lines and image-pull progress so the log
                # group shows real deployments and errors.
                filters = [
                  { type = "exclude", expression = "^(Checking Water Supply Tracker for updates\\.\\.\\.|No new images found\\. Application unchanged\\.)$" },
                  { type = "exclude", expression = "(Pulling|Pulled|Pull complete|Waiting|Downloading|Download complete|Verifying Checksum|Extracting|Already exists)" },
                ]
              },
            ]
          }
        }
      }
    },
    var.enable_host_metrics ? {
      metrics = {
        namespace         = "CWAgent"
        append_dimensions = { InstanceId = "$${aws:InstanceId}" }
        metrics_collected = {
          mem  = { measurement = ["mem_used_percent"] }
          disk = { measurement = ["used_percent"], resources = ["/"], drop_device = false }
        }
      }
    } : {},
  )
}

resource "aws_ssm_parameter" "cloudwatch_agent_config" {
  name        = "AmazonCloudWatch-${local.name_prefix}"
  description = "CloudWatch Agent configuration for ${local.name_prefix} (no secrets)."
  type        = "String"
  tier        = "Standard"
  value       = jsonencode(local.cloudwatch_agent_config)
}

# -----------------------------------------------------------------------------
# IAM: lets the instance write to its own log groups and read the agent
# configuration - nothing else. Added as a separate inline policy, so the
# instance and its existing Session Manager policy are not touched.
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "cloudwatch" {
  statement {
    sid = "WriteOwnLogGroups"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
    ]
    resources = flatten([
      for group in aws_cloudwatch_log_group.app : [group.arn, "${group.arn}:*"]
    ])
  }

  statement {
    sid       = "ReadAgentConfig"
    actions   = ["ssm:GetParameter"]
    resources = [aws_ssm_parameter.cloudwatch_agent_config.arn]
  }

  dynamic "statement" {
    for_each = var.enable_host_metrics ? [1] : []

    content {
      sid       = "PublishAgentMetrics"
      actions   = ["cloudwatch:PutMetricData"]
      resources = ["*"] # PutMetricData has no resource-level permissions

      condition {
        test     = "StringEquals"
        variable = "cloudwatch:namespace"
        values   = ["CWAgent"]
      }
    }
  }
}

resource "aws_iam_role_policy" "cloudwatch" {
  name   = "cloudwatch-logs-minimal"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.cloudwatch.json
}
