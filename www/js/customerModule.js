'use strict';

angular.module('customerModule', [])
        .factory('Customer', ['CustomerSvc', 'CustomerLocationSvc', '$log', '$q', '$rootScope', function (CustomerSvc, CustomerLocationSvc, $log, $q, $rootScope) {
                var custfactory = {};
                custfactory.listAll = function (items) {
                    var deferred = $q.defer();
                    CustomerSvc.query({page: 1})
                            .$promise.then(
                                    function (payload) {
                                        localStorage.setItem('allcustomers',JSON.stringify(payload));
                                        $rootScope.allcustomers = payload;
                                        items = $.grep(payload, function (elm) {
                                            elm.display = elm.CompanyName;
                                            elm.value = elm.CustomerId;
                                            return (elm.CreatedBy == localStorage.getItem('PortalUserID'));
                                            //return true;
                                        });
                                        deferred.resolve(items);
                                    },
                                    function (errorPayload) {
                                        $log.error('failure loading data', errorPayload);
                                        deferred.reject(errorPayload);
                                    });
                    return deferred.promise;
                }
                custfactory.listAllLocations = function (cid) {
                    var deferred = $q.defer();
                    CustomerLocationSvc.query({cid: cid})
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
                custfactory.save = function (custObj) {
                    var deferred = $q.defer();
                    // create
                    var entry = new CustomerSvc(); //You can instantiate resource class
                    entry.CompanyName = custObj.CompanyName;
                    entry.Description = custObj.Description;
                    entry.VATRegistrationNumber = 'GHGHJJ988123';
                    entry.EmailAddress = custObj.EmailAddress;
                    entry.CentralizedBillingAddress = false;
                    if (custObj.CustomerId)
                        entry.CustomerId = custObj.CustomerId;

                    entry.BillingAddress = {};
                    entry.BillingAddress.CountryName = localStorage.getItem('CurrentCompanyCountryName');
                    entry.BillingAddress.ZipCode = custObj.PhysicalAddress.ZipCode;
                    entry.BillingAddress.City = custObj.PhysicalAddress.City;
                    entry.BillingAddress.State = custObj.PhysicalAddress.State;
                    entry.BillingAddress.AddressLine1 = custObj.PhysicalAddress.AddressLine1;
                    entry.BillingAddress.AddressType = 'BillingAddress';

                    entry.PhysicalAddress = angular.copy(entry.BillingAddress);
                    entry.PhysicalAddress.AddressType = 'PhysicalAddress';

                    if (custObj.CustomerId) {
                        CustomerSvc.update({cid: entry.CustomerId}, entry, function (payload) {
                            deferred.resolve(payload);

                        }, function (errResponse) {
                            deferred.reject(errResponse);
                        }); //saves an entry. Assuming $scope.entry is the Entry object                      
                    } else {
                        CustomerSvc.save({}, entry, function (payload) {
                            deferred.resolve(payload);

                        }, function (errResponse) {
                            deferred.reject(errResponse);
                        }); //saves an entry. Assuming $scope.entry is the Entry object  
                    }
                    return deferred.promise;
                }
                custfactory.saveLocation = function (locObj) {
                    var deferred = $q.defer();
                    // create
                    var entry = new CustomerLocationSvc(); //You can instantiate resource class
                    entry.LocationName = locObj.LocationName;

                    entry.BillingAddress = {};
                    entry.BillingAddress.CountryName = localStorage.getItem('CurrentCompanyCountryName');
                    entry.BillingAddress.ZipCode = locObj.PhysicalAddress.ZipCode;
                    entry.BillingAddress.City = locObj.PhysicalAddress.City;
                    entry.BillingAddress.State = locObj.PhysicalAddress.State;
                    entry.BillingAddress.AddressLine1 = locObj.PhysicalAddress.AddressLine1;
                    entry.BillingAddress.AddressLine2 = locObj.PhysicalAddress.AddressLine1;
                    entry.BillingAddress.AddressType = 'BillingAddress';

                    entry.PhysicalAddress = angular.copy(entry.BillingAddress);
                    entry.PhysicalAddress.AddressType = 'PhysicalAddress';

                    CustomerLocationSvc.save({cid: locObj.custid}, entry, function (payload) {
                        deferred.resolve(payload);

                    }, function (errResponse) {
                        deferred.reject(errResponse);
                    }); //saves an entry. Assuming $scope.entry is the Entry object  

                    return deferred.promise;
                }
                return custfactory;
            }])
        .factory('CustomerSvc', function ($resource, cfg) {
            return $resource(cfg.apiUrl + 'Customers/:cid', {cid: "@id", rowCount: 1000, page: "@page"}, {
                get: {
                    method: 'GET', // this method issues a GET request
                    cache: true
                },
                query: {method: 'GET', cache: true, isArray: true},
                update: {
                    method: 'PUT' // this method issues a PUT request
                }});
        })
        .factory('CustomerLocationSvc', function ($resource, cfg) {
            return $resource(cfg.apiUrl + 'Customers/:cid/Locations/:locationId', {cid: "@id", locationId: "@locationId"}, {
                get: {
                    method: 'GET', // this method issues a GET request
                    cache: true
                },
                query: {method: 'GET', cache: true, isArray: true},
                update: {
                    method: 'PUT' // this method issues a PUT request
                }});
        })
        .factory('CustomerUpdateSvc', function ($resource, cfg) {
            return $resource(cfg.apiUrl + 'Customers', {cid: "@id"}, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                }});
        })
        .service('popupService', function ($window) {
            this.showPopup = function (message) {
                return $window.confirm(message);
            }
        });