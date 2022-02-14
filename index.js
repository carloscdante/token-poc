const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	path = require('path'),
	axios = require('axios'),
	qs = require('qs'),
	jwt_decode = require('jwt-decode');

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

	axios.post('http://localhost:3000/user/login', qs.stringify(creds), config)
	.then(response => {
		const decoded = jwt_decode(response.data['id_token']);
		const stringifiedDecodedToken = JSON.stringify(decoded);
		res.render('dashboard', {tokens: response.data, decodedToken: stringifiedDecodedToken});
	})
})

app.listen(1337, () => {
	console.log('listening on port 1337');
})
