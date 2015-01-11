'use strict';

var app = angular.module( 'votr', ['ngResource', 'ngRoute', 'ui.bootstrap.datetimepicker', 'angularFileUpload'] );

app.config( function( $routeProvider ) {
    $routeProvider
        .when( '/', {templateUrl: 'index.html' } )
        .when( '/login', {templateUrl: 'login.html', controller: 'LoginCtrl'} )
        .when( '/logout', {templateUrl: 'login.html', controller: 'LogoutCtrl'} )
        .when( '/conferences', {templateUrl: './conferences/list.html', controller: 'ConferencesController'} )
        .when( '/sponsors', {templateUrl: './sponsors/list.html', controller: 'SponsorsController'} )
        .when( '/stands', {templateUrl: './stands/list.html', controller: 'StandsController'} )
        .when( '/users', {templateUrl: './users/list.html', controller: 'UsersController'} )
        .otherwise( {redirectTo: '/'} );
} );

app.config( function( $httpProvider ) {
    $httpProvider.interceptors.push( function( $rootScope, $location, $q ) {
        return {
            'request': function( request ) {
                // if we're not logged-in to the AngularJS app, redirect to login page
                $rootScope.loggedIn = $rootScope.loggedIn || $rootScope.username;
                if( !$rootScope.loggedIn && $location.path() != '/login' ) {
                    $location.path( '/login' );
                }
                return request;
            },
            'responseError': function( rejection ) {
                // if we're not logged-in to the web service, redirect to login page
                if( rejection.status === 401 && $location.path() != '/login' ) {
                    $rootScope.loggedIn = false;
                    $location.path( '/login' );
                }
                return $q.reject( rejection );
            }
        };
    } );
} );

app.factory( 'UsersService', function( $resource ) {
    return $resource( '/api/users/:id', null, {
        'generate': { method: 'PUT', isArray:true }
    } );
} );

app.factory( 'StandsService', function( $resource ) {
    return $resource( '/api/stands/:id', null, {
        'generate': { method: 'PUT' }
    } );
} );

app.factory( 'SponsorsService', function( $resource ) {
    return $resource( '/api/sponsors/:id', null, {
        'generate': { method: 'PUT' }
    } );
} );

app.factory( 'ConferencesService', function( $resource ) {
    return $resource( '/api/conferences/:id', null, {
        'generate': { method: 'PUT' }
    } );
} );

app.factory( 'CommentsService', function( $resource ) {
    return $resource( '/api/comments/:id', null, {
        'get': { method: 'GET', isArray: true }
    } );
} );

app.factory( 'RatingsService', function( $resource ) {
    return $resource( '/api/ratings/:id', null, {
        'get': { method: 'GET', isArray: true }
    } );
} );

app.factory( 'SessionService', function( $resource ) {
    return $resource( '/api/sessions' );
} );

app.controller( 'LoginCtrl', function( $scope, $rootScope, $location, SessionService ) {
    $scope.user = { username: '', password: '', remember: false };

    $scope.login = function() {
        $scope.user = SessionService.save( $scope.user, function( success ) {
            $rootScope.loggedIn = true;
            $location.path( '/' );
        }, function( error ) {
            $scope.loginError = true;
            $scope.user.password = '';
        } );
    };
} );

app.controller( 'LogoutCtrl', function( $rootScope, $location, SessionService ) {
    (new SessionService()).$delete( function( success ) {
        $rootScope.loggedIn = false;
        $location.path( '/login' );
    } );
} );


app.controller( 'UsersController', function( $scope, $location, $timeout, UsersService ) {
    var datatable = undefined;

    UsersService.query( function( users ) {
        $scope.users = users;
    } );

    $scope.refresh = function() {
        if( datatable != undefined )
            datatable.fnDestroy();
        $timeout( function() {
            datatable = $( '#tableUsers' ).dataTable( {
                "destroy": true,
                "bStateSave": true
            } );
        } );
    };

    $scope.$watchCollection( 'users', function( oldCollection, newCollection ) {
        if( oldCollection === newCollection ) return;
        $scope.refresh();
    } );

    $scope.edit = function( user ) {
        $scope.opts = ['on', 'off'];

        if( user === 'new' ) {
            $scope.isNew = true;
            $scope.entity = { code: '', folio: '', name: '', email: '', organization: '', job: '', phone: '', delivered: false, status: false, type: 'user' };
        } else {
            $scope.isNew = false;
            $scope.entity = user;
        }

        $scope.image = {};
        $scope.image.preview = '/images/user/' + $scope.entity.image;
    };

    $scope.persist = function() {
        if( !$scope.entity._id ) {
            var newUser = new UsersService( $scope.entity );
            newUser.$save( function() {
                $scope.users.push( newUser );
            } );
        } else {
            $scope.users.forEach( function( e ) {
                if( e._id === $scope.entity._id ) {
                    e.$save();
                    $scope.refresh();
                }
            } );
        }
    };

    $scope.remove = function() {
        $scope.users.forEach( function( e, index ) {
            if( e._id == $scope.entity._id ) {
                $scope.entity.$delete( {id: $scope.entity._id, rev: $scope.entity._rev}, function() {
                    $scope.users.splice( index, 1 );
                } );
            }
        } );
    };

    $scope.generate = function() {
        UsersService.generate( function( response ) {
            if( response.error ) {
                $scope.message = {
                    type: 'danger',
                    title: 'Oh snap! You got an error!',
                    text: 'Something wrong happen trying to generate users file.',
                    dismiss: true,
                    tryAgain: $scope.generate
                };
                $( '.alert' ).fadeIn( 'slow' );
            } else {
                $scope.message = {
                    type: 'success',
                    title: 'Users file succesfully generated!',
                    link: 'view file',
                    url: '/users.json'
                };
                $( '.alert' ).fadeIn( 'slow' ).delay( 4000 ).fadeOut( 'slow' );
            }
        } );
    };

} );


app.controller( 'StandsController', function( $scope, $location, $timeout, StandsService ) {
    var datatable = undefined;

    StandsService.query( function( stands ) {
        $scope.stands = stands;
    } );

    $scope.refresh = function() {
        if( datatable != undefined )
            datatable.fnDestroy();
        $timeout( function() {
            datatable = $( '#tableStands' ).dataTable( {
                "destroy": true,
                "bStateSave": true
            } );
        } );
    };

    $scope.$watchCollection( 'stands', function( oldCollection, newCollection ) {
        if( oldCollection === newCollection ) return;
        $scope.refresh();
    } );

    $scope.edit = function( stand ) {
        $scope.opts = ['on', 'off'];

        if( stand === 'new' ) {
            $scope.isNew = true;
            $scope.entity = { title: '', description: '', location: '', startDate: '', endDate: '', image: '', organization: '', type: 'stand' };
        } else {
            $scope.isNew = false;
            $scope.entity = stand;
        }

        $scope.image = {};
        $scope.image.preview = '/images/stand/' + $scope.entity.image;
    };

    $scope.persist = function() {
        if( !$scope.entity._id ) {
            var newStand = new StandsService( $scope.entity );
            newStand.$save( function() {
                $scope.stands.push( newStand );
            } );
        } else {
            $scope.stands.forEach( function( e ) {
                if( e._id === $scope.entity._id ) {
                    e.$save();
                    $scope.refresh();
                }
            } );
        }
    };

    $scope.remove = function() {
        $scope.stands.forEach( function( e, index ) {
            if( e._id == $scope.entity._id ) {
                $scope.entity.$delete( {id: $scope.entity._id, rev: $scope.entity._rev}, function() {
                    $scope.stands.splice( index, 1 );
                } );
            }
        } );
    };

    $scope.generate = function() {
        StandsService.generate( function( response ) {
            if( response.error ) {
                $scope.message = {
                    type: 'danger',
                    title: 'Oh snap! You got an error!',
                    text: 'Something wrong happen trying to generate stands file.',
                    dismiss: true,
                    tryAgain: $scope.generate
                };
                $( '.alert' ).fadeIn( 'slow' );
            } else {
                $scope.message = {
                    type: 'success',
                    title: 'Stands file succesfully generated!',
                    link: 'view file',
                    url: '/stands.json'
                };
                $( '.alert' ).fadeIn( 'slow' ).delay( 4000 ).fadeOut( 'slow' );
            }
        } );
    };

} );

app.controller( 'SponsorsController', function( $scope, $location, $timeout, SponsorsService ) {
    var datatable = undefined;

    SponsorsService.query( function( sponsors ) {
        $scope.sponsors = sponsors;
    } );

    $scope.refresh = function() {
        if( datatable != undefined )
            datatable.fnDestroy();
        $timeout( function() {
            datatable = $( '#tableSponsors' ).dataTable( {
                "destroy": true,
                "bStateSave": true
            } );
        } );
    };

    $scope.$watchCollection( 'sponsors', function( oldCollection, newCollection ) {
        if( oldCollection === newCollection ) return;
        $scope.refresh();
    } );

    $scope.edit = function( sponsor ) {
        $scope.opts = ['on', 'off'];

        if( sponsor === 'new' ) {
            $scope.isNew = true;
            $scope.entity = { name: '', email: '', url: '', image: '', type: 'sponsor', subtype: 'sponsor' };
        } else {
            $scope.isNew = false;
            $scope.entity = sponsor;
        }

        $scope.image = {};
        $scope.image.preview = '/images/sponsor/' + $scope.entity.image;
    };

    $scope.persist = function() {
        if( !$scope.entity._id ) {
            var newSponsor = new SponsorsService( $scope.entity );
            newSponsor.$save( function() {
                $scope.sponsors.push( newSponsor );
            } );
        } else {
            $scope.sponsors.forEach( function( e ) {
                if( e._id === $scope.entity._id ) {
                    e.$save();
                    $scope.refresh();
                }
            } );
        }
    };

    $scope.remove = function() {
        $scope.sponsors.forEach( function( e, index ) {
            if( e._id == $scope.entity._id ) {
                $scope.entity.$delete( {id: $scope.entity._id, rev: $scope.entity._rev}, function() {
                    $scope.sponsors.splice( index, 1 );
                } );
            }
        } );
    };

    $scope.generate = function() {
        SponsorsService.generate( function( response ) {
            if( response.error ) {
                $scope.message = {
                    type: 'danger',
                    title: 'Oh snap! You got an error!',
                    text: 'Something wrong happen trying to generate sponsors file.',
                    dismiss: true,
                    tryAgain: $scope.generate
                };
                $( '.alert' ).fadeIn( 'slow' );
            } else {
                $scope.message = {
                    type: 'success',
                    title: 'Sponsors file succesfully generated!',
                    link: 'view file',
                    url: '/sponsors.json'
                };
                $( '.alert' ).fadeIn( 'slow' ).delay( 4000 ).fadeOut( 'slow' );
            }
        } );
    };

} );

app.controller( 'ConferencesController', function( $scope, $location, $timeout, ConferencesService, CommentsService, RatingsService ) {
    var datatable = undefined;
    var datatableRatings = undefined;
    var datatableComments = undefined;

    ConferencesService.query( function( conferences ) {
        $scope.conferences = conferences;
    } );

    $scope.refresh = function() {
        if( datatable != undefined )
            datatable.fnDestroy();
        $timeout( function() {
            datatable = $( '#tableConferences' ).dataTable( {
                "destroy": true,
                "bStateSave": true
            } );
        } );
    };

    $scope.refreshComments = function(){
        if( datatableComments != undefined )
            datatableComments.fnDestroy();
        $timeout( function() {
            datatableComments = $( '#tableComments' ).dataTable( {
                "destroy": true,
                "bStateSave": true
            } );
        });
    };

    $scope.refreshRatings = function(){
        if( datatableRatings != undefined )
            datatableRatings.fnDestroy();
        $timeout( function() {
            datatableRatings = $( '#tableRatings' ).dataTable( {
                "destroy": true,
                "bStateSave": true
            } );
        });
    };

    $scope.$watchCollection( 'conferences', function( oldCollection, newCollection ) {
        if( oldCollection === newCollection ) return;
        $scope.refresh();
    } );

    $scope.$watchCollection( 'comments', function( oldCollection, newCollection ) {
        if( oldCollection === newCollection ) return;
        $scope.refreshComments();
    } );

    $scope.$watchCollection( 'ratings', function( oldCollection, newCollection ) {
        if( oldCollection === newCollection ) return;
        $scope.refreshRatings();
    } );

    $scope.edit = function( conference ) {
        if( conference === 'new' ) {
            $scope.isNew = true;
            $scope.entity = { title: '', description: '', location: '', date: '', image: '', author: '', type: 'conference' };
        } else {
            $scope.isNew = false;
            $scope.entity = conference;
        }
        $scope.image = {};
        $scope.image.preview = '/images/conference/' + $scope.entity.image;
    };

    $scope.viewComments = function( conference ) {
        CommentsService.get( { id: conference._id }, function( comments ) {
            $scope.comments = comments;
            $scope.refreshComments();
        } );
    };

    $scope.viewRatings = function( conference ) {
        RatingsService.get( { id: conference._id }, function( ratings ) {
            $scope.ratings = ratings;
            $scope.refreshRatings();
        } );
    };

    $scope.persist = function() {
        if( !$scope.entity._id ) {
            var newConference = new ConferencesService( $scope.entity );
            newConference.$save( function() {
                $scope.conferences.push( newConference );
            } );
        } else {
            $scope.conferences.forEach( function( e ) {
                if( e._id === $scope.entity._id ) {
                    e.$save();
                    $scope.refresh();
                }
            } );
        }
    };

    $scope.remove = function() {
        $scope.conferences.forEach( function( e, index ) {
            if( e._id == $scope.entity._id ) {
                $scope.entity.$delete( {id: $scope.entity._id, rev: $scope.entity._rev}, function() {
                    $scope.conferences.splice( index, 1 );
                } );
            }
        } );
    };

    $scope.generate = function() {
        ConferencesService.generate( function( response ) {
            if( response.error ) {
                $scope.message = {
                    type: 'danger',
                    title: 'Oh snap! You got an error!',
                    text: 'Something wrong happen trying to generate conferences file.',
                    dismiss: true,
                    tryAgain: $scope.generate
                };
                $( '.alert' ).fadeIn( 'slow' );
            } else {
                $scope.message = {
                    type: 'success',
                    title: 'Conferences file succesfully generated!',
                    link: 'view file',
                    url: '/conferences.json'
                };
                $( '.alert' ).fadeIn( 'slow' ).delay( 4000 ).fadeOut( 'slow' );
            }
        } );
    };

} );

app.controller( 'UploadController', function( $scope, $upload, $timeout ) {
    $scope.onFileSelect = function( $files ) {
        if( $files.length > 0 ) {
            $scope.image.file = $files[0];
            if( window.FileReader && $scope.image.file.type.indexOf( 'image' ) > -1 ) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL( $scope.image.file );
                (function setPreview( fileReader ) {
                    fileReader.onload = function( e ) {
                        $timeout( function() {
                            $scope.image.preview = e.target.result;
                        } );
                    }
                })( fileReader );
            }
            $scope.image.progress = -1;
        }
    };

    $scope.startUpload = function() {
        $scope.image.progress = 0;
        var file = $scope.image.file;
        $scope.upload = $upload.upload( {
            url: '/api/upload',
            file: file,
            data: {
                folder: $scope.entity.type
            }
        } ).then( function( response ) {
                // if use $scope.image = {} then create a new object based on scope of UploadController, and ommit parent scope
                $scope.image.file = undefined;
                $scope.entity.image = response.data;
            }, null, function( evt ) {
                $scope.image.progress = parseInt( 100.0 * evt.loaded / evt.total );
            } );
    };
} );
