# Terraform: AWS infrastructure for the Water Supply Complaint Tracker

This folder describes, as code, a small and secure AWS setup for running the app's Docker images on one EC2 server. Nothing here has been applied yet. Running `terraform apply` is what creates resources and starts AWS charges.

```
            Internet
               │  HTTP :80, only from allowed_http_cidrs
               ▼
   ┌──────────── VPC 10.20.0.0/16 ─────────────────────────────┐
   │  Public subnet 10.20.1.0/24                               │
   │  ┌───────── EC2 t3.small, Amazon Linux 2023 ───────────┐  │
   │  │  Docker                                              │  │
   │  │   frontend (Nginx :80) ──▶ backend (:8080) ──▶ db (:3306)│
   │  │                ▲ published     internal only  internal │
   │  │  Encrypted gp3 root volume (OS + images + MySQL data)  │  │
   │  └────────────────────────────────────────────────────────┘│
   └───────────────────────────────────────────────────────────┘
   You ──(AWS Systems Manager Session Manager)──▶ shell on EC2   (no SSH port)
```

## What gets created

| Resource | Why | Cost |
|---|---|---|
| VPC, public subnet, internet gateway, route table | Private network for the project; the gateway gives the server internet access | Free |
| Security group (firewall) | Inbound: only port 80 from your chosen IPs. Outbound: only 80/443 | Free |
| IAM role + instance profile | Lets the server talk to Session Manager. Nothing else | Free |
| EC2 instance `t3.small` (x86_64) | Runs the three containers | Billed hourly |
| 20 GiB gp3 EBS volume, encrypted | Disk for the OS, Docker images and MySQL data | Billed per GiB-month |
| Public IPv4 address | Needed to reach the site and to pull images | Billed hourly |

Deliberately **not** created, either to save money or to keep things simple:
- NAT gateway (about US$32+/month)
- load balancer (about US$16+/month)
- RDS database (about US$15+/month)
- VPC endpoints (about US$7/month each)
- Elastic IP

---

## The files, explained

| File | What it does |
|---|---|
| `providers.tf` | Says which Terraform and AWS plugin versions to use (`hashicorp/aws ~> 6.0`, currently 6.71.0), and connects to AWS in **your chosen region**. Adds the tags `Project`, `Environment`, `Owner` and `ManagedBy=Terraform` to every resource automatically. Contains **no credentials**: Terraform reads them from your AWS CLI login. |
| `variables.tf` | The "settings" of this setup, each with a description. `aws_region` and `allowed_http_cidrs` have no default, so you must choose them. Built-in checks stop mistakes early: the region must look like a region code, the CIDRs must be valid, and ARM instance types like `t4g` are rejected (your images are amd64). |
| `main.tf` | The infrastructure itself, in order: lookups (latest Amazon Linux 2023 AMI from SSM Parameter Store, and which Availability Zones offer the instance type), network, security group, IAM, then the EC2 instance. Comments explain each block. |
| `user_data.sh.tftpl` | A script the server runs **once at first boot**. It installs security updates and Docker, installs a pinned, checksum-verified Docker Compose, adds 2 GiB of swap, and writes `/opt/water-supply/docker-compose.yml` plus `.env.example`. It contains no secrets and **does not start the app**. Terraform fills in the image names (`.tftpl` = template). |
| `outputs.tf` | What Terraform prints after `apply`: instance ID, public IP, website URL and the exact Session Manager command. |
| `terraform.tfvars.example` | A template for your settings. Copy it to `terraform.tfvars` (git-ignored) and edit. |
| `.gitignore` | Keeps state files, real `.tfvars`, plan files and the `.terraform/` plugin folder out of Git. `.terraform.lock.hcl` **should** be committed: it pins the provider version. |
| `.terraform.lock.hcl` | Created by `terraform init`. Records the exact AWS provider version and its checksums. |

### Key decisions in plain English

- **Amazon Linux 2023 AMI from SSM Parameter Store.** AWS publishes the ID of the newest AMI at `/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64`. Terraform reads it, so you never copy AMI IDs by hand. `ignore_changes = [ami]` stops Terraform from *replacing your server* (and deleting the database) every time AWS publishes a newer AMI. Patch in place with `sudo dnf upgrade` instead.
- **x86_64 is checked twice.** A variable check blocks Graviton types, and a `precondition` asks AWS whether the instance type supports `x86_64`. The precondition runs during `plan`.
- **Session Manager instead of SSH.** There is no port 22, no SSH key to lose, and every session is authorised by your AWS login. The IAM policy allows only the five actions Session Manager needs, no S3, Parameter Store or Run Command. If you later want Patch Manager or Run Command, attach the AWS-managed `AmazonSSMManagedInstanceCore` policy instead.
- **IMDSv2 required, hop limit 1.** The server's temporary AWS credentials can only be read with a session token, which blocks SSRF attacks, and containers can't reach them at all.
- **Encrypted EBS.** Uses the free AWS-managed `aws/ebs` key. `delete_on_termination = true` means **`terraform destroy` deletes your database**. Back it up first (see below).
- **Outbound traffic limited to 80/443.** That's all the server needs: package repos, GHCR, Docker Hub and Systems Manager all use HTTPS.

---

## Estimated monthly cost

These are approximate on-demand list prices for Linux, running 24×7 (730 hours). Prices change; check the [AWS Pricing Calculator](https://calculator.aws/) for your region before applying.

| Item | ap-south-1 (Mumbai) | us-east-1 (N. Virginia) |
|---|---|---|
| EC2 `t3.small` (~$0.0224 / ~$0.0208 per hour) | ~US$16.40 | ~US$15.20 |
| EBS gp3 20 GiB (~$0.0912 / ~$0.08 per GiB-month) | ~US$1.80 | ~US$1.60 |
| Public IPv4 address ($0.005 per hour) | ~US$3.65 | ~US$3.65 |
| Data transfer out (first 100 GB/month free across your account) | ~US$0 | ~US$0 |
| VPC, subnet, IGW, security group, IAM, Session Manager | Free | Free |
| **Total, running all month** | **≈ US$22/month** | **≈ US$20.5/month** |

**How to keep it low:**
- **Stop the instance when you're not demoing it.** While stopped you pay only for EBS (~US$1.80/month). The automatically assigned public IP is released, so there's no IPv4 charge, but you get a **new IP** when you start it again.
- **`t3.micro`** (1 GiB RAM) is roughly half the price. It might run with the 2 GiB swap, but it will be slow; `t3.small` is the recommended minimum.
- **Free Tier:** what's free depends on when your AWS account was created. Accounts created after 15 July 2025 get credits instead of the old 750 hours of `t2/t3.micro`. Check *Billing → Free Tier* in the console; don't assume this setup is free.
- **Budget alert:** before applying, create one in the console (*Billing → Budgets*, e.g. US$10/month with email alerts). It isn't created here, because these files only touch the project's own resources.

**Charges that can surprise beginners:**
- leaving the instance running
- forgetting to `terraform destroy`
- EBS snapshots you create for backups (~US$0.05/GiB-month)
- data transfer above 100 GB/month
- changing to a bigger instance type

---

## Deploying (only after you approve; these commands create AWS resources)

### 0. Prerequisites on your Mac

- Terraform ≥ 1.6. ✓ You have v1.17.1.
- AWS CLI v2. ✓ You have it.
- Session Manager plugin: `brew install --cask session-manager-plugin`.
- AWS credentials. Prefer IAM Identity Center (`aws configure sso`) or an IAM user with limited rights. **Never use root account keys.** Check with `aws sts get-caller-identity`.

### 1. Create your settings file

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
curl -s https://checkip.amazonaws.com      # your public IP → put it in allowed_http_cidrs as x.x.x.x/32
```

### 2. Preview, then create

```bash
terraform init
terraform plan -out=tfplan        # shows exactly what will be created; no changes yet
terraform apply tfplan            # creates the resources and starts billing
```

The first boot takes 2–4 minutes to install Docker.

### 3. Open a shell on the server (no SSH)

```bash
$(terraform output -raw session_manager_command)
sudo tail -n 5 /var/log/water-supply-setup.log    # should end with "Host setup finished"
```

### 4. Create the secrets file on the server

```bash
cd /opt/water-supply
sudo cp .env.example .env && sudo chmod 600 .env
openssl rand -base64 24 | tr -d '/+='             # run twice: one password for the app, one for root
sudo nano .env                                     # paste the two passwords; set APP_SEED_SAMPLE_DATA=true for demo data
```

The passwords only ever exist on the server, never in Git, Terraform or the user-data script.

### 5. Pull the images and start the app

```bash
sudo docker compose pull
sudo docker compose up -d
sudo docker compose ps                             # all three should be "running"/"healthy"
```

Then open the `app_url` output in your browser.

**Updating to a new image version:** run `sudo docker compose pull && sudo docker compose up -d`.

### Using private GHCR images

Right now both images can be pulled anonymously, so they are **public**. If you make them private (GitHub → Packages → package settings → visibility), the server has to log in before pulling:

1. On GitHub, create a **classic** personal access token with **only** the `read:packages` scope and a short expiry, e.g. 30 days. GHCR doesn't accept fine-grained tokens for pulling. Don't give it `write:packages` or `repo`.
2. On the server, type the token in yourself. Never put it in a command line, a file in Git, Terraform variables or user data:
   ```bash
   sudo docker login ghcr.io -u shantheep7 --password-stdin   # paste the token, press Enter, then Ctrl-D
   sudo docker compose pull
   sudo docker logout ghcr.io                                  # removes the stored token
   ```
   `docker login` stores the token **unencrypted** (base64) in `/root/.docker/config.json`. That's why you log out after pulling.
3. A more automated setup would keep the token in AWS Secrets Manager (~US$0.40/month) and give the instance role permission to read just that one secret. That's a good next learning step, but it isn't included here.

### Backups and teardown

```bash
# On the server: dump the database to a file
sudo docker compose exec db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" water_supply_tracker' > backup.sql

# On your Mac: delete everything Terraform created (this also deletes the database)
terraform destroy
```

### Later: remote state

`terraform.tfstate` stays on your Mac and is git-ignored. It holds resource IDs and IP addresses, not passwords, but treat it as private. For team use, move it to an S3 bucket with versioning and encryption, using a `backend "s3"` block with `use_lockfile = true` (costs cents per month).

---

## Security review of the existing project

What's already good:
- `.env` files are git-ignored and were never committed. ✓
- Compose doesn't publish MySQL or Spring Boot ports. ✓
- CI uses `permissions: contents: read`, and publishing only runs after CI succeeds on a push to `main`. ✓
- `.dockerignore` keeps `.env` out of the images. ✓

| # | Finding | Risk | Recommendation |
|---|---|---|---|
| 1 | **The API has no authentication.** Admin actions (assign team, change status) are open to anyone who can reach port 80. The admin login is only checked in the browser, with a demo code in public source code. | **High** once on the internet | Keep `allowed_http_cidrs` limited to your own IP until you add Spring Security (for example JWT login with admin-only `PATCH` endpoints). |
| 2 | ~~**The published frontend image runs in localStorage mode, not API mode.**~~ **Fixed locally:** the frontend `Dockerfile` now defaults to `VITE_DATA_SOURCE=api` (use `--build-arg VITE_DATA_SOURCE=local` for a demo-only image). | Functional | Commit and push the Dockerfile so CI publishes a new `:latest` image, then run `docker compose pull` on the server. |
| 3 | **A development DB password is committed in a public repo.** `Wst#Dev2026` appears as the fallback in `application.properties`, and in `setup.sql` and the README. | Medium | Never use it outside local development (the Compose setups already override it). Remove the fallback (`${DB_PASSWORD}` with no default) so a missing password fails at startup instead of silently using a known one. |
| 4 | **HTTP only, no HTTPS.** Traffic, including resident names and phone numbers, travels unencrypted. | Medium | For a real deployment: a domain plus Caddy or Certbot (Let's Encrypt, free) and port 443 in the security group, or CloudFront in front. |
| 5 | **Sample data seeding is on by default** (`app.seed-sample-data=true`). | Low | The production Compose file here sets it to `false` unless `APP_SEED_SAMPLE_DATA=true` is in `.env`. |
| 6 | **The backend container runs as root.** The `eclipse-temurin` image's default user is root. | Low–Medium | Add a non-root user in the backend `Dockerfile` (`RUN useradd -r app` + `USER app`). For the frontend, consider `nginxinc/nginx-unprivileged`. |
| 7 | **`:latest` image tags.** You can't tell which build is running, and rollbacks are hard. | Low | Also tag images with the commit SHA in `docker-publish.yml`, and deploy that tag or digest. |
| 8 | **GitHub Actions pinned to major versions** (`@v5`), not commit SHAs. | Low | Pin third-party actions (`docker/*`) to full commit SHAs, and let Dependabot update them. |
| 9 | **`ddl-auto=update` in production.** Hibernate changes the schema automatically. | Low | Fine for a college project. For production, use `validate` with a migration tool such as Flyway. |
| 10 | **Java version mismatch.** `pom.xml` targets Java 17, while CI and Docker use Java 21. | Info | Works, because 17 bytecode runs on 21. Set `<java.version>21</java.version>` if you want Java 21 language features. |
