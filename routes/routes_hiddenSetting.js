var provider = require('../controller/providers.js');
var domainsDao = require('../controller/domains.js');

module.exports.setRoutes = function(app, verificationFunc) {

	app.get('/hiddenSettings', verificationFunc, function(req, resp) {

		var domainsData = []
		var prod;
		var prodList;

		function getProdDomainData(pid, prodName) {
			domainsDao.getAllDomainData(pid, function(err, domains) {
				var obj = {};
				obj.pid = pid;
				obj.name = prodName;
				obj.domains = domains;
				domainsData.push(obj);
				prod.splice(0, 1);
				if (prod.length) {
					getProdDomainData(prod[0].pid, prod[0].name);
				} else {
					resp.render('hiddensettings', {
						error: false,
						products: prodList,
						domainsData: domainsData
					});
				}

			});
		}

		provider.getProviders(function(err, data) {
			if (data) {
				prodList = [].concat(data);
				prod = data;
				if (prod.length) {
					getProdDomainData(prod[0].pid, prod[0].name);
				}
			} else {
				resp.render('hiddensettings', {
					error: true,
					products: null,
					domainsData: null
				});
			}

		});


	});


	app.post('/hiddenSettings', verificationFunc, function(req, resp) {
		console.log(req.body);
		if (req.body.prd) {
			provider.setProviderStatus(req.body.prd, function(err, data) {
				if (err) {
					resp.send(500);
					return;
				} else {
					resp.send("success");
				}
			});
		} else if (req.body.domainData) {
			var domainData = [].concat(req.body.domainData);

			function deleteDomain(pid, domainName) {
				domainsDao.deleteDomains(pid, domainName, function(err, data) {
					if (err) {
						resp.send(500);
						return;
					} else {
						domainData.splice(0, 1);
						if (domainData.length) {
							var d = domainData[0].split(',');;
							deleteDomain(d[0], d[1])
						} else {
							resp.send("success");
						}
					}
				});
			}
			if (domainData.length) {
				var d = domainData[0].split(',');;
				deleteDomain(d[0], d[1])
			}
		}

	});

}