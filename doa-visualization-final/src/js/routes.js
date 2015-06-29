'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'templates/dashboard.html'
            })
            .state('tables', {
                url: '/tables',
                templateUrl: 'templates/tables.html'
            })
            .state('authors', {
                url: '/authors',
                templateUrl: 'templates/authors.html'
            })
            .state('dev-multauthors', {
                url: '/dev-multauthors',
                templateUrl: 'templates/dev-multauthors.html'
            })
            .state('workload', {
                url: '/workload',
                templateUrl: 'templates/workload.html'
            })
            .state('distribution', {
                url: '/distribution',
                templateUrl: 'templates/distribution.html'
            })
            .state('distribution.details', {
                url: '/:repository',
                templateUrl: 'templates/distribution.html'
            });
    }
]);