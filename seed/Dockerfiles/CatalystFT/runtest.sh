#!/bin/bash
ps -ef | grep Xvfb
/usr/bin/Xvfb :99 &
chmod 755 /usr/bin/runtest.sh
cd /home/ubuntu/development/catalyst/Test_Results
pybot --include Sanity --variable ENVSERVER:"http://catalyst1:3001/public/login.html" --variable ENV:QA --variable ROOTPATH:/home/ubuntu/development/catalyst/D4D/Test/FunctionalTest/catframework/project_rl_catalyst /home/ubuntu/development/catalyst/D4D/Test/FunctionalTest/catframework/project_rl_catalyst/Test_Suites 