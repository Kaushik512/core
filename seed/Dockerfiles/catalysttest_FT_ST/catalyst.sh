# Pull latest code
echo "starting catalyst script"
cd /home/ubuntu/development/catalyst
git clone https://catalyst-engg:catalyst_123@github.com/RLIndia/D4D.git && cd D4D && git checkout dev_catalyst
cd /home/ubuntu/development/catalyst/D4D/server
sed -i 's/localhost/mongodb/g' config/app_config.js
curl -L https://www.chef.io/chef/install.sh | sudo bash

# Restore Mongodb
mongod --fork --logpath /data/mongod.log --dbpath /data/db --noprealloc --smallfiles
mongorestore --db devops_new /home/ubuntu/development/catalyst/D4D/seed/mongodump/devops_new

# Start catalyst
apt-get update && apt-get install -y software-properties-common python-software-properties && sudo add-apt-repository ppa:chris-lea/node.js -y  && sudo apt-get install -y nodejs
cd /home/ubuntu/development/catalyst/D4D/server
rm -rf node-modules
sudo npm install
sudo npm install -g forever
sudo node install.js --seed-data
mkdir -p catdata
cp -r /home/ubuntu/development/catalyst/D4D/seed/catalyst catdata
sudo forever start app.js
export PYTHONPATH="/home/ubuntu/development/catalyst/D4D/Test/FunctionalTest/catframework/project_rl_catalyst/Common_Resources"
