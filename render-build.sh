#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Building React Frontend..."
npm install --prefix client
npm run build --prefix client

echo "==> Installing Python Server Dependencies..."
pip install -r server/requirements.txt

echo "==> Running Database Migrations & Initial Seed..."
python -m server.app.init_db

echo "==> Build & DB Setup Completed Successfully!"
