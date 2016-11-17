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

                $scope.callFnOnInterval($scope.getContainers, 5000);

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
                }
            }
        ]);
