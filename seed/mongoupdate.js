//User Migration script
var server = "localhost";
var port = "27017";
var dbname = "devops_new";
db = connect(server + ':' + port + '/' + dbname);
db.blueprints.update(
	{users:["sd1"]},
	{$set: {'users':["superadmin"]}},
	{multi:true}
	
);
db.instances.update({},{$addToSet :{users:"superadmin"}},{multi:true});
db.d4dmastersnew.update({rowid:"61"},{$set :{userrolename:"Admin"}});
db.d4dmastersnew.update({rowid:"62"},{$set :{userrolename:"Designer"}});
db.d4dmastersnew.update({rowid:"63"},{$set :{userrolename:"Consumer"}});
db.d4dmastersnew.remove({userrolename:"SUPERADMIN",id:"6"},true);
db.d4dmastersnew.update(
	{id:"7"},
	{$set: {'userrolename':"Admin"}},
	{multi:true}
);
db.d4dmastersnew.update({loginname:"sd1"},{$set :{loginname:"superadmin"}});


