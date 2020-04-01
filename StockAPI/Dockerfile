FROM node:10
RUN mkdir -p /src/app
WORKDIR /src/app
COPY stockAPI/package.json /src/app/package.json
RUN npm install
COPY stockAPI/ /src/app
EXPOSE 8080
EXPOSE 8086
CMD [ "npm", "start" ]