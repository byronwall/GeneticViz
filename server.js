var path = require("path")
var connect = require('connect');
var serveStatic = require('serve-static');

var staticPath = path.join(__dirname, "dist")

connect().use(serveStatic(staticPath)).listen(8080, function(){
    console.log('Server running on 8080...');
});