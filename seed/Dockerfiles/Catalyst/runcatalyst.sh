cd /home/ubuntu/development/catalyst
git clone https://catalyst-engg:catalyst_123@github.com/RLIndia/D4D.git && cd D4D && git pull origin feature_engineered && cd server && rm -rf node-modules
cd /home/ubuntu/development/catalyst/D4D/server && sudo npm install
cd /home/ubuntu/development/catalyst/D4D/server 
mkdir -p catdata && cp -r ../seed/catalyst/. catdata/.
sed -i 's/localhost/mongodb/g' config/app_config.js
#&&  sudo node install --seed-data 
#sudo forever start app.js
sudo node app