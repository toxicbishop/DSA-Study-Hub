# EC2 HTTPS Deployment — Full Playbook

**Project:** DSA Study Hub (Next.js + Express + Docker)

**Outcome:** `https://dsa-temp.duckdns.org` serving the full stack with a valid Let's Encrypt certificate.

---

## PHASE 1 — EC2 INSTANCE SETUP

1. Launched Ubuntu 24.04 EC2 instance (t3.micro, 1 GB RAM)
2. Created security group with SSH (port 22) inbound
3. Connected via MobaXterm using the `.pem` key file

   - Session > SSH > Remote host = EC2 IP
   - Username = `ubuntu` (or `root`)
   - Advanced SSH settings > Use private key > browse `.pem`

---

## PHASE 2 — SYSTEM PREP

### 4. Updated packages

```bash
apt update && apt upgrade -y
```

### 5. Installed Docker + Compose v2 from Docker's official repo

Ubuntu's default repo was missing `docker-compose-plugin`.

```bash
apt install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu noble stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update

apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
```

### 6. Verified Docker

```bash
docker run --rm hello-world
```

---

## PHASE 3 — PROJECT UPLOAD

### 7. Uploaded the project via MobaXterm's SFTP pane

Destination:

```text
/root/DSA-with-tsx
```

Excluded:

- `node_modules`
- `.next`
- `.git`

---

## PHASE 4 — BACKEND (DOCKER CONTAINERS)

### 8. Created MongoDB Atlas free cluster

Connection string:

```text
mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dsahub?...
```

### 9. Generated 4 secrets

Run 4 times:

```bash
openssl rand -hex 32
```

### 10. Got EC2 public IP

```bash
curl ifconfig.me
```

Example:

```text
13.49.222.250
```

### 11. Created `server/.env.prod`

```env
MONGO_URI=<mongo atlas url>

JWT_SECRET=<hex 1>
SESSION_SECRET=<hex 2>
ADMIN_JWT_SECRET=<hex 3>
COOKIE_SECRET=<hex 4>

ADMIN_PASSWORD=<strong password>

API_KEY=my-frontend-key-123

ALLOWED_ORIGINS=http://13.49.222.250
FRONTEND_URL=http://13.49.222.250

GOOGLE_CLIENT_ID=
```

### 12. Built and started containers

```bash
cd /root/DSA-with-tsx

docker compose -f docker-compose.prod.yml up -d --build
```

Containers launched:

- `dsa-api` (Express API) on port `5001`
- `dsa-executor` (sandboxed C/C++/Java/Python runner) on internal port `6000`

### 13. Verified backend

```bash
docker compose -f docker-compose.prod.yml ps

curl http://localhost:5001/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

## PHASE 5 — FRONTEND (NEXT.JS VIA PM2)

### 14. Added 2 GB swap

`t3.micro` with 1 GB RAM wasn't enough for Next.js build.

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 15. Installed Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

apt install -y nodejs
```

### 16. Created frontend `.env`

```env
NEXT_PUBLIC_API_URL=http://13.49.222.250:5001

NEXT_PUBLIC_API_KEY=my-frontend-key-123

NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client id>
NEXT_PUBLIC_GITHUB_CLIENT_ID=<client id>
```

### 17. Installed dependencies and built

```bash
npm ci

npm run build
```

### 18. Installed PM2 and enabled startup

```bash
npm install -g pm2

pm2 start "npm run start" --name dsa-frontend

pm2 save

pm2 startup systemd -u root --hp /root
```

Run the command PM2 prints afterward.

### 19. Opened ports temporarily

- 3000
- 5001

in the AWS Security Group.

### 20. Verified frontend

```text
http://13.49.222.250:3000
```

---

## PHASE 6 — HTTPS WITH CADDY + DUCKDNS

### Why?

Let's Encrypt won't issue certificates for raw IP addresses. A hostname was required, so DuckDNS was used.

### 21. Registered DuckDNS hostname

```text
dsa-temp.duckdns.org
```

Pointed it to:

```text
13.49.222.250
```

### 22. Opened ports

```text
80  HTTP
443 HTTPS
```

Port 80 is needed for Let's Encrypt validation fallback.

### 23. Installed Caddy

```bash
apt install -y debian-keyring debian-archive-keyring \
  apt-transport-https curl

curl -1sLf \
  'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor \
  -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf \
  'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | tee /etc/apt/sources.list.d/caddy-stable.list

apt update

apt install -y caddy
```

### 24. Resolved port 80 conflict

Nginx was occupying port 80.

```bash
systemctl stop nginx

systemctl disable nginx
```

### 25. Created `/etc/caddy/Caddyfile`

```caddy
dsa-temp.duckdns.org {
    encode gzip

    handle /api/* {
        reverse_proxy localhost:5001
    }

    handle /uploads/* {
        reverse_proxy localhost:5001
    }

    handle /auth/callback* {
        reverse_proxy localhost:5001
    }

    handle {
        reverse_proxy localhost:3000
    }
}
```

Validate and restart:

```bash
caddy validate --config /etc/caddy/Caddyfile

systemctl restart caddy
```

### 26. Certificate issuance

Caddy automatically fetched a Let's Encrypt certificate.

- HTTP-01 challenge timed out
- TLS-ALPN-01 fallback succeeded

Look for:

```text
certificate obtained successfully
```

### 27. Updated frontend API URL

```env
NEXT_PUBLIC_API_URL=https://dsa-temp.duckdns.org
```

No `:5001` required because Caddy routes `/api/*` internally.

### 28. Rebuilt frontend

```bash
cd /root/DSA-with-tsx

npm run build

pm2 restart dsa-frontend
```

### 29. Updated backend CORS

```env
ALLOWED_ORIGINS=https://dsa-temp.duckdns.org

FRONTEND_URL=https://dsa-temp.duckdns.org
```

### 30. Restarted API

```bash
docker compose -f docker-compose.prod.yml restart api
```

### 31. Verified deployment

```text
https://dsa-temp.duckdns.org
```

Valid certificate and full application working.

---

# FINAL ARCHITECTURE

```text
Browser (HTTPS)
      |
      v
  Caddy :443
      |
      +-- /api/*          --> Docker :5001 (Express API)
      |                          |
      |                          +--> :6000 (sandboxed executor)
      |
      +-- /uploads/*      --> Docker :5001
      |
      +-- /auth/callback  --> Docker :5001
      |
      +-- /               --> PM2 :3000 (Next.js frontend)

External service:
  MongoDB Atlas (managed)
```

---

# FINAL SECURITY GROUP RULES

```text
22   SSH    (my IP only)
80   HTTP   (0.0.0.0/0)
443  HTTPS  (0.0.0.0/0)
```

Removed after Caddy went live:

```text
3000
5001
```

---

# RESTART / SHUTDOWN TIPS

## Stop instance to save money

```text
EC2 Console
→ Instance State
→ Stop
```

## If EC2 public IP changes

1. Update DuckDNS with the new IP.
2. Everything auto-starts:

```text
Docker containers  (restart: unless-stopped)
PM2 frontend       (pm2 startup)
Caddy              (systemd enabled)
```

Because frontend uses the hostname, no rebuild is required.

### Better option

Attach an Elastic IP to avoid updating DuckDNS.

---

# KEY COMMANDS CHEAT SHEET

## Backend

```bash
docker compose -f docker-compose.prod.yml ps

docker compose -f docker-compose.prod.yml logs -f api

docker compose -f docker-compose.prod.yml restart api

docker compose -f docker-compose.prod.yml up -d --build
```

## Frontend

```bash
pm2 status

pm2 logs dsa-frontend

pm2 restart dsa-frontend
```

Rebuild after `NEXT_PUBLIC_*` changes:

```bash
cd /root/DSA-with-tsx

npm run build

pm2 restart dsa-frontend
```

## Caddy

```bash
systemctl status caddy --no-pager

journalctl -u caddy -f

systemctl reload caddy
```

## System Resources

```bash
free -h

df -h

docker stats
```

---

# KEY SKILLS LEARNED

- EC2 provisioning and Security Groups
- SSH and SFTP via MobaXterm
- Docker and Docker Compose deployments
- Environment variable management
- Next.js production builds on low-memory servers using swap
- PM2 process supervision
- Caddy reverse proxy and automatic HTTPS
- Let's Encrypt ACME challenge methods
- Dynamic DNS using DuckDNS
- CORS debugging
- Linux resource and service management

---

**End of Notes**