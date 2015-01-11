/**
 * Module dependencies.
 */

var express    = require( 'express' )
  , http       = require( 'http' )
  , php        = require( 'node-php' )
  , path       = require( 'path' )
  , config     = require( './config' );

var app        = express()
  , server     = http.createServer( app );

app.configure( function() {
    //app.enable( 'view cache' );
    app.engine( 'hjs', require('hogan-express'));
    app.set( 'port', process.env.PORT || 80 );
    app.set( 'views', __dirname + '/views' );
    app.set( 'view engine', 'hjs' );
    app.set( 'partials', { topbar: __dirname + '/views/topbar',
                           navbar: __dirname + '/views/navbar' } );
    app.use( express.favicon() );
    app.use( express.logger( 'dev' ) );
    app.use( express.bodyParser() );
    app.use( express.methodOverride() );
    app.use( express.cookieParser( config.cookiesecret ) );
    app.use( app.router );
    app.use( express.static( path.join( __dirname, 'public' ) ) );
    //
} );

app.configure( 'development', function() {
    app.use( express.errorHandler() );
} );

app.use( "/blog/", php.cgi( __dirname + '/php/wordpress' ) );

server.listen( app.get( 'port' ), function() {
    console.log( "Express server listening on port " + app.get( 'port' ) );
} );

var conferences = require( './routes/conferences' );
var comments = require( './routes/comments' );
var sponsors = require( './routes/sponsors' );
var general = require( './routes/general' );
var ratings = require( './routes/ratings' );
var stands = require( './routes/stands' );
var upload = require( './models/upload' );
var users = require( './routes/users' );
var front = require( './routes/front' );

// ADMIN PANEL
app.get( '/admin/', function( req, res ) {
    if( process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https' ) {
        return res.redirect( 'https://' + req.get( 'Host' ) + req.url );
    } else {
        general.admin( req, res );
    }
} );

app.get('/', function(req, res) {
    if(req.headers.host === 'conferences.dotrow.com') {
        res.send(200);
    } else {
        res.sendfile( path.join( __dirname, 'public/index.html'));
    }
});

// REST API
app.get    ( '/api/conferences',     conferences.list );
app.get    ( '/api/conferences/:id', conferences.findById );
app.delete ( '/api/conferences/:id', conferences.remove );
app.post   ( '/api/conferences',     conferences.persist );
app.put    ( '/api/conferences',     conferences.generate );

app.get    ( '/api/sponsors',     sponsors.list );
app.get    ( '/api/sponsors/:id', sponsors.findById );
app.delete ( '/api/sponsors/:id', sponsors.remove );
app.post   ( '/api/sponsors',     sponsors.persist );
app.put    ( '/api/sponsors',     sponsors.generate );

app.post   ( '/api/sessions',   general.login );
app.delete ( '/api/sessions',   general.logout );

app.get    ( '/api/stands',     stands.list );
app.get    ( '/api/stands/:id', stands.findById );
app.delete ( '/api/stands/:id', stands.remove );
app.post   ( '/api/stands',     stands.persist );
app.put    ( '/api/stands',     stands.generate );

app.get    ( '/api/users',     users.list );
app.get    ( '/api/users/:id', users.findById );
app.delete ( '/api/users/:id', users.remove );
app.post   ( '/api/users',     users.persist );
app.put    ( '/api/users',     users.generate );

app.get    ( '/api/comments',     comments.list );
app.get    ( '/api/comments/:id', comments.findByEventId );

app.get    ( '/api/ratings',     ratings.list );
app.get    ( '/api/ratings/:id', ratings.findByEventId );

app.post   ( '/api/upload',    upload.upload );

// STATS API
//app.get    ( '/stats/conferences',     conferences.list );

// FRONT END API
app.get    ( '/signin/:id',  front.signin );
app.get    ( '/events.json',  front.events );
app.get    ( '/sponsors.json',  front.sponsors );
app.get    ( '/_events.json',  front._events );
app.get    ( '/_sponsors.json',  front._sponsors );
app.post   ( '/comment',  front.comment );
app.post   ( '/rate',  front.rate );
app.post   ( '/evaluate',  front.evaluate );
