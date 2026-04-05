FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name livetrack.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name livetrack.com;
    root /usr/share/nginx/html;
    index index.html;

    # SSL configuration (certificates should be mounted or generated)
    ssl_certificate /etc/ssl/certs/livetrack.crt;
    ssl_certificate_key /etc/ssl/private/livetrack.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
EXPOSE 80 443
