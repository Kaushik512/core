cd /home/ubuntu/development/catalyst/D4D/server
#git clone https://catalyst-engg:catalyst_123@github.com/RLIndia/D4D.git && cd D4D && git pull origin feature_engineered && 
rm -rf node-modules

sudo npm install
sudo npm install -g forever
mkdir -p catdata 
cp -r /home/ubuntu/development/catalyst/D4D/seed/catalyst catdata
#sed -i 's/localhost/mongodb/g' config/app_config.js
#&&  sudo node install --seed-data 
#sudo forever start app.js
sudo forever start app.js