var config = require( '../config' )
    , db = require( 'nano' )( {url: config.couchdb.url} )

    , loggedInUsers = {}

    , addLoggedInUser = exports.addLoggedInUser = function( authSession, user ) {
        loggedInUsers[authSession] = user;
    }

    , getLoggedInUser = exports.getLoggedInUser = function( authSession ) {
        return loggedInUsers[authSession]
    }

    , removeLoggedInUser = exports.removeLoggedInUser = function( authSession ) {
        delete loggedInUsers[authSession]
    }

    , login = exports.login = function( username, password, remember, callback ) {
        db.auth( username, password, function( err, body, headers ) {
            if( err ) {
                return callback( err );
            }
            var cookie = headers['set-cookie'][0];
            var authSession = cookie.split( ';' )[0].split( '=' )[1];
            addLoggedInUser( authSession, username );

            if( remember ){
                cookie += ';max-age='+ (7*24*60*60);
            }

            callback( null, cookie );
        } );
    };
