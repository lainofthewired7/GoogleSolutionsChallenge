#!/bin/bash

# Configuration - Update these or use environment variables
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="projectr-analytics"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Preparing deployment for Projectr Analytics..."

# 1. Build the Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

# 2. Push the image to Artifact Registry / GCR
echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# 3. Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="DEBUG=false,LOG_LEVEL=INFO" \
  --update-secrets="FRED_API_KEY=FRED_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest"

echo "✅ Deployment complete!"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
