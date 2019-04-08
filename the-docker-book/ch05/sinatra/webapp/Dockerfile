FROM ubuntu:18.04
LABEL maintainer="keer2345@gmail.com"

ENV REFRESHED_AT 2019-04-07
RUN apt-get update -qq; apt-get -qq install ruby ruby-dev build-essential redis-tools
RUN gem install --no-rdoc --no-ri sinatra json redis
RUN mkdir -p /opt/webapp
EXPOSE 4567
CMD [ "/opt/webapp/bin/webapp" ]
