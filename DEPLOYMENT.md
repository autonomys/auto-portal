# Deployment Guide - Vercel

This document covers deploying the Autonomys Staking application to Vercel for preview and production environments.

## 🚀 Quick Setup

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
# or
yarn global add vercel
```

### 2. Connect to Vercel

**Option A: Via GitHub (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Vercel will auto-detect the configuration

**Option B: Via CLI**

```bash
vercel --cwd apps/web
```

### 3. Configure Environment Variables

In your Vercel dashboard, add these environment variables:

**Production Environment:**

```
VITE_NETWORK_NAME=mainnet
VITE_RPC_URL=wss://rpc.mainnet.autonomys.xyz/ws
VITE_APP_NAME=Autonomys Staking
VITE_DEV_MODE=false
```

**Preview Environment:**

```
VITE_NETWORK_NAME=taurus
VITE_RPC_URL=wss://rpc.taurus.autonomys.xyz/ws
VITE_APP_NAME=Autonomys Staking (Preview)
VITE_DEV_MODE=true
```

## 📁 Project Structure

```
auto-portal/
├── vercel.json              # Vercel configuration
├── .vercelignore           # Files to exclude from deployment
├── apps/
│   └── web/
│       ├── .env.example    # Environment variables template
│       ├── dist/           # Build output (auto-generated)
│       └── vite.config.ts  # Updated with build optimizations
```

## 🔧 Configuration Details

### vercel.json

- Configures monorepo build process
- Sets up SPA routing for React Router
- Includes security headers
- Optimizes for static site deployment

### Build Process

1. Vercel runs `yarn install` at root (installs all workspaces)
2. Executes `cd apps/web && yarn build`
3. Outputs to `apps/web/dist/`
4. Serves as static site with SPA fallback

## 🌟 Deployment Workflows

### Automatic Deployments

**Production Deployments:**

- Triggered on push to `main` branch
- Uses production environment variables
- Available at your custom domain

**Preview Deployments:**

- Triggered on push to any branch or PR
- Uses preview environment variables
- Gets unique preview URL

### Manual Deployments

```bash
# Deploy current branch
vercel

# Deploy to production
vercel --prod

# Deploy specific directory
vercel --cwd apps/web

# Deploy with custom environment
vercel --env VITE_NETWORK_NAME=taurus
```

## 🔍 Monitoring & Debugging

### Vercel Dashboard Features

- **Function Logs**: Monitor build and runtime logs
- **Analytics**: Track page views and performance
- **Deployments**: View deployment history and status
- **Domains**: Manage custom domains and certificates

### Build Optimization

The Vite config includes:

- **Code Splitting**: Separate chunks for vendor, blockchain, and UI code
- **Source Maps**: Enable debugging in production
- **Bundle Analysis**: Monitor chunk sizes

### Performance Monitoring

- Core Web Vitals tracking
- Bundle size monitoring
- Real user monitoring (RUM)

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**

```bash
# Check build locally
cd apps/web
yarn build

# Test preview locally
yarn preview
```

**Environment Variable Issues:**

- Ensure all `VITE_` prefixed variables are set
- Check variable names match exactly
- Verify values don't contain quotes unless needed

**Routing Issues:**

- Verify `vercel.json` SPA fallback configuration
- Test navigation in preview deployment

### Debug Commands

```bash
# Inspect build output
vercel build

# Check deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls
```

## 📊 Performance Targets

### Core Web Vitals Goals

- **First Contentful Paint (FCP)**: < 2s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Bundle Size Targets

- **Initial Bundle**: < 500KB gzipped
- **Vendor Chunk**: < 300KB gzipped
- **Blockchain Chunk**: < 200KB gzipped

## 🔐 Security Configuration

The `vercel.json` includes security headers:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info

## 🚀 Next Steps

After deployment is working:

1. **Custom Domain**: Configure production domain
2. **Analytics**: Enable Vercel Analytics
3. **Monitoring**: Set up performance monitoring
4. **CI/CD**: Configure GitHub Actions for additional testing
5. **Error Tracking**: Integrate error reporting service

---

**Useful Links:**

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router SPA Setup](https://reactrouter.com/en/main/guides/spa)
