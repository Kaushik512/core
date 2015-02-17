//User Migration script
db = connect("localhost:27017/devops_new");
db.blueprints.update(
	{users:["sd1"]},
	{$set: {'users':["superadmin"]}},
	{multi:true}
	
);
db.instances.update({},{$addToSet :{users:"superadmin"}},{multi:true});
db.d4dmastersnew.update({rowid:"61"},{$set :{userrolename:"Admin"}});
db.d4dmastersnew.update({rowid:"62"},{$set :{userrolename:"Designer"}});
db.d4dmastersnew.update({rowid:"63"},{$set :{userrolename:"Consumer"}});
db.d4dmastersnew.update(
	{id:"7"},
	{$set: {'userrolename':"Admin"}},
	{multi:true}
);
db.d4dmastersnew.update({loginname:"sd1"},{$set :{loginname:"superadmin"}});


