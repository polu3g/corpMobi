'use strict';

angular.module('deal.controllers', ['customerModule'])
.controller('DealCtrl', function ($rootScope,$scope,$state, $stateParams, $ionicModal,$ionicPopover, $timeout, 
            ionicMaterialInk, ionicMaterialMotion, $q, $log, $ionicSlideBoxDelegate,Customer,$ionicPopup) {
            $scope.$parent.showHeader();
            $scope.$parent.clearFabs();
            $scope.isExpanded = true;
            $scope.$parent.setExpanded(true);
            $scope.$parent.setHeaderFab(false);
            $rootScope.deal = {};
            
            // Activate ink for controller
            ionicMaterialInk.displayEffect();

            ionicMaterialMotion.pushDown({
                selector: '.push-down'
            });
            ionicMaterialMotion.fadeSlideInRight({
                selector: '.animate-fade-slide-in'
            });
            // wizards
            $scope.options = {
                loop: false,
                effect: 'fadeInLeft 2s',
                speed: 400,
                slidesPerView: '1',
                paginationClickable: false,
                showNavButtons: false,
            }

            $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
                // data.slider is the instance of Swiper
                $scope.slider = data.slider;
                $scope.slider.lockSwipes();
            });

           $scope.$on("$ionicSlides.slideChangeStart", function (event, data) {
                if(data.slider.activeIndex == 1){
                   //data.slider.lockSwipeToNext();
                }
            });

            $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
                // note: the indexes are 0-based
                $scope.activeIndex = data.activeIndex;
                $scope.previousIndex = data.previousIndex;
            });

            $ionicModal.fromTemplateUrl('templates/devicepopup.html', {
                scope: $scope,
                animation: 'slide-in-up'
              }).then(function(modal) {
                $scope.modal = modal;
              });
              $scope.openModal = function() {
                $scope.modal.show();
              };
              $scope.closeModal = function() {
                $scope.modal.hide();
              };
              // Cleanup the modal when we're done with it!
              $scope.$on('$destroy', function() {
                $scope.modal.remove();
              });
              // Execute action on hide modal
              $scope.$on('modal.hidden', function() {
                // Execute action
              });
              // Execute action on remove modal
              $scope.$on('modal.removed', function() {
                // Execute action
              });
              
            $scope.toggleIpSection = function(event) {
                event.stopImmediatePropagation();                
                $scope.iplistshow = !$scope.iplistshow;
            };         
            $scope.exceptions = [];
            $scope.exceptions.push({'name':'End of Service Life Devices','desc':'Additional discount off list price per HW SKU'});  
            $scope.exceptions.push({'name':'Partner Commission','desc':'By checking this you agree to allow HP to securely view Pricing information to review this exception'});  
            $scope.exceptions.push({'name':'Credit Check','desc':'By checking this you agree to allow HP to securely view Credit check information to review this exception'});  
            $scope.exceptions.push({'name':'Extend Proposal/Contract Validity','desc':''});  
            $scope.exceptions.push({'name':'HP Solutions','desc':''});  
            //$scope.exceptions.push({'name':'','desc':''});  

            // .fromTemplate() method
             var template = '<ion-popover-view><ion-header-bar class="bar-assertive"> <span class="padding">Business justification</span> </ion-header-bar> <ion-content> \n\
                      Write a note to DSC<label class="item-input padding"><textarea rows="10" cols="20" ng-model="exceptionNotes"> </textarea>\n\
                      </label><i class="ion-checkmark-round padding" ng-click="closeExcepPopover()"></i></ion-content></ion-popover-view>';

             $scope.popoverExcp = $ionicPopover.fromTemplate(template, {
               scope: $scope
             });            
            $scope.openExcepPopover = function($event) {
               $scope.popoverExcp.show($event);
             };
             $scope.closeExcepPopover = function() {
               $scope.popoverExcp.hide();
             };
             //Cleanup the popover when we're done with it!
             $scope.$on('$destroy', function() {
               $scope.popoverExcp.remove();
             });

            $scope.userState = '';
            $scope.progtypes = ('pmps_Classic pmps_Inside').split(' ').map(function (state) {
                return {abbrev: state};
            });

            var self = $scope;
            self.simulateQuery = false;
            self.isDisabled = false;
            // list of `state` value/display objects
            //self.customers = loadAll();

            self.titleCust = 'Choose';
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange = searchTextChange;
            self._selectedItemChange = false;
            self.newState = newState;
            self.country = localStorage.getItem('CurrentCompanyCountryName');
            self.clearCreateCust = function () {
                self.createNewCust = false;
                delete self.CompanyName;
                delete self.searchText;
                self.titleCust = 'Choose';
            }
            self.saveCustomer = function (cust) {
               Customer.save(cust).then(function (payload){
                   // get cust id from payload to create location
                   
//                    $rootScope.locationDetails = locs[0].LocationName
//                            + ', ' + locs[0].PhysicalAddress.City + ', ' + locs[0].PhysicalAddress.State;
//                    $rootScope.customerName = item.display;
//                    $scope.slider.slideNext();
               }
               ,function (errResponse){
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
               }
               );
            }
            
            function newState(state) {
                //alert(state);
                self.createNewCust = true;
                self.CompanyName = state;
                self.titleCust = 'Create';
            }
            // ******************************
            // Internal methods
            // ******************************
            /**
             * Search for customers... use $timeout to simulate
             * remote dataservice call.
             */
            function querySearch(query) {
                var results = query ? self.customers.filter(createFilterFor(query)) : self.customers,
                        deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            self.nextpage = function () {
                $scope.slider.slideNext();
            }
            self.prevpage = function () {
                $scope.slider.slidePrev();
            }


            function searchTextChange(text) {
                $log.info('Text changed to ' + text);
            }
            function selectedItemChange(item) {
                $log.info('Item changed to ' + JSON.stringify(item));
                if (typeof item != "undefined") {
                    self._selectedItemChange = true;
                    self.selectedItem = item;
                    Customer.listAllLocations(item.CustomerId).then(function (locs) {
                            if(locs.length > 0){
                        // defaulted zero-th location of the Customer 
                            localStorage.setItem('dealLocation',JSON.stringify(locs[0]));
                            $rootScope.locationDetails = locs[0].LocationName
                            + ', ' + locs[0].PhysicalAddress.City+ ', ' + locs[0].PhysicalAddress.State;
                            $rootScope.customerName = item.display;
                            $scope.slider.unlockSwipes();
                            $scope.slider.slideNext();
                            $scope.slider.lockSwipeToNext();
                        }else{
                            $state.go('app.location',{custid:item.CustomerId,compname:item.CompanyName});
                        }
                            
                            }, function (error) {
                                $log.debug(error);
                    });                    
                } else {
                    self._selectedItemChange = false;
                    delete self.selectedItem;
                    delete $rootScope.customerName;
                }
            }
            /**
             * Build `customers` list of key/value pairs
             */
            function loadAll() {
                var allStates = 'BlueCross Association, Cloud Software, Data Foundry';
                return allStates.split(/, +/g).map(function (customer) {
                    return {
                        value: customer.toLowerCase(),
                        display: customer
                    };
                });
            }
            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(state) {
                    return (state.display.indexOf(lowercaseQuery) >= 0);
                };
            }


        });