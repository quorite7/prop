#!/bin/bash
set -e

REPO_NAME="quorite7"
GITHUB_ORG="aD-Home-Builder"

echo "🔗 Setting up GitHub repository: ${GITHUB_ORG}/${REPO_NAME}"
echo ""
echo "Choose authentication method:"
echo "1) GitHub CLI (recommended)"
echo "2) Personal Access Token"
echo "3) SSH (requires SSH key setup)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Using GitHub CLI..."
        echo "Run these commands:"
        echo "  gh auth login"
        echo "  git remote add origin https://github.com/${GITHUB_ORG}/${REPO_NAME}.git"
        echo "  git push -u origin main"
        ;;
    2)
        echo "Using Personal Access Token..."
        echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens"
        echo "2. Generate new token with 'repo' permissions"
        echo "3. Run these commands:"
        echo "  git remote add origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/${GITHUB_ORG}/${REPO_NAME}.git"
        echo "  git push -u origin main"
        ;;
    3)
        echo "Using SSH..."
        git remote remove origin 2>/dev/null || true
        git remote add origin git@github.com:${GITHUB_ORG}/${REPO_NAME}.git
        echo "Attempting SSH push..."
        git push -u origin main
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
