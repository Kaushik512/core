#Catalyst Docker File
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

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
#Node Js installation starts
RUN apt-get update && apt-get install -y software-properties-common python-software-properties && sudo add-apt-repository ppa:chris-lea/node.js -y  && sudo apt-get install -y nodejs

RUN apt-get update -y && \
        apt-get install apt-file -y && apt-file update && \
        apt-get update -y
RUN apt-get update && apt-get install -y software-properties-common && \
    add-apt-repository ppa:webupd8team/java && \
    apt-get update && \
    apt-get remove -y software-properties-common && \
    apt-get autoremove -y

RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | \
    /usr/bin/debconf-set-selections && \
    apt-get install -y oracle-java8-installer
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

# Pull latest code
RUN mkdir -p /home/ubuntu/development/catalyst


ADD catalyst.sh /usr/bin/
RUN chmod 777 /usr/bin/catalyst.sh

RUN apt-get -y install build-essential
RUN apt-get -y install libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev

WORKDIR /opt
RUN apt-get -y install wget && wget http://python.org/ftp/python/2.7.5/Python-2.7.5.tgz && tar -xvf Python-2.7.5.tgz && cd Python-2.7.5 && ./configure && make && make install
RUN apt-get -y install wget && wget https://bootstrap.pypa.io/get-pip.py && python /opt/get-pip.py && pip install robotframework && pip install robotframework-selenium2library

RUN apt-get -y install xvfb firefox
ENV DISPLAY :99
RUN /usr/bin/Xvfb :99 &
CMD ["/usr/bin/catalyst.sh"]
