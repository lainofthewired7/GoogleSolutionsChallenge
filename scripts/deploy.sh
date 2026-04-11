#!/bin/bash

# Configuration - Update these or use environment variables
# If PROJECT_ID is not set as an environment variable, try to get it from gcloud
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
fi

# Exit if gcloud is missing
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud CLI (gcloud) is not installed."
    echo "Please visit https://cloud.google.com/sdk/docs/install to install it."
    exit 1
fi

# Exit if PROJECT_ID is still empty
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Google Cloud Project ID is not set."
    echo "Please run 'gcloud init' or set the PROJECT_ID environment variable."
    exit 1
fi

REGION="us-central1"
SERVICE_NAME="indicium"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Preparing deployment for Indicium..."
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"

# 1. Build the Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed."
    exit 1
fi

# 2. Push the image to Artifact Registry / GCR
echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed. Ensure you have run 'gcloud auth configure-docker'."
    exit 1
fi

# 3. Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="DEBUG=false,LOG_LEVEL=INFO,FRONTEND_URL=replace_with_your_url" \
  --update-secrets="FRED_API_KEY=FRED_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,JWT_SECRET_KEY=JWT_SECRET_KEY:latest"

if [ $? -eq 0 ]; then
    echo "✅ Deployment complete!"
    gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
else
    echo "❌ Cloud Run deployment failed."
    exit 1
fi
 