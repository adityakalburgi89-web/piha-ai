# Piha AI — Production Deployment Guide

## Environment Prerequisites
- Node.js >= 20.0.0
- Docker & Docker Compose
- Supabase PostgreSQL Cluster

## Quick Deploy Command
```bash
docker build -t piha-ai-agent:latest .
docker run -d -p 3000:3000 --env-file .env piha-ai-agent:latest
```

## Health Verification
```bash
curl http://localhost:3000/health
```
