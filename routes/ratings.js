var config = require( '../config' )
    , dao = require( '../models/dao' )( 'rate' ),
      fs = require( 'fs' );

exports.findByEventId = function( req, res ) {
    dao.query( 'filter', {key: [req.params.id]}, function( err, list ) {
        if( err ) {
            res.send( 404, err );
        } else {
            res.send( list );
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