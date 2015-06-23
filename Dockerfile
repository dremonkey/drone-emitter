FROM node

MAINTAINER Andre Deutmeyer, andre@skycatch.com

WORKDIR /home/drone-emitter

# Install packages
ADD package.json /home/drone-emitter/package.json
RUN npm install -g nodemon
RUN npm install

# Make everything available for start
ADD . /home/drone-emitter

# currently only works for development
ENV NODE_ENV development