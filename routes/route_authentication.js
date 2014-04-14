module.exports.setRoutes = function(app) {


	app.post('/auth/signin', function(req, res) {
		if (req.body && req.body.username && req.body.pass) {
			if (req.body.username === 'admin' && req.body.pass === "ReleV@nce") {
				req.session.tempSession = true;
				res.redirect('/');
			} else {
				res.redirect('/login');
			}
		} else {
			res.redirect('/login');
		}
	});


	app.get('/auth/signout', function(req, res) {
		req.session = null;
		res.redirect('/login');
	});


	app.get('/login', function(req, res) {
		res.render('login.html');
	});

	var verifySession = function(req, res, next) {
		if (req.session && req.session.tempSession) {
			next();
		} else {
			res.redirect('/login');
		}
	};

	return verifySession;

}