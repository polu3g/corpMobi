/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['login.controllers','deal.controllers','profile.controllers','customerModule'])

        .controller('AppCtrl', function ($scope,$state,$rootScope, $ionicModal, $ionicPopover, $timeout,$ionicSideMenuDelegate,$ionicHistory) {
            // Form data for the login modal
            $scope.loginData = {};
            $scope.isExpanded = false;
            $scope.hasHeaderFabLeft = false;
            $scope.hasHeaderFabRight = false;
            $scope.username = '';
            $scope.password = '';
            // re bootstrap
            if(localStorage.getItem('customers') != "undefined"){
                $rootScope.customers = JSON.parse(localStorage.getItem('customers'));
                $rootScope.allcustomers = JSON.parse(localStorage.getItem('allcustomers'));
            }
            $scope.createNewCust = false;            
            
            $ionicSideMenuDelegate.canDragContent(true) ;                
            $scope.$on('$ionicView.enter', function()
            {
                    $scope.active = true;
            });

            $scope.goBack = function()
            {
                    if ($scope.active)
                    {
                            $scope.active = false;
                            $ionicHistory.goBack();
                    }
            };            
            var navIcons = document.getElementsByClassName('ion-navicon');
            for (var i = 0; i < navIcons.length; i++) {
                navIcons.addEventListener('click', function () {
                    this.classList.toggle('active');
                });
            }
            ////////////////////////////////////////
            // Layout Methods
            ////////////////////////////////////////

            $scope.hideNavBar = function () {
                document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
            };

            $scope.showNavBar = function () {
                document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
            };

            $scope.noHeader = function () {
                var content = document.getElementsByTagName('ion-content');
                for (var i = 0; i < content.length; i++) {
                    if (content[i].classList.contains('has-header')) {
                        content[i].classList.toggle('has-header');
                    }
                }
            };

            $scope.setExpanded = function (bool) {
                $scope.isExpanded = bool;
            };

            $scope.setHeaderFab = function (location) {
                var hasHeaderFabLeft = false;
                var hasHeaderFabRight = false;

                switch (location) {
                    case 'left':
                        hasHeaderFabLeft = true;
                        break;
                    case 'right':
                        hasHeaderFabRight = true;
                        break;
                }

                $scope.hasHeaderFabLeft = hasHeaderFabLeft;
                $scope.hasHeaderFabRight = hasHeaderFabRight;
            };

            $scope.hasHeader = function () {
                var content = document.getElementsByTagName('ion-content');
                for (var i = 0; i < content.length; i++) {
                    if (!content[i].classList.contains('has-header')) {
                        content[i].classList.toggle('has-header');
                    }
                }

            };

            $scope.hideHeader = function () {
                $scope.hideNavBar();
                $scope.noHeader();
            };

            $scope.showHeader = function () {
                $scope.showNavBar();
                $scope.hasHeader();
            };

            $scope.clearFabs = function () {
                var fabs = document.getElementsByClassName('button-fab');
                if (fabs.length && fabs.length > 1) {
                    fabs[0].remove();
                }
            };
        })
        .controller('CustDetailsCtrl', function ($scope,$rootScope, $stateParams, 
        $timeout, ionicMaterialMotion, ionicMaterialInk,Customer,$ionicPopup) {
            // Set Header
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.isExpanded = false;
            $scope.$parent.setExpanded(false);
            $scope.$parent.setHeaderFab(false);
            $rootScope.editCustFlag = false;
            $rootScope.editCustCls = 'icon ion-ios-compose';
            
            // Set Motion
            $scope.custDetail = $rootScope.customers[$stateParams.custobj];
            if(!$scope.custDetail)
            $scope.custDetail = $rootScope.allcustomers[$stateParams.custobj];
            if($stateParams.custobj == -1){
             // create new
                $scope.editCustFlag = true;
                $scope.custDetail = {};
                $scope.custDetail.CustomerId = -1;
                $scope.custDetail.BillingAddress = {};
                $scope.custDetail.BillingAddress.CountryName = localStorage.getItem('CurrentCompanyCountryName');
            }
            
            $scope.saveCustomer = function (custObj){
                custObj.custDetail.PhysicalAddress = angular.copy(custObj.custDetail.BillingAddress);
                custObj.custDetail.PhysicalAddress.AddressType = 'PhysicalAddress';
                delete custObj.custDetail.PhysicalAddress.AddressId;
                Customer.save(custObj.custDetail).then(function (payload){
                    //refresh data
                    return  Customer.listAll({});                    
                },function (errResponse){
                    var strg = '';
                    if (errResponse.data.ModelState) {
                        $.each(Object.keys(errResponse.data.ModelState), function (idx, ms) {
                            strg += ms + ' : ' + errResponse.data.ModelState[ms][0] + ' <br/>';
                        });
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: errResponse.data.Message + '<br/>' + strg
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: errResponse.data.Message + '<br/>' + strg
                        });
                    }
                }).then(function (payload) {
                    $rootScope.customers = payload;
                    localStorage.setItem('customers', JSON.stringify(payload));
                    $ionicPopup.alert({
                            title: 'Data got saved!'
                        });                    
                }, function (error) {
                    $ionicPopup.alert({
                            title: 'Error!',
                            template: error.data.Message + '<br/>' + strg
                        });
                });
            }
            
            $timeout(function () {
                ionicMaterialMotion.slideUp({
                    selector: '.slide-up'
                });
            }, 300);

            $timeout(function () {
                ionicMaterialMotion.fadeSlideInRight({
                    startVelocity: 3000
                });
            }, 700);

            // Set Ink
            ionicMaterialInk.displayEffect();
            
            // get the customers list
            
            // get quote meta data & device makes
            
        })        
        .controller('LocationDetailsCtrl', function ($state,$scope,$rootScope,$log, $stateParams, 
            $timeout, ionicMaterialMotion, ionicMaterialInk,Customer,$window,$ionicPopup) {
            // Set Header
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.isExpanded = false;
            $scope.$parent.setExpanded(false);
            $scope.$parent.setHeaderFab(false);
            $rootScope.createLoc = false;
            $rootScope.locCls = 'icon ion-plus';
            
            $scope.custid = $stateParams.custid;
            $scope.custName = $stateParams.compname;
            $scope.country = localStorage.getItem('CurrentCompanyCountryName');
            
            Customer.listAllLocations($scope.custid).then(function (locs) {
                            $scope.locations = locs;
                            }, function (error) {
                                $log.debug(error);
                    }); 
            $scope.saveLocation = function (locObj){
                Customer.saveLocation(locObj).then(function (payload){
                    $window.location.reload();
                },function (errResponse){
                    var strg = '';
                    if (errResponse.data.ModelState) {
                        $.each(Object.keys(errResponse.data.ModelState), function (idx, ms) {
                            strg += ms + ' : ' + errResponse.data.ModelState[ms][0] + ' <br/>';
                        });
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: errResponse.data.Message + '<br/>' + strg
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Error!',
                            template: errResponse.data.Message + '<br/>' + strg
                        });
                    }
                });
            }
            
            $scope.onEnd = function (){
                // Delay expansion
                $timeout(function () {
                    $scope.isExpanded = true;
                    $scope.$parent.setExpanded(true);
                }, 300);

                // Set Motion
                ionicMaterialMotion.fadeSlideInRight();

                // Set Ink
                ionicMaterialInk.displayEffect();

                };
        })        
        .controller('FriendsCtrl', function ($scope, $rootScope,$stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
            // Set Header
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.$parent.setHeaderFab('left');
            if($stateParams.all === "true")
                $scope.customers = $rootScope.allcustomers;
            else
                $scope.customers = $rootScope.customers;
            
            $scope.onEnd = function (){
                // Delay expansion
                $timeout(function () {
                    $scope.isExpanded = true;
                    $scope.$parent.setExpanded(true);
                }, 300);

                // Set Motion
                ionicMaterialMotion.fadeSlideInRight();

                // Set Ink
                ionicMaterialInk.displayEffect();

                };
        })
        .controller('ActivityCtrl', function ($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
            $scope.$parent.setHeaderFab('right');

            $timeout(function () {
                ionicMaterialMotion.fadeSlideIn({
                    selector: '.animate-fade-slide-in .item'
                });
            }, 200);

            // Activate ink for controller
            ionicMaterialInk.displayEffect();
        })

        .controller('GalleryCtrl', function ($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
            $scope.$parent.setHeaderFab(false);

            // Activate ink for controller
            ionicMaterialInk.displayEffect();

            ionicMaterialMotion.pushDown({
                selector: '.push-down'
            });
            ionicMaterialMotion.fadeSlideInRight({
                selector: '.animate-fade-slide-in .item'
            });

        })

        .controller('CategoriesCtrl', function ($scope, $stateParams, $ionicPopover, $timeout, ionicMaterialInk, ionicMaterialMotion) {
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
            $scope.$parent.setHeaderFab(false);

            // Activate ink for controller
            ionicMaterialInk.displayEffect();

            ionicMaterialMotion.pushDown({
                selector: '.push-down'
            });
            ionicMaterialMotion.fadeSlideInRight({
                selector: '.animate-fade-slide-in .item'
            });

        }) ;
