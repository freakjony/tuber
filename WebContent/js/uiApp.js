    var app = angular.module("ngMap", []);
    app.controller(
        "tuberApp", [
            '$scope', '$http', '$timeout',
            function($scope, $http, $timeout) {
                $scope.user = { "name": "ShummyLyn", "admin": true };
                $scope.newContainer = { "containerId": null, "percentageFull": 0, "lng": null, "lat": null, "address": null };

                $scope.addContainer = function(jsonContainer) {
                    $scope.addressError = null;
                    console.log("Inside addContainer angular function");
                    console.log(jsonContainer);
                    $http({
                        method: 'POST',
                        url: '/api/container',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: jsonContainer
                    }).then(
                        function(response) {
                            console.log(response.data);
                            noty({
                                text: "Nuevo contenedor almacenado satisfactoriamente. ",
                                type: 'success',
                                timeout: 5000
                            });
                            //   $scope.$apply();
                            $scope.newContainer = response.data;
                            $('#insertContainer').modal('hide');
                        },
                        function(response) {
                            $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                        });
                };


                $scope.callFnOnInterval = function(fn, timeInterval) {
                    var timeIntervalInSec = 1;

                    var promise = $timeout(fn, timeInterval);

                    return promise.then(function() {
                        $scope.callFnOnInterval(fn, timeInterval);
                    });
                    //return $interval(fn, 1000 * timeInterval); 
                };

                $scope.getContainers = function() {
                    $http({
                        method: 'GET',
                        url: '/api/container',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    }).then(
                        function(response) {
                            $scope.containers = response.data;
                        },
                        function(response) {
                            $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                        });
                };

                $scope.callFnOnInterval($scope.getContainers, 50000);

                $scope.prepareToDelete = function(container) {
                    $scope.deleteContainer = container;
                };

                $scope.delete = function() {
                    console.log("Inside delete angular function");
                    console.log($scope.deleteContainer);
                    $http({
                        method: 'DELETE',
                        url: '/api/delete',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: $scope.deleteContainer
                    }).then(
                        function(response) {
                            console.log(response.data);
                            noty({
                                text: "Contenedor eliminado satisfactoriamente. ",
                                type: 'success',
                                timeout: 5000
                            });
                            //  $scope.$apply();
                            $('#viewContainers').modal('hide');
                            $('#editContainer').modal('hide');
                        },
                        function(response) {
                            $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                        });
                };

                $scope.login = function() {
                    if ($scope.user.username && $scope.user.password) {
                        $http({
                            method: 'post',
                            url: '/api/login',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: $scope.user
                        }).then(
                            function(response) {
                                console.log('te logueaste exitosamente ',response);
                                $scope.badLogin = {};
                                $scope.user = response.data;
                                $('#login').modal('hide');
                                noty({
                                text: "Te logueaste exitosamente " + $scope.user.username,
                                type: 'success',
                                timeout: 5000
                                });
                            },
                            function(response) {
                                console.log('la cagaste en el inicio de session',response);
                                $scope.badLogin = response.data;
                            });
                    }
                };
                $scope.signup = function() {
                    if ($scope.newuser.username && $scope.newuser.password) {
                        $http({
                            method: 'post',
                            url: '/api/user',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: $scope.newuser
                        }).then(
                            function(response) {
                                $scope.newuser = response.data.user;
                                $scope.duplicatedUser = {};
                                $('#signup').modal('hide');
                                noty({
                                text: "Te registraste exitosamente " + $scope.newuser.username,
                                type: 'success',
                                timeout: 5000
                                });
                            },
                            function(response) {
                                $scope.duplicatedUser = response.data;
                            });
                    }
                };
            }
        ]);
