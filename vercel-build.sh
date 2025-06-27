#!/bin/bash
set -e

# Generate Prisma client
npx prisma generate --no-engine

# Build Next.js
next build