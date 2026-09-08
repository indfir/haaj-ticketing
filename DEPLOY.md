# Deployment Guide — Tencent Cloud Lighthouse

## Prerequisites

- Tencent Cloud Lighthouse instance (Ubuntu)
- Domain `tiket.indfir.com` pointing to server IP (43.133.141.113)
- SSH access to server

## Step 1: Connect to Server

```bash
ssh ubuntu@43.133.141.113
```

## Step 2: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

## Step 3: Clone Project

```bash
cd /home/ubuntu
git clone <your-repo-url> haaj-ticketing
cd haaj-ticketing
```

## Step 4: Configure Environment

```bash
# Generate secrets
openssl rand -base64 32  # Run twice, copy both values

# Create production env file
nano .env

# Paste this (replace with your values):
POSTGRES_PASSWORD=your_secure_postgres_password
NEXTAUTH_URL=https://tiket.indfir.com
NEXTAUTH_SECRET=first_openssl_output
HMAC_SECRET=second_openssl_output
RESEND_API_KEY=  # Optional, for email
EMAIL_FROM=noreply@tiket.indfir.com
```

## Step 5: Build & Start

```bash
# Build and start containers
docker compose up -d --build

# Check logs
docker compose logs -f app
```

## Step 6: Run Database Migrations

```bash
# Run migrations inside the app container
docker compose exec app npx prisma migrate deploy

# Seed database (optional, for initial data)
docker compose exec app npm run db:seed
```

## Step 7: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/tiket.indfir.com

# Paste:
server {
    listen 80;
    server_name tiket.indfir.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/tiket.indfir.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d tiket.indfir.com

# Auto-renewal is setup automatically
```

## Step 9: Firewall Configuration

```bash
# Open ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Step 10: Verify

Visit https://tiket.indfir.com

Default admin credentials (change after first login!):
- Email: admin@haaj.id
- Password: admin123

## Maintenance Commands

```bash
# View logs
docker compose logs -f app

# Restart app
docker compose restart app

# Update app
git pull
docker compose up -d --build

# Backup database
docker compose exec postgres pg_dump -U haaj haaj_ticketing > backup.sql

# Restore database
cat backup.sql | docker compose exec -T postgres psql -U haaj haaj_ticketing
```

## Auto-Start on Reboot

Docker containers are set to `restart: unless-stopped`, so they auto-start on server reboot.
