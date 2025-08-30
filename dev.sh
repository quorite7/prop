#!/bin/bash

# UK Home Improvement Platform - Local Development
set -e

echo "🚀 Starting UK Home Improvement Platform locally..."

# Start frontend
echo "📱 Starting frontend on http://localhost:3000"
cd frontend && npm start &

echo "✅ Development server started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop"

wait
