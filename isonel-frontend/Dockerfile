FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Build Angular production bundle into dist/isonel-frontend/browser.
RUN npm run build -- --configuration production --output-path=dist/isonel-frontend/browser

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf /usr/share/nginx/html/*
# Copy only the browser bundle (contains index.html and assets) to the nginx root.
COPY --from=build /app/dist/isonel-frontend/browser/. /usr/share/nginx/html/
# Some Angular builds still create a nested browser folder, ensure we flatten it.
RUN if [ -d browser ]; then cp -r browser/. . && rm -rf browser; fi

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
