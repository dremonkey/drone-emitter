FROM node

MAINTAINER Andre Deutmeyer, andre@skycatch.com

WORKDIR /home/drone-overmind

# Install packages
ADD package.json /home/drone-overmind/package.json
RUN npm install -g nodemon
RUN npm install

# Make everything available for start
ADD . /home/drone-overmind

# currently only works for development
ENV NODE_ENV development