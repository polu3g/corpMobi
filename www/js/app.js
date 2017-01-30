// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-material', 'ionMdInput', 'ngCordova', 'ngMaterial', 'ngResource'])

        .run(function ($state, $ionicPlatform, $cordovaFile, $rootScope, $window, $ionicLoading, $ionicPopup) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                ionic.Platform.isFullScreen = true;
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
                if (window.cordova) {
                    /*$cordovaFile.writeFile(window.cordova.file.externalRootDirectory, 'proposal.csv', "pc,pc1", true).then(function(result){
                     console.log('Success! Export created!' + cordova.file.externalRootDirectory + '\proposal.csv');
                     }, function(err) {
                     console.log("ERROR");
                     });
                     */
                    var data = [{"Make": "om", "Model": "om 4345 mfp", "IP Address": null, "Serial Number": "FGHGHHu888", "MAC Address": null, "Quantity": 1, "New HW": "No", "Local Device": "No", "Future State Monthly Mono Usage": 1000, "Future State Monthly Color Usage": 1000, "Location Name": "loc1", "ZIP / Post Code": "AB10 1AF", "City Name": "loc1"}];
                    dirname = "ExcelAPI";
                    filename = "devices.xls";
                    sheetname = "Plan1";

                    window.xls.save(data, dirname, filename, sheetname,
                            function () {
                                console.log('success');
                            },
                            function (err) {
                                console.log(JSON.stringify(err) + dirname);
                            }
                    );
                }
                $rootScope.$on('loading:show', function () {
                    $rootScope.loading = $ionicLoading.show({
                        content: '<i class="icon ion-refreshing"></i>',
                        template: 'We are retrieving your information. Please wait.',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 50,
                        showDelay: 0
                    });
                });

                $rootScope.$on('loading:hide', function () {
                    $ionicLoading.hide();
                });

            });

            $rootScope.$on('$stateChangeStart',
                    function (event, toState, toParams, fromState, fromParams) {
                        if ((toParams.logout === "true")) {
                            localStorage.removeItem('access_token');
                            event.preventDefault();
                            $window.location.reload();
                        }
                        if (localStorage.getItem('access_token') == null && toState.name != "app.login") {
                            event.preventDefault();
                            return $state.go('app.login');
                        }
                        if (localStorage.getItem('access_token') != null && toState.name === "app.login") {
                            event.preventDefault();
                            return $state.go('app.profile');
                        }
                    });
            $rootScope.showInvalidAlert = function () {
                $rootScope.$broadcast('loading:hide');
                var pp = $ionicPopup.alert({
                    title: 'Invalid request!',
                    template: 'It might be your session got expired or tried accessing an un-authorized resources; Please login to the application again.'
                });
                pp.then(function (res) {
                    localStorage.removeItem('access_token');
                    window.location.href = "#/app/login/";
                });
            }
        })
        .constant('cfg', {
            appName: 'EDP Assessment',
            appVersion: 1.0,
            appDebug: false,
            apiUrl: 'https://g4w5573g.houston.om.com/api/v1/'
            //test.iedp.api.om.com
            //omcorp-mps-dev.apigee.net
            //g573g.houston.om.com
        })
        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $provide) {

            // Turn off caching for demo simplicity's sake
            // $ionicConfigProvider.views.maxCache(0);

            /*
             // Turn off back button text
             $ionicConfigProvider.backButton.previousTitleText(false);
             */

            $httpProvider.interceptors.push(function ($q, $rootScope, $log, $cacheFactory) {
                var loadingCount = 0;
                return {
                    request: function (config) {
                        config.timeout = 120000; // 2min (2 min * 60 sec * 1000 millis)
                        if (localStorage.getItem('access_token') != null)
                            config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('access_token');
                        //clear cache after post
                        if (config.method === 'POST' || config.method === 'PUT')
                            $cacheFactory.get('$http').removeAll();

                        if (++loadingCount === 1)
                            $rootScope.$broadcast('loading:show');
                        //if (config.url.indexOf('http') >= 0)
                        //$log.debug(JSON.stringify(config));
                        return config || $q.when(config);
                    },
                    response: function (response) {
                        if (--loadingCount === 0)
                            $rootScope.$broadcast('loading:hide')
                        if (response.config.url.indexOf('http') >= 0)
                            $log.debug(JSON.stringify(response.config) +
                                    JSON.stringify(response.status) +
                                    JSON.stringify(response.statusText));
                        return response || $q.when(response);
                    },
                    responseError: function (rejection) {
                        if (--loadingCount === 0)
                            $rootScope.$broadcast('loading:hide');
                        if (rejection.status === 401 || rejection.status === 0) {
                            // Un-authorized access
                            //$state.go('logout');
                            $rootScope.showInvalidAlert();
                        }
                        if (rejection.status === 404){
                         alert(rejection.data.Message);                            
                        }
                        return $q.reject(rejection);
                    }
                }
            });
            $provide.decorator('$log', ['$delegate', function ($delegate) {
                    // Keep track of the original debug method, we'll need it later.
                    var origDebug = $delegate.debug;
                    /*
                     * Intercept the call to $log.debug() so we can add on 
                     * our enhancement. We're going to add on a date and 
                     * time stamp to the message that will be logged.
                     */
                    $delegate.debug = function () {
                        var args = [].slice.call(arguments);
                        args[0] = [new Date().toString(), ': ', args[0]].join('');

                        // Send on our enhanced message to the original debug method.
                        //window.debugStore.push(args);
                        origDebug.apply(null, args)
                    };

                    return $delegate;
                }]);
            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            $stateProvider.state('app', {
                url: '/app',
                abstract: true,
                cache: false,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

                    .state('app.activity', {
                        url: '/activity',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/activity.html',
                                controller: 'ActivityCtrl'
                            },
                            'fabContent': {
                                template: '<button id="fab-activity" class="button button-fab button-fab-top-right expanded button-energized-900 flap"><i class="icon ion-clipboard"></i></button>',
                                controller: function ($timeout) {
                                    $timeout(function () {
                                        document.getElementById('fab-activity').classList.toggle('on');
                                    }, 200);
                                }
                            }
                        }
                    })
                    .state('app.deal', {
                        url: '/deal',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/deal.html',
                                controller: 'DealCtrl'
                            },
                            'fabContent': {
                                template: '<a id="fab-activity" class="button button-fab button-fab-top-right expanded button-energized-900 flap" ng-click="openPopover($event)"><i class="icon ion-clipboard"></i></a>',
                                controller: function ($timeout, $ionicPopover, $scope,$rootScope) {
                                    var templateUrl = 'templates/dealpopup.html';
                                    $scope.items = [];
                                    for (var i = 0; i < 10; i++)
                                        $scope.items.push('dev ' + i);

                                    $scope.getBmName = function (bmid){
                                        var dd = $.grep($rootScope.quoteDef.BillingModels, function (elm) {
                                            return (elm.BillingModelId == bmid);
                                        });    
                                        return dd[0] ? dd[0].Name : '' ;
                                    }
                                    $scope.getProgType = function (salesmodeid){
                                        var dd = $.grep($rootScope.quoteDef.PartnerProgramSalesModes, function (elm) {
                                            return (elm.ProgramSalesModeId == salesmodeid);
                                        });    
                                        return dd[0] ? dd[0].ProgramSalesMode : '' ;                                        
                                    }
                                    $scope.getPriceStrgy = function (psid){
                                        var dd = $.grep($rootScope.quoteDef.PricingModels, function (elm) {
                                            return (elm.PricingModelId == psid);
                                        });    
                                        return dd[0] ? dd[0].Name : '' ;                                        
                                    }
                                    $scope.toggleFleetSection = function ($event) {
                                        $scope.fleetlistshow = !$scope.fleetlistshow;
                                    }
                                    $ionicPopover.fromTemplateUrl(templateUrl, {
                                        scope: $scope
                                    }).then(function (popover) {
                                        $scope.popover = popover;
                                    });
                                    $scope.closePopover = function () {
                                        $scope.popover.hide();
                                    };
                                    $scope.openPopover = function ($event) {
                                        if(this.customerName)
                                            $scope.popover.show($event);
                                    };
                                    //Cleanup the popover when we're done with it!
                                    $scope.$on('$destroy', function () {
                                        $scope.popover.remove();
                                    });
                                    $timeout(function () {
                                        document.getElementById('fab-activity').classList.toggle('on');
                                    }, 200);
                                }
                            }
                        }
                    })
                    .state('app.friends', {
                        url: '/friends/:all',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/friends.html',
                                controller: 'FriendsCtrl'
                            },
                            'fabContent': {
                                template: '<a id="fab-myfriends" class="button button-fab button-fab-top-left expanded button-energized-900 spin" ng-click="createCust()"><i class="icon ion-android-person-add"></i></a>',
                                controller: function ($scope,$timeout,$state) {
                                    $scope.createCust = function (){
                                        return $state.go('app.custprofile',{custobj: -1});
                                    }
                                    $timeout(function () {
                                        document.getElementById('fab-myfriends').classList.toggle('on');
                                    }, 900);
                                }
                            }
                        }
                    })

                    .state('app.gallery', {
                        url: '/gallery',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/gallery.html',
                                controller: 'GalleryCtrl'
                            },
                            'fabContent': {
                                template: '<button id="fab-gallery" class="button button-fab button-fab-top-right expanded button-energized-900 drop"><i class="icon ion-ios-chatboxes-outline"></i></button>',
                                controller: function ($timeout) {
                                    $timeout(function () {
                                        document.getElementById('fab-gallery').classList.toggle('on');
                                    }, 600);
                                }
                            }
                        }
                    })

                    .state('app.categories', {
                        url: '/categories',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/categories.html',
                                controller: 'CategoriesCtrl'
                            },
                            'fabContent': {
                                template: '<button id="fab-gallery" class="button button-fab button-fab-top-right expanded button-energized-900 drop" ng-click="popover.show($event)"><i class="icon ion-ios-chatboxes-outline" ><span class="badgeCnt">2</span> </i></button>',
                                controller: function ($timeout, $ionicPopover, $scope) {
                                    // .fromTemplate() method
                                    var template = '<ion-popover-view style="width:400px!important;height:410px">' +
                                            '   <ion-header-bar class="bar-positive">' +
                                            '       <h1 class="title">My alerts & messages</h1>' +
                                            '   </ion-header-bar>' +
                                            '   <ion-content class="padding">' +
                                            '<ion-list><ion-item class="item-text-wrap"> <p>om pricing and master data has changed. You need to sync your Device with new values. Please, click the Sync button.</p> <button class="button button-assertive ink"> <i class="icon ion-android-sync"></i> </button> </ion-item><ion-item class="item-text-wrap"> <p>Please note that due to the upgrade parts of the EDP will be inaccessible from Saturday, 14 December, 6:30 a.m. EDT (1030 UTC-04) to Saturday, 14 December 7:30 p.m. EDT (1130 UTC-04.). If you still face issue post-updates, please contact om Support</p> <button class="button button-balanced ink"> <i class="icon ion-ios-telephone"></i> </button></ion-item> </ion-list>' +
                                            '   </ion-content>' +
                                            '</ion-popover-view>';


                                    $scope.popover = $ionicPopover.fromTemplate(template, {
                                        scope: $scope
                                    });
                                    closePopover = function () {
                                        $scope.popover.hide();
                                    };
                                    //Cleanup the popover when we're done with it!
                                    $scope.$on('$destroy', function () {
                                        $scope.popover.remove();
                                    });
                                    $timeout(function () {
                                        document.getElementById('fab-gallery').classList.toggle('on');
                                    }, 600);
                                }
                            }
                        }
                    })
                    .state('app.login', {
                        url: '/login/:logout',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/login.html',
                                controller: 'LoginCtrl'
                            },
                            'fabContent': {
                                template: ''
                            }
                        }
                    })

                    .state('app.profile', {
                        url: '/profile',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/profile.html',
                                controller: 'ProfileCtrl'
                            },
                            'fabContent': {
                                template: '<button id="fab-profile" class="button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-ios-alarm "></i></button>',
                                controller: function ($timeout) {
                                    $timeout(function () {
                                     document.getElementById('fab-profile').classList.toggle('on');
                                     }, 800);
                                }
                            }
                        }
                    })
                .state('app.custprofile', {
                        url: '/custprofile/:custobj',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/customer.html',
                                controller: 'CustDetailsCtrl'
                            },
                            'fabContent': {
                                template: '<a id="fab-custprofile" class="button button-fab button-fab-bottom-right button-energized-900" ng-click="enableEdit()"><i ng-class="editCustCls"></i></a>',
                                controller: function ($timeout,$rootScope) {
                                    $rootScope.editCustCls = 'icon ion-ios-compose';
                                    $rootScope.enableEdit = function (){
                                        if($rootScope.editCustFlag){
                                           $rootScope.editCustFlag = false;
                                           $rootScope.editCustCls = 'icon ion-ios-compose'; 
                                        }
                                       else{
                                        $rootScope.editCustFlag = true;
                                           $rootScope.editCustCls = 'icon ion-ios-glasses';                                       }
                                        }
                                   $timeout(function () {
                                     document.getElementById('fab-custprofile').classList.toggle('on');
                                     }, 800); 
                                }
                            }
                        }
                    })
                .state('app.location', {
                        url: '/location/:custid/:compname',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/locations.html',
                                controller: 'LocationDetailsCtrl'
                            },
                            'fabContent': {
                                template: '<a id="fab-custprofile" class="button button-fab button-fab-bottom-right button-energized-900" ng-click="enableLocEdit()"><i ng-class="locCls"></i></a>',
                                controller: function ($timeout, $rootScope) {
                                    $rootScope.locCls = 'icon ion-plus';
                                    $rootScope.enableLocEdit = function (locObj) {
                                        if ($rootScope.createLoc) {
                                            $rootScope.createLoc = false;
                                            $rootScope.locCls = 'icon ion-plus';
                                        } else {
                                            $rootScope.createLoc = true;
                                            $rootScope.locCls = 'icon ion-android-list';
                                        }
                                        // set the values for edit a location
                                        if(locObj){
                                           $rootScope.LocationName =  locObj.LocationName;  
                                           $rootScope.PhysicalAddress = angular.copy(locObj.BillingAddress);
                                           $rootScope.PhysicalAddress.AddressType = "PhysicalAddress";
                                           $rootScope.buttonText = 'Update';
                                       }else{
                                           $rootScope.buttonText = 'Add';
                                           delete $rootScope.LocationName;
                                           delete $rootScope.PhysicalAddress;
                                       }
                                    }
                                    $timeout(function () {
                                        document.getElementById('fab-custprofile').classList.toggle('on');
                                    }, 800);
                                }
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/login/logout');
        }).directive("repeatEnd", function(){
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    if (scope.$last) {
                        scope.$eval(attrs.repeatEnd);
                    }
                }
            };
        });
//        .factory('$exceptionHandler', function () {
//            return function (exception, cause) {
//                exception.message += ' (EDP exception caused by "' + cause + '")';
//                window.debugStore.push([exception.message]);
//                throw exception;
//            }
//        })

//window.debugStore = window.debugStore || [];