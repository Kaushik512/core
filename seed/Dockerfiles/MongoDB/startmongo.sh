mongod --fork --logpath /data/mongod.log --dbpath /data/db --noprealloc --smallfiles

#mkdir -p /home/ubuntu/development/catalyst && cd /home/ubuntu/development/catalyst 
#mkdir -p /home/ubuntu/development/catalyst && cd /home/ubuntu/development/catalyst && \
#cd /home/ubuntu/development/catalyst
#git clone https://catalyst-engg:catalyst_123@github.com/RLIndia/D4D.git && cd D4D && git pull origin feature_engineered && cd server && rm -rf node-#modules

mongorestore --db devops_new /home/ubuntu/development/catalyst/D4D/seed/mongodump/devops_new