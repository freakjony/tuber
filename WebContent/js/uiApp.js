//(function(angular) {
    var app = angular.module("ngMap", []);
    app.controller(
        "tuberApp", [
            '$scope',
            '$http',
            function($scope, $http) {

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
                                text: "Felicidades has agregado un nuevo contenedor. ",
                                type: 'success',
                                timeout: 4000
                            });
                            $scope.newContainer = response.data;
                            $('#insertContainer').modal('hide');

                        },
                        function(response) {
                            $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                        });
                };

                $scope.getContainers = function(){
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
                    
                $scope.getContainers();
            }
        ]);
//});
