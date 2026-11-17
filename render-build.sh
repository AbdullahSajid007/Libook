#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python Server Dependencies..."
pip install -r requirements.txt

# If node/npm is available, build the frontend
if command -v npm &> /dev/null; then
    echo "==> Node/npm detected. Building React Frontend..."
    npm install --prefix client
    npm run build --prefix client
else
    echo "==> Using pre-built React frontend in client/dist..."
fi

echo "==> Initializing Database Schema & Seed Data..."
python -m server.app.init_db

echo "==> Build & DB Setup Completed Successfully!"
