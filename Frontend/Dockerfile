FROM tiangolo/node-frontend:10 as build-stage
WORKDIR /app
COPY frontend/package*.json /app/
RUN npm install
COPY frontend/ /app/
RUN npm run build
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/build/ /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
# Copy the default nginx.conf provided by tiangolo/node-frontend
# COPY --from=build-stage /nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
ENTRYPOINT ["nginx","-g","daemon off;"]

