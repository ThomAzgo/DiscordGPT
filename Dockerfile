FROM node:lts-alpine
RUN mkdir -p /discordgpt-app
WORKDIR /discordgpt-app
COPY package.json /discordgpt-app
RUN npm cache clean --force
RUN npm install
COPY . /discordgpt-app
RUN chmod -R 777 /discordgpt-app
RUN mkdir database
RUN npm run deploy-commands
CMD ["npm", "start"]