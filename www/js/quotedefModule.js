'use strict';

angular.module('quotedefModule', [])
        .factory('QuoteDefaults',['QuoteDefaultsSvc','$log','$q','$rootScope', function (QuoteDefaultsSvc,$log,$q,$rootScope) {
            var quotedeffactory = {};
            quotedeffactory.getDefaults = function () {
                var deferred = $q.defer();
                    QuoteDefaultsSvc.query()
                        .$promise.then(
                                function (payload) {                                        
                                        deferred.resolve(payload);
                                },
                                function (errorPayload) {
                                    $log.error('failure loading data', errorPayload);
                                    deferred.reject(errorPayload);
                                });   
                                return deferred.promise;
            }

            quotedeffactory.save = function () {
                //..
            }

            return quotedeffactory;
        }])
        .factory('QuoteDefaultsSvc', function ($resource, cfg) {
            return $resource(cfg.apiUrl + 'ReferenceData/QuoteDefaults', {}, {
                get: {
                    method: 'GET', // this method issues a GET request
                    cache: true
                },
                query: {method: 'GET', cache: true, isArray: false},
                update: {
                    method: 'PUT' // this method issues a PUT request
                }});
        })
        .service('popupService', function ($window) {
            this.showPopup = function (message) {
                return $window.confirm(message);
            }
        });