#Dockerizing MongoDB: Dockerfile for building MongoDB images
# Based on ubuntu:latest, installs MongoDB following the instructions from:
# http://docs.mongodb.org/:qmanual/tutorial/install-mongodb-on-ubuntu/

FROM       ubuntu:latest
MAINTAINER Docker

# Installation:
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list

# Update apt-get sources AND install MongoDB
RUN apt-get update && apt-get install -y mongodb-org
RUN apt-get install git -y 

# Create the MongoDB data directory
RUN mkdir -p /data/db

# Required if the data folder is mounted on the host

VOLUME ["/data/db"]

ADD startmongo.sh /usr/bin/
RUN chmod 777 /usr/bin/startmongo.sh
CMD /usr/bin/startmongo.sh


#docker run -t -i -d -p 27017:27017 --volumes-from catalystcode  -v /data/db:/data/db --name mongodb  relevancelab/mongodb:1.0 /bin/bash
#bash startmongo.sh
