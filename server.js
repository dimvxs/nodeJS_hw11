var express  = require('express'); 
var app = express();
var path = require('path');
var bodyParser = require('body-parser'); 
var port = 8080; 
var editRoutes = require('./js/edit');
var authorizationRoutes = require('./js/authorization');

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'html')));


app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'html/authorization.html'));
});


app.use('/edit', editRoutes);
app.use('/authorization', authorizationRoutes);






app.listen(port, function() { 
	console.log('app listening on port: 8080'); 
}); 