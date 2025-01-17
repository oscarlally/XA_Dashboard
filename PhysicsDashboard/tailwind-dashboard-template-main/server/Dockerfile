FROM node:16

WORKDIR /tailwind-dashboard-template-main

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]