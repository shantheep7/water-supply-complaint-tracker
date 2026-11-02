#!/bin/bash
# -----------------------------------------------------------------------------
# Server-side CloudWatch logging setup for the Water Supply Tracker.
# Run it on the EC2 instance AFTER `terraform apply` created the log groups,
# the agent configuration and the IAM permissions (see README.md "Monitoring").
#
#   sudo bash setup-cloudwatch-logging.sh                # logs start at the next deployment
#   sudo bash setup-cloudwatch-logging.sh --restart-now  # restart backend + frontend now (~30 s blip)
#
# Safe to run more than once. It never touches MySQL, Docker volumes or .env,
# and it restarts no containers unless you pass --restart-now.
# -----------------------------------------------------------------------------
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-southeast-2}"
LOG_GROUP_PREFIX="${LOG_GROUP_PREFIX:-/water-supply-tracker/dev}"
AGENT_CONFIG_PARAM="${AGENT_CONFIG_PARAM:-AmazonCloudWatch-water-supply-tracker-dev}"
APP_DIR=/opt/water-supply
DEPLOY_LOG=/var/log/water-supply/deploy.log
AGENT_CTL=/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl

if [[ $EUID -ne 0 ]]; then
  echo "Please run with sudo." >&2
  exit 1
fi

echo "=== 1/4 Install the CloudWatch Agent (Amazon Linux package) ==="
if ! rpm -q amazon-cloudwatch-agent >/dev/null 2>&1; then
  dnf -y install amazon-cloudwatch-agent
fi
rpm -q amazon-cloudwatch-agent

echo "=== 2/4 Write the deploy script's output to $DEPLOY_LOG ==="
mkdir -p "$(dirname "$DEPLOY_LOG")"
chmod 750 "$(dirname "$DEPLOY_LOG")"
mkdir -p /etc/systemd/system/water-supply-deploy.service.d
cat > /etc/systemd/system/water-supply-deploy.service.d/cloudwatch-logging.conf <<EOF
# Added by setup-cloudwatch-logging.sh: the CloudWatch Agent ships this file.
[Service]
StandardOutput=append:$DEPLOY_LOG
StandardError=inherit
EOF
cat > /etc/logrotate.d/water-supply <<EOF
$DEPLOY_LOG {
    daily
    rotate 7
    missingok
    notifempty
    compress
    delaycompress
}
EOF
# Only reloads unit files; the timer's next run (within a minute) uses the new output.
systemctl daemon-reload

echo "=== 3/4 Start the CloudWatch Agent with the config from Parameter Store ==="
"$AGENT_CTL" -a fetch-config -m ec2 -s -c "ssm:$AGENT_CONFIG_PARAM"
"$AGENT_CTL" -a status

echo "=== 4/4 Send backend and frontend container logs to CloudWatch ==="
# Docker Compose merges docker-compose.override.yml automatically, so the
# original docker-compose.yml stays as Terraform wrote it. MySQL is left alone.
cat > "$APP_DIR/docker-compose.override.yml" <<EOF
# Added by setup-cloudwatch-logging.sh: container logs go to CloudWatch Logs.
# 'docker logs' keeps working - Docker also keeps recent lines locally.
services:
  backend:
    logging:
      driver: awslogs
      options:
        awslogs-region: $AWS_REGION
        awslogs-group: $LOG_GROUP_PREFIX/backend
        awslogs-stream: backend
        # keep a Java stack trace together with the log line that started it
        awslogs-multiline-pattern: '^\d{4}-\d{2}-\d{2}T'
        # never slow the app down if CloudWatch is unreachable
        mode: non-blocking
        max-buffer-size: 4m
  frontend:
    logging:
      driver: awslogs
      options:
        awslogs-region: $AWS_REGION
        awslogs-group: $LOG_GROUP_PREFIX/frontend
        awslogs-stream: frontend
        mode: non-blocking
        max-buffer-size: 4m
EOF
chmod 600 "$APP_DIR/docker-compose.override.yml"
(cd "$APP_DIR" && docker compose config --quiet) # syntax check, prints nothing

if [[ "${1:-}" == "--restart-now" ]]; then
  echo "Recreating backend and frontend so the new logging takes effect..."
  (cd "$APP_DIR" && docker compose up -d --no-deps frontend backend)
else
  echo "Container logs start at the next automatic deployment (next push to main),"
  echo "or run this script again with --restart-now."
fi

echo "=== Done ==="
docker ps --format '{{.Names}}: {{.Status}}'
