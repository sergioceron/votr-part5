var config = require( '../config' )
    , dao = require( '../models/dao' )( 'stand' ),
      fs = require( 'fs' );

exports.findById = function( req, res ) {
    dao.query( 'all', {key: [req.params.id], reduce: false}, function( err, stand ) {
        if( err ) {
            res.send( 404, 'We could not locate your stand' );
        } else {
            res.send( JSON.stringify( stand ) );
        }
    } );
};

exports.persist = function( req, res ) {
    dao.persist( req.cookies['AuthSession'], req.body, function( err, body ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            // update the doc revision
            req.body._rev = body.rev;
            res.send( req.body );
        }
    } );
};

exports.remove = function( req, res ) {
    dao.remove( req.cookies['AuthSession'], req.params.id, req.query.rev, function( err, body ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            res.send( 200, "OK" );
        }
    } );
};

exports.list = function( req, res ) {
    dao.list( req.cookies['AuthSession'], function( err, list ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            res.send( list );
        }
    } );
};

exports.generate = function( req, res ) {
    dao.list( req.cookies['AuthSession'], function( err, list ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            fs.writeFile( __dirname + '/../public/stands.json', JSON.stringify( list, null, 4 ), function( err ) {
                if( err ) {
                    res.send( 401, JSON.stringify( { error: true } ) );
                } else {
                    res.send( JSON.stringify( { error: false } ) );
                }
            } );
        }
    } );
};
