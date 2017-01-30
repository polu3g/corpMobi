'use strict';

angular.module('login.controllers', ['customerModule','quotedefModule'])
        .controller('LoginCtrl', function ($scope, $timeout, $stateParams, 
                ionicMaterialInk, $ionicSideMenuDelegate,cfg,$log,$rootScope,$state,$cacheFactory,Customer,QuoteDefaults) {
            $scope.$parent.clearFabs();
            $ionicSideMenuDelegate.canDragContent(false);
            $timeout(function () {
                $scope.$parent.hideHeader();
            }, 0);
            ionicMaterialInk.displayEffect();
            $cacheFactory.get('$http').removeAll();

            $scope.langKey = 'en';
            $scope.envKey = 'apigee';


            $scope.username = 'vumarv2';
            $scope.password = 'help123';

            $scope.dynatitle = cfg.appName;
            var baseURL = cfg.apiUrl;
            var loginURL = 'https://omcorp-mps-test.apigee.net/oauth/v1/token';
            //'https://test.iedp.api.om.com/oauth/v1/token'
            //'https://omcorp-mps-dev.apigee.net/oauth/v1/token'
            //'https://omcorp-mps-test.apigee.net/oauth/v1/token'
            //'https://g573g.houston.om.com/api/public/login'
            $scope.showPassword = function (isChecked) {
                document.getElementById('password').type = isChecked ? 'text' : 'password';
            }

            $scope.onEnvKeyChange = function (envKey) {
                if (envKey === 'dev') {
                    baseURL = 'https://iedp-itg3.itcs.om.com/api/';
                    loginURL = baseURL + 'public/login';
                } else if (envKey === 'apigee') {
                    baseURL = 'https://omcorp-mps-dev.apigee.net/api/';
                    loginURL = 'https://omcorp-mps-dev.apigee.net/oauth/v1/token';
                } else {
                    //baseURL = 'https://iedp-sdprdl.houston.om.com/api/';
                    baseURL = 'https://iedp-staging.itcs.om.com/api/';
                    loginURL = baseURL + 'public/login';
                }
            }
            $scope.onLangKeyChange = function (langKey) {
                localStorage.removeItem('NG_TRANSLATE_LANG_KEY');
                $translate.use(langKey);
            }

            $scope.doLogin = function (username, password) {          
                if (cfg.appDebug) {
                    localStorage.setItem('hidSMVal', 'TYAS656565');
                    localStorage.setItem('username', 'Srumar');
                    window.location.href = "partials/landing.html";
                    return true;
                }

                $.support.cors = true;
                //alert($('#userName').val());
                var LogonMod = {
                    userName: username,
                    password: password
                };
                var apigeeKey = {
                    apiKey: 'EwsnKRZsMyEtmhDGBcn',
                    apiSecret: 'EOarqJ4D',
                    grantType: 'client_credentials'
                };
                $timeout(function () {
                    $rootScope.$broadcast('loading:show');
                }, 0);

                if (loginURL.indexOf('apigee') > 0) {
                    $.ajaxSetup({
                        contentType: "application/x-www-form-urlencoded;charset=utf-8",
                        data: $.param(apigeeKey),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                        }
                    });
                } else {
                    $.ajaxSetup({
                        contentType: "application/json;charset=utf-8",
                        data: JSON.stringify(LogonMod)
                    });
                }

                $.ajax({
                    url: loginURL,
                    xhrFields: {withCredentials: true},
                    crossDomain: true,
                    async: true,
                    type: 'POST',
                    success: function (data) {
                        if (data != "") {
                            if(typeof data.userObject === 'undefined'){
                                data.userObject = data;
                            }
                            localStorage.setItem('cfg.apiUrl', baseURL + 'v1/');
                            localStorage.setItem('hidSMVal', data);
                            localStorage.setItem('username', data.userObject.FirstName);
                            localStorage.setItem('Culture', data.userObject.Culture);
                            localStorage.setItem('CurrentCompany', data.userObject.CurrentCompany);
                            localStorage.setItem('CurrentCompanyCountryCode', data.userObject.CurrentCompanyCountryCode);
                            localStorage.setItem('access_token', data.access_token);
                            localStorage.setItem('token_expires_in', data.expires_in);
                            
                            var CountryName = "United States";
                            if (data.userObject.CurrentCompanyCountryCode === 'US')
                                CountryName = "United States";
                            else if (data.userObject.CurrentCompanyCountryCode === 'GB')
                                CountryName = "United Kingdom";
                            
                            localStorage.setItem('CurrentCompanyCountryName', CountryName);
                            localStorage.setItem('Email', data.userObject.Email);
                            localStorage.setItem('FirstName', data.userObject.FirstName);
                            localStorage.setItem('LastName', data.userObject.LastName);
                            localStorage.setItem('PortalUserID', data.userObject.PortalUserID);
                            localStorage.setItem('CurrentCompanyCurrencyAbbreviation', data.userObject.CurrentCompanyCurrencyAbbreviation.trim());
                            localStorage.setItem('CurrentCompanyCurrencySymbol', data.userObject.CurrentCompanyCurrencySymbol.trim());
                            // lets bootstrap here
                            Customer.listAll(self.customers).then(function (customers) {
                                $rootScope.customers = customers;
                                localStorage.setItem('customers',JSON.stringify( customers));
                                // @TBD remove comment
                                return QuoteDefaults.getDefaults();                                
                            }, function (error) {
                                $log.debug(error);
                            }).then(function (quoteDef) {
                                $rootScope.quoteDef = quoteDef;
                                $state.go('app.profile');
                            }, function (error) {
                                $log.debug(error);
                                //$state.go('app.profile');
                            });                            
                        } else {
                            alert('login error');
                            localStorage.removeItem('hidSMVal');
                            localStorage.removeItem('username');
                        }
                    },
                    error: function (httpObj, textStatus) {
                        $log.debug(JSON.stringify(httpObj));
                        localStorage.removeItem('hidSMVal');
                        localStorage.removeItem('username');
                        if (httpObj.status == 401)
                            alert((JSON.parse(httpObj.responseText)).Message);
                        else
                            alert('Sorry!!! the system is not able to negotiate with a om network..');

                        $timeout(function () {
                            $rootScope.$broadcast('loading:hide');
                        }, 0);
                    }
                });

            };

        });