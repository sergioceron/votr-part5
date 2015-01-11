var config = require( '../config' )
    , sessions = require( '../models/sessions' );

exports.admin = function( req, res ) {
    var username = sessions.getLoggedInUser( req.cookies['AuthSession'] );
    res.render( 'admin', {username: username} );
};

exports.login = function( req, res ) {
    sessions.login( req.body.username, req.body.password, req.body.remember, function( err, cookie ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            res.cookie( cookie );
            res.send( req.body );
        }
    } );
};

exports.logout = function( req, res ) {
    sessions.removeLoggedInUser( req.cookies['AuthSession'] );
    res.clearCookie( 'AuthSession' );
    res.send( 200, "OK" );
};