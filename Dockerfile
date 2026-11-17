# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.10-slim AS backend-runtime
WORKDIR /app

# Install system dependencies for psycopg2 and SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt

# Copy server code
COPY server/ ./server/

# Copy built frontend assets from stage 1 into client/dist
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port (Render sets $PORT dynamically)
ENV PORT=8000
EXPOSE 8000

# Command to initialize DB tables and start FastAPI server
CMD python -m server.app.init_db && uvicorn server.app.main:app --host 0.0.0.0 --port ${PORT}
