cd /home/ubuntu/development/catalyst/D4D/server

rm -rf node-modules

sudo npm install
sudo npm install -g forever
mkdir -p catdata 
node install.js --db-host mongodb
#cp -r /home/ubuntu/development/catalyst/D4D/seed/catalyst catdata

sudo forever start app.js