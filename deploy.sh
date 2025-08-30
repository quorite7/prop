#!/bin/bash
set -e

REGION="eu-west-2"
FRONTEND_BUCKET="uk-home-frontend-1756487157"
CLOUDFRONT_ID="E1WYTJX6XKSG3J"
LAMBDA_FUNCTION="uk-home-api"

echo "🚀 Deploying UK Home Improvement Platform..."

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
echo "🔗 API: https://dkjzt6ibsj.execute-api.eu-west-2.amazonaws.com/prod"
echo "🧪 Test: curl https://dkjzt6ibsj.execute-api.eu-west-2.amazonaws.com/prod/health"
