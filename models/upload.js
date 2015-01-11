var fs = require('fs')
    , crypto = require( 'crypto' );

module.exports = function() {
    return exports;
};

var upload = module.exports.upload = function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    if( req.files.length == 0 || req.files.file.size == 0 ) {
        res.send( { msg: 'No file uploaded at ' + new Date().toString() } );
    } else {
        var file = req.files.file;
        var folder = req.body.folder;

        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

        fs.rename( file.path, __dirname + '/../public/images/' + folder + '/' + hash, function( err ) {
            if( err ) {
                res.send( { msg: 'Error uploading file ' + file.name } );
            } else {
                res.send( hash );
            }
        } );
    }
};

