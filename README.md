# SoundCard - Spotify AI Trading Cards

Turn your Spotify music into personalized trading cards! SoundCard analyzes your listening habits and creates unique Pokémon-style trading cards that reflect your music taste.

🎴 **Coming Soon:** We're actively developing SoundCard into a full trading card game where you can trade cards with friends, battle with your musical creatures, and collect rare cards based on unique listening patterns!

## Features

### Current Features

#### Spotify Integration
- **Secure OAuth Authentication** via NextAuth.js
- **Dynamic Music Analysis** - Fetches top artists, tracks, and genres across multiple time ranges
- **Smart Data Mixing** - Combines short-term and medium-term listening data for variety
- **Real-time Sync** - Fresh data on every session

#### AI Card Generation
- **AI-Powered Creation** - Uses Replicate's Recraft-v3 model
- **Pokémon-Style Trading Cards** - Complete with varied HP, attacks, and flavor text
- **Dynamic Card Stats** - HP ranges from 60-150, attacks deal 30-120 damage
- **Music-Based Attacks** - Attack names like "Sonic Blast" and "Rhythm Wave"
- **Pack Opening Animation** - Exciting unboxing experience

### Planned Features (TCG Development)
- **Trading System** - Trade cards with other users
- **Battle Mechanics** - Use your musical creatures in strategic battles
- **Rare Card Collection** - Special cards for unique listening patterns
- **Deck Building** - Construct custom decks from your music taste
- **Tournaments** - Compete in music-based card battles

### Database & Storage
- **PostgreSQL Database** with Prisma ORM
- **AWS Secrets Manager Integration** - Automatic password rotation support
- **Dynamic Database Credentials** - Handles credential rotation seamlessly
- **AWS S3 Integration** - Secure image storage with signed URLs
- **Avatar Collection** - Personal gallery of generated cards

### Security & Performance
- **CloudWatch Logging** - Comprehensive monitoring
- **Automatic Credential Rotation** - Supports AWS RDS password rotation
- **Dynamic Authentication** - NextAuth adapter with fresh credentials
- **Secure File Handling** - Direct S3 uploads with presigned URLs
- **Optimized Images** - Next.js image optimization

### User Experience
- **Modern Responsive UI** - Beautiful gradient designs with Tailwind CSS
- **Framer Motion Animations** - Smooth transitions and interactions
- **Personal Collection** - Track and manage your generated cards
- **One-Click Downloads** - Save your cards locally
- **Session Management** - Automatic token refresh

### Developer Limitations
- **Spotify Development Mode** - Currently limited to 25 manually approved users due to Spotify's policies
- **Manual User Approval** - New users must be added to the allowlist by contacting the developer
- **Production Access** - Working on expanding access through official channels

### Scalability Ready
- **Retry Logic** - Robust error handling
- **Performance Monitoring** - CloudWatch integration
- **Extensible Architecture** - Ready for future TCG features

## Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI**: [React 19](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Gradients
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Heroicons](https://heroicons.com/) + [Lucide React](https://lucide.dev/)

### Backend & Database
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Credentials**: [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) with automatic rotation
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with dynamic Spotify Provider
- **Cloud Storage**: [AWS S3](https://aws.amazon.com/s3/) with presigned URLs
- **Monitoring**: [AWS CloudWatch](https://aws.amazon.com/cloudwatch/)

### APIs & Services
- **Music Data**: [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- **AI Generation**: [Replicate API](https://replicate.com/) (Recraft-v3 model)
- **Package Management**: [PNPM](https://pnpm.io/) / [NPM](https://www.npmjs.com/)

### Development Tools
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linting**: [ESLint](https://eslint.org/) with Next.js config
- **Build**: [Turbopack](https://turbo.build/pack) for fast development

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **Package Manager**: `npm`, `yarn`, or `pnpm`
- **Spotify Developer Account** - [Create app](https://developer.spotify.com/dashboard/)
- **Replicate Account** - [Get API token](https://replicate.com/account)
- **PostgreSQL Database** - Local or hosted (e.g., [Supabase](https://supabase.com/), [Railway](https://railway.app/))
- **AWS Account** - For S3 storage and CloudWatch (optional for local dev)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd spotify-avatar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the project root:

   ```env
   # Database Configuration
   # For local development
   DATABASE_URL="postgresql://username:password@localhost:5432/soundcard_db"
   
   # For production with AWS Secrets Manager (automatic password rotation)
   USE_SECRETS_MANAGER=true
   DATABASE_SECRET_NAME=rds!db-985ee635-9d07-4dcc-bdca-cea49ba9def8
   DB_HOST=your-rds-host.amazonaws.com
   DB_PORT=5432
   DB_NAME=soundcard_db

   # Spotify OAuth (from Spotify Developer Dashboard)
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_generated_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # AI Generation
   REPLICATE_API_TOKEN=your_replicate_api_token

   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-2
   AWS_S3_BUCKET_NAME=your-s3-bucket-name
   CLOUDWATCH_LOG_GROUP=soundcard-logs
   ```

4. **Database setup:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # (Optional) Run migrations in production
   npm run db:migrate
   ```

5. **Configure Spotify App:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new app or use existing one
   - Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
   - Note down Client ID and Client Secret
   - **Important**: Add your Spotify email to the app's "Users and Access" section for testing

6. **Start the development server:**
   ```bash
   npm run dev
   # or with Turbopack for faster development
   npm run dev --turbo
   ```

   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID | `abc123...` |
| `SPOTIFY_CLIENT_SECRET` | Spotify app secret | `def456...` |
| `NEXTAUTH_SECRET` | Session encryption key | Generate with `openssl rand -base64 32` |
| `REPLICATE_API_TOKEN` | Replicate AI API token | `r8_abc123...` |

### AWS Configuration (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_SECRETS_MANAGER` | Enable dynamic credential retrieval | `false` |
| `DATABASE_SECRET_NAME` | AWS Secrets Manager secret name | Required if using Secrets Manager |
| `AWS_ACCESS_KEY_ID` | AWS access key | Required for S3/CloudWatch/Secrets |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Required for S3/CloudWatch/Secrets |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket for images | Required for S3 |
| `CLOUDWATCH_LOG_GROUP` | CloudWatch log group | `soundcard-logs` |

## Database Schema

The application uses PostgreSQL with Prisma ORM. Here are the main models:

### Core Models
- **User** - User profiles with Spotify integration
- **Avatar** - Generated trading cards with metadata
- **Session** & **Account** - NextAuth.js authentication

## Key Features Explained

### Trading Card Generation
Cards are generated using a sophisticated prompt that includes:
- **Music Analysis**: Top artists, tracks, and genres
- **Visual Style**: Pokémon TCG-inspired design
- **Dynamic Attacks**: Named after your music preferences
- **Stats**: HP, damage values, retreat costs
- **Flavor Text**: Poetic descriptions of your musical taste

### Music Data Processing
- **Multi-timeframe Analysis**: Combines medium-term (6 months) and short-term (4 weeks) data
- **Intelligent Deduplication**: Removes duplicate artists/tracks
- **Genre Extraction**: Analyzes musical styles and moods
- **Real-time Sync**: Fresh data on every session

### Security Features
- **Secure Storage**: AWS S3 with presigned URLs
- **Session Management**: Automatic token refresh
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Graceful degradation and retry logic

## Deployment Guide

### AWS Secrets Manager Setup (Production)

For production deployments with AWS RDS, enable automatic credential rotation:

1. **Configure RDS with Secrets Manager:**
   - Enable automatic rotation in AWS RDS (7-day cycle recommended)
   - Note the secret name (format: `rds!db-xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx`)
   - Ensure IAM user has `secretsmanager:GetSecretValue` permission

2. **Required IAM Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "secretsmanager:GetSecretValue",
         "Resource": "arn:aws:secretsmanager:region:account:secret:rds!db-*"
       }
     ]
   }
   ```

### Vercel Deployment (Recommended)

1. **Prepare for deployment:**
   ```bash
   # Build the application locally to test
   npm run build
   ```

2. **Deploy to Vercel:**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import your repository into [Vercel](https://vercel.com/)
   - Vercel will automatically detect Next.js and configure build settings

3. **Configure Environment Variables:**
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   **For AWS Secrets Manager (Production):**
   ```env
   # Dynamic Database Credentials
   USE_SECRETS_MANAGER=true
   DATABASE_SECRET_NAME=rds!db-985ee635-9d07-4dcc-bdca-cea49ba9def8
   DB_HOST=your-rds-host.amazonaws.com
   DB_PORT=5432
   DB_NAME=soundcard_db
   
   # Authentication
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   NEXTAUTH_SECRET=your_strong_production_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   
   # AI Generation
   REPLICATE_API_TOKEN=your_replicate_token
   
   # AWS Services
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-s3-bucket
   CLOUDWATCH_LOG_GROUP=soundcard-logs
   ```
   
   **For Static Database URL (Development):**
   ```env
   DATABASE_URL=your_production_database_url
   # ... other variables same as above
   ```

4. **Update Spotify App Settings:**
   - Add production callback URL: `https://your-app.vercel.app/api/auth/callback/spotify`

5. **Database Setup:**
   ```bash
   # For production database
   npx prisma migrate deploy
   ```

### Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t soundcard .
   docker run -p 3000:3000 --env-file .env.local soundcard
   ```

### Other Platforms

**Railway**
- Connect GitHub repository
- Add environment variables
- Deploy automatically

**DigitalOcean App Platform**
- Import from GitHub
- Configure environment variables
- Set build command: `npm run build`

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev --turbo      # Start with Turbopack (faster)

# Database
npm run db:generate      # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Production
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

## Customization Guide

### Styling
- **Tailwind Config**: `tailwind.config.js`
- **Global Styles**: `app/globals.css`
- **Custom Components**: `app/dashboard/DashboardClient.tsx`

### AI Prompts
- **Prompt Engineering**: `app/api/generate-avatar/route.ts`
- **Model Settings**: Modify Replicate model parameters


### Music Data
- **Spotify Scopes**: `lib/auth.ts`
- **Data Processing**: Dashboard client components

## Troubleshooting

### Common Issues

**Spotify Authentication Errors**
```bash
# Check Spotify app configuration
# Verify callback URLs match exactly
# Ensure client ID/secret are correct
# Make sure your email is added to "Users and Access" in Spotify Developer Dashboard
# Note: Spotify apps in development mode only allow 25 manually approved users
```

**Database Connection Issues**
```bash
# For static DATABASE_URL:
# Check DATABASE_URL format
# Verify database is running
# Run: npx prisma db push

# For AWS Secrets Manager:
# Verify USE_SECRETS_MANAGER=true
# Check DATABASE_SECRET_NAME matches RDS secret
# Ensure IAM permissions for secretsmanager:GetSecretValue
# Verify DB_HOST, DB_PORT, DB_NAME environment variables
```

**AI Generation Failures**
```bash
# Verify REPLICATE_API_TOKEN
# Check API rate limits
# Review prompt length (max ~2000 chars)
```

**AWS Issues**
```bash
# S3 Storage:
# Verify AWS credentials
# Check bucket permissions
# Ensure bucket exists and is in correct region

# Secrets Manager:
# Check secret name format: rds!db-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# Verify IAM policy allows GetSecretValue action
# Test with: aws secretsmanager get-secret-value --secret-id your-secret-name
```

### Debug Mode
```bash
# Enable detailed logging
export DEBUG=*
npm run dev
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow existing UI patterns
- Add tests for new features
- Update documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Spotify** for the amazing Web API
- **Replicate** for AI model hosting
- **Recraft AI** for the image generation model
- **Next.js Team** for the incredible framework
- **Framer Motion** for smooth animations
- **Tailwind CSS** for beautiful styling

---

<div align="center">

**Transform Your Music Into Art**

Made with ❤️ for music lovers and trading card enthusiasts

🎴 **Coming Soon:** Full Trading Card Game Features!

[⭐ Star this repo](../../stargazers) • [🐛 Report bug](../../issues) • [💡 Request feature](../../issues)

</div>
