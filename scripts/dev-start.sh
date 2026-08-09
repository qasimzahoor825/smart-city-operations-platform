#!/bin/bash
echo "🚀 Starting Enterprise Smart City Platform in local development mode..."
docker-compose up -d postgres redis kafka
npm run dev:all
