# Online Banking Frontend - Vercel Deployment

## 🚀 Quick Start

### Prerequisites
- Backend services deployed on cloud platform (AWS, Azure, GCP)
- Environment variables configured for API endpoints

### Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Client Directory**
   ```bash
   cd Client-Service/client
   vercel --prod
   ```

### Environment Variables Required

Set these in Vercel dashboard:
- `REACT_APP_API_BASE_URL` - Your backend API URL
- `REACT_APP_ENVIRONMENT` - "production"

### Backend Deployment Options

#### Option A: AWS (Recommended)
- Deploy microservices on ECS/EKS
- Use RDS for MySQL databases
- Use MSK for Kafka
- Use API Gateway for routing

#### Option B: Azure
- Deploy on Azure Kubernetes Service (AKS)
- Use Azure Database for MySQL
- Use Azure Event Hubs for Kafka
- Use Azure API Management

#### Option C: Google Cloud
- Deploy on Google Kubernetes Engine (GKE)
- Use Cloud SQL for MySQL
- Use Pub/Sub for Kafka alternative
- Use Cloud Endpoints for API Gateway

### Current Limitations

❌ **Cannot deploy full-stack to Vercel**
- Vercel only hosts static sites/React apps
- Spring Boot services need server environment
- MySQL databases need database hosting

✅ **What works on Vercel**
- React frontend
- Static assets
- Client-side routing
- UI/UX functionality

### API Configuration

Update `src/services/api.ts` for production:
```typescript
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://your-backend.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Troubleshooting

#### Common Vercel Errors

1. **Build Error: "Module not found"**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **API Connection Failed**
   - Check `REACT_APP_API_BASE_URL` environment variable
   - Verify backend is accessible from Vercel

3. **CORS Issues**
   - Configure CORS on backend services
   - Allow Vercel domain in CORS settings

4. **Build Timeout**
   - Optimize build process
   - Remove unused dependencies

### Production Checklist

- [ ] Backend services deployed and accessible
- [ ] Environment variables set in Vercel
- [ ] CORS configured on backend
- [ ] SSL certificates installed
- [ ] Database connections tested
- [ ] Kafka/Event system working
- [ ] Monitoring and logging configured
