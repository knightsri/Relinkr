# Relinkr

⚡ A blazingly fast, self-hosted link shortener with click tracking & QR codes

## Overview

Relinkr is a modern, self-hosted URL shortener that provides enterprise-grade features while maintaining simplicity and performance. Built with Next.js and Redis, it offers lightning-fast redirects, comprehensive analytics, and QR code generation.

## Features

- **🔗 Custom & Case-Insensitive Slugs** - Create human-readable short URLs with your own custom slugs
- **🔒 Secure Random Generation** - Automatically generate unique, non-guessable slugs using nanoid
- **📊 Click Tracking & Analytics** - Built-in analytics track click counts with detailed logging
- **📱 Dynamic QR Code Generation** - Instantly generate high-quality SVG QR codes for every link
- **🎛️ Simple User Dashboard** - Clean, intuitive interface to manage all your links
- **🐳 Docker Deployment** - Deploy anywhere with a single Docker command
- **🔐 OAuth Authentication** - Secure authentication via GitHub and Google using NextAuth.js
- **⚡ Redis Performance** - Lightning-fast URL lookups powered by Redis in-memory storage

## Quick Start

### Using Docker Compose (Recommended) ⭐

```bash
# Clone the repository
git clone https://github.com/knightsri/Relinkr.git
cd Relinkr

# Step 1: Set up your OAuth credentials (one-time setup)
cp apps/client/.env.example apps/client/.env.local
# Edit .env.local with your GitHub and Google OAuth credentials

# Step 2: Deploy with Docker (credentials automatically copied)
docker-compose up --build -d

# Your Relinkr instance is now running at http://localhost:3000
```

**🔄 How Docker Handles Environment Variables:**
- `docker-compose up` **automatically copies OAuth credentials** from `.env.local` to `.env.docker`
- Docker containers use `.env.docker` for runtime configuration
- Containers never read `.env.local` directly (keeps secrets isolated)

**📋 Important Notes:**
- **Setup OAuth credentials once** in `.env.local`, Docker handles the rest
- All dependencies (Node.js, npm, Redis) are included in containers
- `docker-compose stop` stops, `docker-compose up -d` restarts
- See `DOCKER_README.md` for detailed Docker commands and troubleshooting

**✨ What's Included in Docker Setup:**
✅ Next.js application with custom Dockerfile for optimal performance
✅ Redis database container for fast URL lookups and analytics
✅ Automatic OAuth credential sync for GitHub and Google authentication
✅ Network isolation and security best practices
✅ Production-ready container images

### Manual Installation

```bash
# Clone and setup
git clone https://github.com/knightsri/Relinkr.git
cd Relinkr/apps/client

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start Redis (in separate terminal)
redis-server

# Start the application
npm run dev
```

## Configuration

### Environment Variables

**For Docker Container Setup** (Recommended):
Create `.env.local` file in `apps/client/` - Docker automatically copies OAuth credentials:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (copied automatically to .env.docker for containerized auth)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis Configuration (auto-managed in Docker)
REDIS_URL=redis://redis:6379

# Application Settings
SLUG_LENGTH=10
NEXT_PUBLIC_HIGHLIGHT_DURATION=3
```

**For Manual Installation**:
Create `.env.local` file in `apps/client/` (same variables as above, but set `REDIS_URL=redis://localhost:6379`)

**📝 Note**: Docker containers use `.env.docker` internally but sync from your `.env.local` - no manual setup needed!

### Setting up OAuth

#### GitHub OAuth Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local` file

#### Google OAuth Setup
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the Client ID and Client Secret to your `.env.local` file

## Usage

1. **Access the Dashboard**: Navigate to `http://localhost:3000` and sign in with GitHub or Google
2. **Create Short Links**: Enter a long URL and optionally specify a custom slug
3. **Manage Links**: View, edit, delete, and track analytics for all your links
4. **Copy & Share**: Click "Copy link" to get the short URL for sharing
5. **QR Codes**: Access QR codes by visiting `http://localhost:3000/[slug]/qr`

## API Reference

### Authentication
All API endpoints require authentication via NextAuth.js session cookies.

### Endpoints

#### Create Link
```http
POST /api/links/create
Content-Type: application/json

{
  "longUrl": "https://example.com/very-long-url",
  "customSlug": "my-event" // optional
}
```

#### List Links
```http
GET /api/links/list?page=1&perPage=10&q=search&sortField=clicks&sortDirection=desc
```

#### Update Link
```http
POST /api/links/update
Content-Type: application/json

{
  "internalId": "abc123",
  "longUrl": "https://example.com/updated-url"
}
```

#### Delete Link
```http
POST /api/links/delete
Content-Type: application/json

{
  "internalId": "abc123"
}
```

#### Get Analytics
```http
GET /api/analytics/counts?slugs=slug1&slugs=slug2
```

## Tech Stack

- **Frontend**: Next.js (React) with TypeScript
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Redis for high-performance storage
- **Authentication**: NextAuth.js with OAuth (GitHub, Google)
- **Validation**: Zod for type-safe data validation
- **Deployment**: Docker with Docker Compose
- **QR Codes**: Built-in SVG QR code generation

## Deployment

### Production with Docker

```bash
# Build and run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

Relinkr can be deployed on any cloud platform that supports Docker:

- **DigitalOcean**: App Platform or Droplets
- **AWS**: ECS, Fargate, or EC2
- **Google Cloud**: Cloud Run or Compute Engine
- **Azure**: Container Instances or App Service
- **Heroku**: Container Registry with Redis add-on

### Environment Variables for Production

Update your production environment variables:

```env
NEXTAUTH_URL=https://yourdomain.com
REDIS_URL=redis://your-redis-host:6379
# Update OAuth callback URLs to match your domain
```

## Development

### Project Structure

```
Relinkr/
├── apps/client/                # Next.js application
│   ├── components/            # React components
│   |   └── Toast.tsx         # Toast notifications
│   ├── pages/                 # Next.js pages and API routes
│   │   ├── api/              # API endpoints
│   │   │   ├── auth/         # NextAuth.js configuration
│   │   │   ├── links/        # Link management APIs
│   │   │   └── analytics/    # Analytics APIs
│   │   ├── index.tsx         # Main dashboard
│   │   ├── [slug].tsx        # Link redirect handler
│   │   └── _app.tsx          # Global layout wrapper
│   ├── lib/                  # Utility libraries
│   ├── src/app/              # Next.js app directory
│   │   ├── layout.tsx       # App directory layout
│   │   └── globals.css      # Global styles
│   ├── config/               # Configuration files
│   │   └── branding.ts       # Branding configuration
│   └── public/               # Static assets
├── docker-compose.yml      # Development Docker setup
├── DESIGN.md               # Design documentation
└── README.md              # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Troubleshooting

### Common Issues

**Redis Connection Failed**
- Verify Redis is running: `docker ps` or `redis-cli ping`
- Check Redis URL in environment variables
- Ensure Redis port (6379) is not blocked

**OAuth Authentication Not Working**
- Verify OAuth app callback URLs match your domain
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure NEXTAUTH_URL matches your actual domain
- Verify NEXTAUTH_SECRET is set and secure

**Port Already in Use**
- Stop existing processes: `pkill -f "npm run dev"`
- Or use a different port by modifying the start script

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/knightsri/Relinkr/issues)
- **Discussions**: [GitHub Discussions](https://github.com/knightsri/Relinkr/discussions)
- **Documentation**: See the `/docs` folder for detailed guides

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Powered by [Redis](https://redis.io/)
- Deployed with [Docker](https://docker.com/)

---

**Relinkr** - Fast, secure, and self-hosted link shortening for everyone.
