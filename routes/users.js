var config = require( '../config' ),
    dao = require( '../models/dao' )( 'user' ),
    fs = require( 'fs' ),
    mysql = require( 'mysql' );

var pool = mysql.createPool( {
    host: '172.31.43.175',
    user: 'coparmex',
    password: 'mdk2v3c1r',
    database: 'diaempresario'
} );

exports.findById = function( req, res ) {
    var query = pool.query( 'SELECT * FROM agendacontacto WHERE gafete=?', [ req.params.id ], function( err, result ) {
        if( err ) {
            res.send( 404, 'We could not locate that user ' );
        } else {
            if( result.length > 0 ){
                var user = {};
                user._id = result[0].id;
                user.code = result[0].gafete;
                user.folio = result[0].folio;
                user.name = result[0].nombre.trim() + ' ' + result[0].aPaterno.trim() + ' ' + result[0].aMaterno.trim();
                user.organization = result[0].empresa;
                user.job = result[0].puesto;
                user.email = result[0].email;
                user.phone = result[0].telefono;
                user.delivered = result[0].entregado === 1;
                user.status = result[0].status === 1;

                if( req.query.hash ) {
                    var _contact = req.body;
                    _contact.to   = user._id;
                    _contact.type = 'contact';
                    _contact.uid  = req.query.hash;
                    dao.persist( null, _contact, function( err, body ) { } );
                }

                res.send( user );
            } else {
                res.send( 404, 'We could not locate that user ' );
            }
        }
    } );
};

exports.persist = function( req, res ) {
    var query = pool.query( 'INSERT INTO agendacontacto SET ?', req.body, function( err, result ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            // update the doc revision
            req.body._id = result.insertId;
            res.send( req.body );
        }
    } );
};

exports.remove = function( req, res ) {
    var query = pool.query( 'DELETE FROM agendacontacto WHERE id=?', pool.escape( req.params.id ), function( err, result ) {
        if( err ) {
            res.send( 500, JSON.stringify( { error: true } ) );
        } else {
            res.send( 200, "OK" );
        }
    } );
};

exports.list = function( req, res ) {
    var contacts = [];
    pool.query( 'SELECT * FROM agendacontacto', function( err, rows, fields ) {
        if( err ) {
            res.send( 401, JSON.stringify( { error: true } ) );
        } else {
            for( var c = 0; c < rows.length; c++ ) {
                var contact = {};
                contact._id = rows[c].id;
                contact.code = rows[c].gafete;
                contact.folio = rows[c].folio;
                contact.name = rows[c].nombre.trim() + ' ' + rows[c].aPaterno.trim() + ' ' + rows[c].aMaterno.trim();
                contact.organization = rows[c].empresa;
                contact.job = rows[c].puesto;
                contact.email = rows[c].email;
                contact.phone = rows[c].telefono;
                contact.delivered = rows[c].entregado === 1;
                contact.status = rows[c].status === 1;
                contacts.push( contact );
            }
            res.send( contacts );
        }
    } );
};

exports.generate = function( req, res ) {
    var contacts = [];
    pool.query( 'SELECT * FROM agendacontacto', function( err, rows, fields ) {
        if( err ) throw err;
        for( var c = 0; c < rows.length; c++ ) {
            var contact = {};
            contact._id = rows[c].id;
            contact.code = rows[c].gafete;
            contact.folio = rows[c].folio;
            contact.name = rows[c].nombre.trim() + ' ' + rows[c].aPaterno.trim() + ' ' + rows[c].aMaterno.trim();
            contact.organization = rows[c].empresa;
            contact.job = rows[c].puesto;
            contact.email = rows[c].email;
            contact.phone = rows[c].telefono;
            contact.delivered = rows[c].entregado === 1;
            contact.status = rows[c].status === 1;
            contacts.push( contact );
        }
        res.send( contacts );
    } );
};

