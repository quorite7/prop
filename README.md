# UK Home Improvement Platform

A modern platform connecting homeowners with builders for home improvement projects.

## Quick Start

### Local Development
```bash
./dev.sh
```
Opens frontend at http://localhost:3000

### AWS Deployment
```bash
./deploy.sh
```
Deploys the complete stack to AWS

## Live URLs

- **Frontend**: https://d41avezevb35d.cloudfront.net
- **API**: https://dkjzt6ibsj.execute-api.eu-west-2.amazonaws.com/prod
- **Health Check**: https://dkjzt6ibsj.execute-api.eu-west-2.amazonaws.com/prod/health

## Project Structure

- `frontend/` - React frontend application
- `lambda/` - AWS Lambda backend functions  
- `aws/` - CloudFormation templates
- `deploy.sh` - Single deployment script
- `dev.sh` - Local development script

## Features

- User authentication (Homeowners & Builders)
- Project creation and management
- Quote submission system
- Builder profiles and portfolios
- Document management
- Property assessment tools

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: AWS Lambda, Node.js (AWS SDK v3)
- **Database**: DynamoDB
- **Auth**: AWS Cognito
- **Hosting**: S3 + CloudFront
- **Infrastructure**: CloudFormation

## Recent Updates

- Fixed browser authentication issues
- Updated Lambda to AWS SDK v3 for Node.js 18 compatibility
- Corrected API response formats for frontend compatibility
- Streamlined deployment process
- Updated environment configuration
