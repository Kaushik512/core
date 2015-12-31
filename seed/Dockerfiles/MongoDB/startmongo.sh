mongod --fork --logpath /data/mongod.log --dbpath /data/db --noprealloc --smallfiles

mongorestore --drop --db devops_new /home/ubuntu/development/catalyst/D4D/seed/mongodump/devops_new