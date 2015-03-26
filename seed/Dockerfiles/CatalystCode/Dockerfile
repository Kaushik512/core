#Setting up the code storage container

FROM       ubuntu:latest
MAINTAINER Docker
RUN apt-get -y update

RUN apt-get install git -y
RUN mkdir -p /home/ubuntu/development/catalyst
 
VOLUME ["/home/ubuntu/development/catalyst"]

ADD getcode.sh /usr/bin/
RUN chmod 777 /usr/bin/getcode.sh
CMD /usr/bin/getcode.sh

#docker run -t -i -d --name catalystcode  relevancelab/catalystcode:latest /bin/bash
