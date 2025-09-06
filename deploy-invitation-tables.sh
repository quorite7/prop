#!/bin/bash

# Deploy builder invitation system tables
echo "Deploying builder invitation system tables..."

# Deploy the CloudFormation stack
aws cloudformation deploy \
  --template-file aws/cloudformation/builder-invitation-tables.yml \
  --stack-name uk-home-improvement-builder-invitations \
  --region eu-west-2 \
  --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
    echo "✅ Builder invitation tables deployed successfully!"
    
    # Get the table names
    echo "📋 Table names:"
    aws cloudformation describe-stacks \
      --stack-name uk-home-improvement-builder-invitations \
      --region eu-west-2 \
      --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
      --output table
else
    echo "❌ Failed to deploy builder invitation tables"
    exit 1
fi
