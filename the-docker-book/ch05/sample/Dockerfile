FROM ubuntu:18.04
LABEL maintainer="keer2345@gmail.com"
ENV REFRESHED_AT 2019-04-06
RUN apt-get -qq update; apt-get -qq install nginx

RUN mkdir -p /var/www/html/website
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
