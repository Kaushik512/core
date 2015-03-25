#Catalyst Docker File

FROM       ubuntu:latest
MAINTAINER Docker

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 
#Node Js installation starts
RUN apt-get update && apt-get install -y nodejs && apt-get install -y npm &&  apt-get install nodejs-legacy -y
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
RUN apt-get install git -y 

RUN mkdir -p /home/ubuntu/development/catalyst && cd /home/ubuntu/development/catalyst 
#RUN mkdir -p /home/ubuntu/development/catalyst && cd /home/ubuntu/development/catalyst && \
 #git clone https://catalyst-engg:catalyst_123@github.com/RLIndia/D4D.git && cd D4D && git pull origin feature_engineered && cd server && rm -rf node-#modules && \
 #cd /home/ubuntu/development/catalyst/D4D/server && sudo npm install

RUN apt-get -y update && \
	apt-get -y install build-essential && \
	apt-get -y install libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev

WORKDIR /opt
ADD runcatalyst.sh /usr/bin/
CMD /usr/bin/runcatalyst.sh

#docker run -t -d -i -p 80:3001 --link mongodb:mongodb --name catalyst relevancelab/catalystapp:1.0 /bin/bash