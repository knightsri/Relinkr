# Docker Setup for Relinkr

This document describes how to run the Relinkr application using Docker containers.

## Quick Start

### Step 1: Setup Authentication (One-Time)
```bash
cd /path/to/Relinkr
cp apps/client/.env.example apps/client/.env.local
# Edit .env.local with your GitHub/Google OAuth credentials
```

### Step 2: Deploy with Docker
```bash
# Build and run (OAuth credentials automatically sync)
docker-compose up --build
```

### Step 3: Access the application
- Open http://localhost:3000 in your browser
- Redis is available at localhost:6379

**🔍 How Environment Variables Work:**
- You set OAuth credentials in `.env.local` (developer-focused file)
- Docker automatically copies them to `.env.docker` (container-runtime file)
- Docker Compose loads `.env.docker` for the running containers
- Only `.env.docker` is generated at runtime (never committed to git)

## Architecture

The application consists of two containers:
- **relinkr-client**: Next.js application running on port 3000
- **relinkr-redis**: Redis database for data persistence

## Environment Configuration

The Docker setup uses the following environment variables:

```env
REDIS_URL=redis://redis:6379
NODE_ENV=production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=relinkr-secret-key-change-in-production
```

## Docker Commands

### Development
```bash
# Build containers
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose stop

# Remove containers
docker-compose down

# Rebuild and run
docker-compose up --build

# View running containers
docker-compose ps
```

### Production
For production deployment:
1. Update `NEXTAUTH_SECRET` to a secure random string
2. Update `NEXTAUTH_URL` to your production domain
3. Configure SSL/TLS certificates
4. Consider using Docker Swarm or Kubernetes for scaling

## File Structure

```
/apps/client/
├── Dockerfile              # Multi-stage build for Next.js
├── .env.docker             # Docker environment variables
├── docker-compose.yml      # Container orchestration
└── ...                     # Application source code
```

## Troubleshooting

### Build Issues
- Ensure Docker Desktop is running
- Check that ports 3000 and 6379 are available
- If you encounter Next.js compilation errors, check the Docker logs

### Connection Issues
- Verify Redis container is running: `docker-compose logs redis`
- Check network connectivity: `docker-compose ps`
- Ensure Redis URL is correct in environment variables

## Benefits

✅ **No local dependencies:** Node.js, npm, or Redis installation required
✅ **Consistent environment:** Same setup across development machines
✅ **Easy deployment:** Single command to deploy to any Docker host
✅ **Scalable:** Container orchestration ready
✅ **Isolated:** Application runs in its own environment

## Technologies Used

- **Docker**: Containerization platform
- **Docker Compose**: Multi-container orchestration
- **Next.js 15**: React framework with Pages Router
- **Redis**: In-memory database for data persistence
- **NextAuth.js**: Authentication framework
