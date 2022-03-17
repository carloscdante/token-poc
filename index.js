const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	path = require('path'),
	axios = require('axios'),
	qs = require('qs'),
	jwt_decode = require('jwt-decode');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

app.use(bodyParser.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
	res.render('index');
})

app.post('/login', (req, res) => {
	const creds = {
		'username': req.body.username,
		'password': req.body.password
	};

	axios.post('http://localhost:3030/user/login', qs.stringify(creds), config)
	.then(response => {
		console.log(response.data['id_token']);
		const decoded = jwt_decode(response.data['id_token']);
		const accessToken = response.data['access_token'];
		const stringifiedDecodedToken = JSON.stringify(decoded);
		const name = decoded['name'];
		const roles = decoded['realm_access']['roles'];
		console.log(roles);
		const rf = response.data['refresh_token'];
		const environment = response.data['env_name'];
		res.cookie('access_token', accessToken);
		res.set('Authorization', `Bearer ${accessToken}`);
		res.set('Content-Security-Policy', "frame-src http://localhost:4000/");
		res.set('Access-Control-Allow-Origin', 'http://localhost:4000/');
		res.render('dashboard', {roles: roles, name: name, tokens: response.data, decodedToken: stringifiedDecodedToken,
			env: environment, rf: rf});
	}).catch(error => {
		console.log(error);
	})
})

app.get('/assign', (req, res) => {
	const data = {
		profile: "Gerente",
		env: "ceh@certi.org.br-certi",
		user: "ceh@certi.org.br"
	}
	axios.post('http://localhost:3030/profile/certi/assign/51d288be-c850-40bd-adbc-f59d246d05a3',
	qs.stringify(data), config)
	.then(response => {
		res.send('Success');
	}).catch(error => {
		console.log(error);
	})
})
app.post('/switch', (req, res) => {
	const data = {
		profile: "Gerente",
		env_name: "ceh@certi.org.br-certichd",
		target_env: "ceh@certi.org.br-certi",
		user: "ceh@certi.org.br",
		tkn: req.body.token,
		refresh_token: req.body.refresh_token
	}
	axios.post('http://localhost:3030/user/certi/switch/51d288be-c850-40bd-adbc-f59d246d05a3',
	qs.stringify(data), config)
	.then(response => {
		console.log(response.data['id_token']);
		const decoded = jwt_decode(response.data['id_token']);
		const stringifiedDecodedToken = JSON.stringify(decoded);
		const name = decoded['name'];
		const roles = decoded['realm_access']['roles'];
		console.log(roles);
		const rf = response.data['refresh_token'];
		const environment = response.data['env_name'];
		res.render('dashboard', {roles: roles, name: name, tokens: response.data, decodedToken: stringifiedDecodedToken,
		env: environment, rf: rf});
	}).catch(error => {
		console.log(error);
	})
})
app.listen(1338, () => {
	console.log('listening on port 1338');
})
