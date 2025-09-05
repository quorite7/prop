#!/bin/bash
set -e

REGION="eu-west-2"
FRONTEND_BUCKET="uk-home-frontend-1756487157"
CLOUDFRONT_ID="E1WYTJX6XKSG3J"
LAMBDA_FUNCTION="uk-home-api"

echo "🚀 Deploying UK Home Improvement Platform with SoW Generation..."

# Deploy SoW tables
echo "🗄️ Deploying SoW tables..."
aws cloudformation deploy \
  --template-file aws/sow-tables.yaml \
  --stack-name uk-home-improvement-sow-tables \
  --region $REGION
echo "✅ SoW tables deployed"

# Deploy Lambda function
echo "📦 Updating Lambda function..."
cd lambda && zip -r ../lambda-code.zip . && cd ..
aws lambda update-function-code --function-name $LAMBDA_FUNCTION --zip-file fileb://lambda-code.zip --region $REGION
rm lambda-code.zip
echo "✅ Lambda function updated"

# Deploy frontend
echo "🎨 Building and deploying frontend..."
cd frontend && npm run build && cd ..
aws s3 sync frontend/build/ s3://$FRONTEND_BUCKET --delete --region $REGION

# Invalidate CloudFront cache
echo "☁️ Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*" --region $REGION

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://d41avezevb35d.cloudfront.net"
echo "🔗 API: https://rdy68tyyp1.execute-api.eu-west-2.amazonaws.com/prod"
echo "🧪 Test: curl https://rdy68tyyp1.execute-api.eu-west-2.amazonaws.com/prod/health"
echo "🤖 SoW Generation: Available in project dashboard after completing questionnaire"
