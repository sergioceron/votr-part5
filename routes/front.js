var config = require( '../config' )
    , dao = require( '../models/dao' )( 'front' )
    , crypto = require( 'crypto' )
    , fs = require( 'fs' )
    , mysql = require( 'mysql' );

var pool = mysql.createPool( {
    host: '172.31.43.175',
    user: 'coparmex',
    password: 'mdk2v3c1r',
    database: 'diaempresario'
} );

exports.events = function( req, res ) {
    dao.query( 'events', {}, function( err, events ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            res.send( {
                version: 1,
                minDate: "08/04/2014",
                maxDate: "08/04/2014",
                events: events
            } );
        }
    } );
};

exports.sponsors = function( req, res ) {
    dao.query( 'sponsors', {}, function( err, sponsors ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            res.send( {
                version: 1,
                sponsors: sponsors
            } );
        }
    } );
};

exports._events = function( req, res ) {
    dao.query( 'events', {}, function( err, events ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            res.send( events );
        }
    } );
};

exports._sponsors = function( req, res ) {
    dao.query( 'sponsors', {}, function( err, sponsors ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            res.send( sponsors );
        }
    } );
};

exports.signin = function( req, res ) {
    /*dao.find( {key: [req.params.id]}, function( err, user ) {
        if( err ) {
            res.send( 404, 'We could not locate that user' );
        } else {
            var md5sum = crypto.createHash( 'md5' );
            md5sum.update( JSON.stringify( user ) );
            res.send( {
                hash: md5sum.digest( 'hex' ),
                mindate: (new Date( 2014, 03, 08, 12, 0, 0, 0 )).getTime(),
                maxdate: (new Date( 2014, 03, 08, 12, 0, 0, 0 )).getTime()
            } );
        }
    } );*/
    var query = pool.query( 'SELECT * FROM agendacontacto WHERE gafete=?', [ req.params.id ], function( err, result ) {
        if( err ) {
            res.send( 404, 'We could not locate that user ' );
        } else {
            if( result.length > 0 ){

                var _signin = {};
                _signin.date = new Date();
                _signin.type = 'signin';
                _signin.gafete = req.params.id;
                _signin.device = req.headers['user-agent'];
                _signin.uid = result[0].id;
                dao.persist( null, _signin, function( err, body ) { } );

                res.send( {
                    hash: result[0].id,
                    mindate: (new Date( 2014, 03, 08, 12, 0, 0, 0 )).getTime(),
                    maxdate: (new Date( 2014, 03, 08, 12, 0, 0, 0 )).getTime()
                } );
            } else {
                res.send( 404, 'We could not locate that user ' );
            }
        }
    } );
};

exports.comment = function( req, res ) {
    var _comment = req.body;
    _comment.type = 'comment';
    _comment.date = new Date();
    _comment.uid  = req.query.hash;
    dao.persist( null, _comment, function( err, body ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            res.send( JSON.stringify( { error: false } ) );
        }
    } );
};

exports.rate = function( req, res ) {
    var _rate = req.body;
    _rate.type = 'rate';
    _rate.date = new Date();
    _rate.uid  = req.query.hash;
    dao.persist( null, _rate, function( err, body ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            res.send( JSON.stringify( { error: false } ) );
        }
    } );
};

exports.evaluate = function( req, res ) {
    var _evaluation = req.body;
    _evaluation.type = 'evaluation';
    _evaluation.date = new Date();
    _evaluation.uid  = req.query.hash;
    dao.persist( null, _evaluation, function( err, body ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            res.send( JSON.stringify( { error: false } ) );
        }
    } );
};

