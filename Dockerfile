# Use an Alpine-based Node image
FROM node:21.7.2-alpine

WORKDIR /app

# Install build dependencies for native modules.
RUN apk --no-cache add python3 make g++ 

COPY package*.json ./
COPY yarn.lock ./

# Install dependencies using yarn.
RUN yarn
COPY . .

EXPOSE 3010
RUN yarn build
CMD ["node", "dist/main.js"]

