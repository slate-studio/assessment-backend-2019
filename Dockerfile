FROM mhart/alpine-node:latest
ENV NODE_ENV production

RUN mkdir -p /var/app/current
WORKDIR /var/app/current
COPY package.json /var/app/current
RUN npm install --production
COPY . /var/app/current
EXPOSE 3000

CMD npm run start:local
