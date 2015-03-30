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

WORKDIR /opt
ADD runcatalyst.sh /usr/bin/
CMD /usr/bin/runcatalyst.sh

#docker run -t -d -i -p 3001:3001 --link mongodb:mongodb --volumes-from catalystcode --name catalyst1 relevancelab/catalystapp:1.3 /bin/bash
#runcatalyst.sh 