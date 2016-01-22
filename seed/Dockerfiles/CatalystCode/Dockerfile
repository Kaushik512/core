#Setting up the code storage container

FROM       ubuntu:latest
MAINTAINER Docker
RUN apt-get -y update

RUN apt-get install git -y
RUN mkdir -p /home/ubuntu/development/catalyst
 
VOLUME ["/home/ubuntu/development/catalyst"]

#Installing Node JS
#RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 
#Node Js installation starts
#RUN apt-get update && apt-get install -y nodejs && apt-get install -y npm &&  apt-get install nodejs-legacy -y
#RUN rm -rf /home/ubuntu/development/catalyst/D4D/node-modules && cd /home/ubuntu/development/catalyst/D4D/server && npm install

#End NodeJS isntallation


ADD getcode.sh /usr/bin/
RUN chmod 777 /usr/bin/getcode.sh
CMD /usr/bin/getcode.sh

#docker run -t -i -d --name catalystcode  relevancelab/catalystcode:latest /bin/bash
