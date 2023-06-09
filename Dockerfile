FROM node:ubuntu 
COPY . /nginx
WORKDIR /nginx
CMD node function.js 

