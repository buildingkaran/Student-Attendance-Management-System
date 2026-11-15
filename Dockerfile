# =========================================================================
# DOCKERFILE - Student Attendance Management System
# Department of Vocation • B.Voc (Software Development) Sem V
# Student: Karan Kumar | Roll: 24107030
# =========================================================================

# 1. Base Image: Lightweight official Node.js 20 on Alpine Linux
FROM node:20-alpine

# 2. Set working directory inside container
WORKDIR /usr/src/app

# 3. Copy package definitions first to leverage Docker layer caching
COPY package*.json ./

# 4. Install production dependencies
RUN npm install --omit=dev

# 5. Copy the entire application source code
COPY . .

# 6. Create logs and data directory with appropriate permissions
RUN mkdir -p logs data && chown -R node:node /usr/src/app

# 7. Use non-root user for security best practices
USER node

# 8. Expose the Express application internal port
EXPOSE 3000

# 9. Healthcheck to monitor container availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/dashboard/stats || exit 1

# 10. Default container startup command
CMD ["node", "server.js"]
