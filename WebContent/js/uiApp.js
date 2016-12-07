var app = angular.module("ngMap", ["ng-fusioncharts", "ngStorage"]);
app.config(['$httpProvider', function($httpProvider) {

    $httpProvider.interceptors.push(['$q', '$localStorage', function($q, $localStorage) {
        return {
            'request': function(config) {
                config.headers = config.headers || {};
                if ($localStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $localStorage.token;
                }
                return config;
            },
            'responseError': function(response) {
                if (response.status === 401 || response.status === 403) {

                }
                return $q.reject(response);
            }
        };
    }]);

}]);
app.controller(
    "tuberApp", [
        '$scope', '$http', '$timeout', '$localStorage', 'Services', '$filter',
        function($scope, $http, $timeout, $localStorage, Services, $filter) {
            $scope.newContainer = { "containerId": null, "percentageFull": 0, "lng": null, "lat": null, "address": null };
            $scope.fromDate = '';
            $scope.toDate = '';
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

            $scope.getContainers();
            $scope.callFnOnInterval($scope.getContainers, 20000);

            $scope.prepareToDelete = function(container) {
                $scope.deleteContainer = container;
            };

            // Changing 'Delete' function to set the container's status to 0
            $scope.delete = function() {
                $http({
                    method: 'PUT',
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
                        $('#viewContainers').modal('hide');
                        $('#editContainer').modal('hide');
                    },
                    function(response) {
                        $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                    });
            };

            $scope.clearPercentage = function() {

                noty({
                    text: 'Se vaciarán los contenedores llenos, confirme para continuar',
                    theme: 'defaultTheme',
                    layout: 'center',
                    type: 'confirm',
                    buttons: [{
                        addClass: 'button',
                        text: 'Continuar',
                        onClick: function($noty) {
                            $noty.close();

                            var llenado = document.getElementById('llenado-minimo').value;
                            var json = { "llenado": llenado };
                            $http({
                                method: 'PUT',
                                url: '/api/clear',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: json
                            }).then(
                                function(response) {
                                    console.log(response.data);
                                    noty({
                                        text: "Los contenedores con porcentaje llenado mayor a " + llenado + " fueron vaciados correctamente.",
                                        type: 'success',
                                        timeout: 5000
                                    });
                                },
                                function(response) {
                                    $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                                });

                        }
                    }, {
                        addClass: 'button',
                        text: 'Cancel',
                        onClick: function($noty) {
                            $noty.close();
                        }
                    }]
                });
            };

            $scope.login = function(username, password) {
                if (username && password) {
                    var user = { "username": username, "password": password };
                    Services.login(user,
                        function(response) {
                            console.log('Logueado exitosamente ', response);
                            if (response.type) {
                                $localStorage.token = response.data.token;
                                $localStorage.admin = response.data.admin;
                                $scope.user = response.data;
                                $scope.token = response.data.token;
                                $scope.admin = response.data.admin;
                                $('#login').modal('hide');
                                $('#logueo').modal('hide');
                                noty({
                                    text: "Logueado exitosamente " + $scope.user.username,
                                    type: 'success',
                                    timeout: 5000
                                });
                            } else {
                                $scope.badLogin = response.data;
                            }
                        },
                        function(response) {
                            console.log('Error intentando iniciar sesión', response);
                            $scope.badLogin = response.data;
                        });
                }
            };

            // SIGN UP METHOD
            $scope.signup = function() {
                if ($scope.newuser.username && $scope.newuser.password && $scope.newuser.firstName && $scope.newuser.lastName) {
                    Services.signup($scope.newuser,
                        function(response) {
                            if (response.type) {
                                $scope.newuser = response.data;
                                $scope.duplicatedUser = {};
                                $('#signup').modal('hide');
                                $('#logueo').modal('hide');
                                noty({
                                    text: "Te registraste exitosamente " + $scope.newuser.username,
                                    type: 'success',
                                    timeout: 5000
                                });
                            }
                        },
                        function(response) {
                            $scope.duplicatedUser = response.data;
                        });
                }
            };

            $scope.estadisticaDefault = function() {
                $scope.fromDate = $filter('date')(Date.now() + -7*24*3600*1000, 'MM/dd/yyyy');
                $scope.toDate = $filter('date')(Date.now(), 'MM/dd/yyyy');
                $scope.estadistica($scope.fromDate, $scope.toDate);
                //$scope.estadistica('05/12/2016', '08/12/2016');
            }

            $scope.estadistica = function(fromDate, toDate) {
                $scope.dataSource = {};
                $scope.history = [];
                var toDate2 = $filter('date')(new Date(toDate).getTime() + 24*3600*1000, 'MM/dd/yyyy');
                var dates = { "fromDate": fromDate, "toDate": toDate2 };
                Services.history(dates, function(response) {
                    $scope.history = response;
                    var log = [];
                    angular.forEach($scope.history, function(value, index) {
                        var myObj = {
                            label: value._id,
                            value: "" + value.count + ""
                        };
                        this.push(myObj);
                    }, log);
                    // chart data source
                    $scope.dataSource = {
                        chart: {
                            caption: "Estadísticas de los contenedores",
                            captionFontSize: "24",
                        },
                        data: log
                    }
                }, function() {
                    noty({
                        text: "Error obteniendo las estadisticas.",
                        type: 'error',
                        timeout: 5000
                    });
                });
            }
            $scope.estadisticaDefault();

            // USUARIOS // 
            $scope.getUserByUsername = function(username) {
                Services.getByName(username,
                    function(response) {
                        $scope.UpdateUserAdmin = response.admin;
                        $scope.UpdateUserEmail = response.email;
                        $scope.UpdateUserLastName = response.lastName;
                        $scope.UpdateUserFirstName = response.firstName;
                        $scope.UpdateUserUsername = response.username;
                    },
                    function(response) {
                        console.log('Error buscando usuario ' + username, response);
                        $scope.badLogin = response.data;
                    });
            }

            $scope.logout = function() {
                Services.logout(function() {
                    $('#miPerfil').modal('hide');
                    $scope.user = undefined;
                    $scope.token = undefined;
                    noty({
                        text: "Vuelve pronto",
                        type: 'success',
                        timeout: 5000
                    });
                }, function() {
                    noty({
                        text: "Error al intentar desloguear!",
                        type: 'error',
                        timeout: 5000
                    });
                });
            }

            $scope.me = function() {
                if ($scope.token) {
                    Services.me($scope.token,
                        function(res) {
                            $scope.user = res.data;
                        },
                        function() {
                            noty({
                                text: "Error al traer detalles del usuario",
                                type: 'error',
                                timeout: 5000
                            });
                        })
                }
            };
            $scope.token = $localStorage.token;
            $scope.admin = $localStorage.admin;
            $scope.me();
        }
    ]);

app.controller(
    "userViewCtrl", [
        '$scope', '$http', '$timeout', '$localStorage', 'Services',
        function($scope, $http, $timeout, $localStorage, Services) {
            $scope.token = $localStorage.token;
            $scope.admin = $localStorage.admin;
            $scope.me = function() {
                if ($scope.token && $scope.admin) {
                    Services.me($scope.token,
                        function(res) {
                            $scope.user = res;
                        },
                        function() {
                            noty({
                                text: "Error al traer detalles del usuario",
                                type: 'error',
                                timeout: 5000
                            });
                        })
                } else {
                    window.location = "/#test";
                };
            };
            $scope.me();

            $scope.loadUsers = function() {
                $http({
                    method: 'GET',
                    url: '/api/users',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(
                    function(response) {
                        $scope.Users = response.data;
                    },
                    function(response) {
                        $scope.UsersError = 'Request failed' + " error code: " + response.data + response.data.status;
                    });
            }
            $scope.loadUsers();

            $scope.deleteUser = function(username) {
                noty({
                    text: 'Se eliminará el usuario ' + username + ' permanentemente, confirme para continuar',
                    theme: 'defaultTheme',
                    layout: 'center',
                    type: 'confirm',
                    buttons: [{
                        addClass: 'button',
                        text: 'Continuar',
                        onClick: function($noty) {
                            $noty.close();

                            $http({
                                method: 'DELETE',
                                url: '/api/user/delete',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: { "username": username }
                            }).then(
                                function(response) {
                                    $scope.loadUsers();
                                    noty({
                                        text: "Usuario " + username + " eliminado correctamente.",
                                        type: 'success',
                                        timeout: 5000
                                    });
                                },
                                function(response) {
                                    $scope.addressError = 'Request failed' + " error code: " + response.data + response.data.status;
                                });

                        }
                    }, {
                        addClass: 'button',
                        text: 'Cancel',
                        onClick: function($noty) {
                            $noty.close();
                        }
                    }]
                });
            }

            $scope.UpdateAdmin = false;
            $scope.updateUser = function() {
                var User = {
                    username: $scope.UpdateUsername,
                    firstName: $scope.UpdateFirstName,
                    lastName: $scope.UpdateLastName,
                    email: $scope.UpdateEmail,
                    admin: $scope.UpdateAdmin
                };
                $http({
                    method: 'PUT',
                    url: '/api/user',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: User
                }).then(
                    function(response) {
                        $scope.loadUsers();
                        noty({
                            text: "Usuario  " + $scope.UpdateUserUsername + " actualizado",
                            type: 'success',
                            timeout: 5000
                        });
                    },
                    function(response) {
                        noty({
                            text: "Error actualizando usuario: " + JSON.stringify(response),
                            type: 'error',
                            timeout: 5000
                        });
                    });
            }

            $scope.getUserByUsername = function(username) {
                Services.getByName(username,
                    function(response) {
                        $scope.UpdateAdmin = response.admin;
                        $scope.UpdateEmail = response.email;
                        $scope.UpdateLastName = response.lastName;
                        $scope.UpdateFirstName = response.firstName;
                        $scope.UpdateUsername = response.username;
                    },
                    function(response) {
                        console.log('Error buscando usuario ' + username, response);
                        $scope.badLogin = response.data;
                    });
            }

        }
    ]);
app.directive('datepicker', function() {
    return {

      restrict: 'A',
      // Always use along with an ng-model
      require: '?ngModel',

      link: function(scope, element, attrs, ngModel) {
        if (!ngModel) return;

        ngModel.$render = function() { //This will update the view with your model in case your model is changed by another code.
           element.datepicker('update', ngModel.$viewValue || '');
        };

        element.datepicker().on("changeDate",function(event){
            scope.$apply(function() {
               ngModel.$setViewValue(event.date);//This will update the model property bound to your ng-model whenever the datepicker's date changes.
            });
        });
      }
    };
});