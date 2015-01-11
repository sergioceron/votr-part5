var config = require( '../config' );
var unders = require('underscore');

var getDb = function( cookie ) {
    var params = {};
    if( cookie ) {
        params.url = config.couchdb.url;
        params.cookie = 'AuthSession=' + cookie;
    } else {
        params.url = config.couchdb.secureUrl;
    }
    return require( 'nano' )( params );
};

module.exports = function(entityName) {
    return {
        list: function( cookie, callback ) {
            getDb( cookie ).view( entityName, 'list', function( err, body ) {
                if( err ) {
                    callback( err );
                } else {
                    var entities = unders.map( body.rows, function( row ) { return row.value } );
                    callback( null, entities );
                }
            } );
        },
        // TODO: use cookie in getDb for security
        persist: function( cookie, entity, callback ) {
            if( !entity.type ) entity.type = entityName;

            getDb().insert( entity, function( err, body ) {
                if( !entity._id ) entity._id = body.id;
                callback( err, body );
            } );
        },

        remove: function( cookie, id, rev, callback ) {
            getDb( cookie ).destroy( id, rev, function( err, body ) {
                callback( err, body );
            } );
        },

        find: function( params, callback ) {
            var entity;
            getDb().view( entityName, 'get', params, function( err, body ) {
                if( err ) {
                    callback( err, null );
                } else {
                    if( body.rows.length == 0 ) {
                        callback( 'No match for: ' + JSON.stringify( params ), null );
                    } else {
                        entity = body.rows[0].value;
                        callback( null, entity );
                    }
                }
            } );
        },

        query: function( view, params, callback ) {
            getDb().view( entityName, view, params, function( err, body ) {
                if( err ) {
                    callback( err, null );
                } else {
                    if( body.rows.length == 0 ) {
                        callback( 'No match for: ' + view + ', ' + JSON.stringify( params ), null );
                    } else {
                        var entities = unders.map( body.rows, function( row ) { return row.value } );
                        callback( null, entities );
                    }
                }
            } );
        }
    };
};



