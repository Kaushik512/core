cd /home/ubuntu/development/catalyst
git clone https://catalyst-engg:catalyst_123@github.com/RLIndia/D4D.git && cd D4D && git pull origin feature_engineered 
cd /home/ubuntu/development/catalyst/D4D/server
sed -i 's/localhost/mongodb/g' config/app_config.js