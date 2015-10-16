(function(){
    
    var app = angular.module('weixin_menu', []);
    
    /*app.directive('setFocus', function(){
        return function(scope, element){
            alert("ok");
            element[0].focus();
        };
    });*/
    /*app.directive('focus', function () {
        return function (scope, element, attrs) {
            attrs.$observe('focus', function (newValue) {
                newValue === 'true' && element[0].focus();
            });
        }
    });*/

    function getLength(str) {
        return str.replace(/[^\x00-\xff]/g,"aa").length;
    };

    // 菜单编辑
    app.controller('menu', function($scope, $http) {
        $scope.checked = [];
        $scope.back = [];
        $scope.has_error = false;

        $scope.del = function(num) {
            var lists = [], cnt = 0, flag = false;
            var rank = $scope.lists[num]['rank'];
            for (var i = 0; i < $scope.lists.length; i++) {
                if (i != num) {
                    if (rank==1 && flag && $scope.lists[i]['rank']!=1) {
                        continue;
                    }
                    lists[cnt++] = $scope.lists[i];
                    flag = false;
                } else {
                    flag = true;
                }
            };
            for (var i = 0; i < lists.length; i++) {
                lists[i].cnt = i;
            };
            //console.log(lists);
            $scope.lists = lists;
        };
        $scope.myBlur = function(cnt) {
            var name = $scope.lists[cnt].name.trim();
            var rank = $scope.lists[cnt].rank;
            $scope.has_error = false;
            $scope.checked[cnt] = false;
            if (name === "") {
                $scope.lists[cnt].name = $scope.back[cnt];
            }
            while(getLength(name) > rank * 8) {
                $scope.lists[cnt].name = name.substr(0, name.length-1);
                name = $scope.lists[cnt].name;
            }
        }
        $scope.edit = function(cnt) {
            var rank = $scope.lists[cnt].rank;
            if (rank == 3) {
                return false;
            }
            $scope.back[cnt] = $scope.lists[cnt].name;
            $scope.checked[cnt] = true;
            setTimeout(function(){$(".input-" + rank).focus();}, 50);
        };
        $scope.myKeyup = function(e, cnt){
            var name = $scope.lists[cnt].name.trim();
            var rank = $scope.lists[cnt].rank;
            if (getLength(name) > 8 * rank) {
                $scope.has_error = true;
            } else {
                $scope.has_error = false;
            }
            var keycode = window.event ? e.keyCode : e.which;
            if(keycode == 13) {
                $scope.myBlur(cnt);
            }
        };
        $http({
            url:'menu.json',
            method:'GET'
        }).success(function(res) {
            var lists = [], cnt = 0;
            for (var i = 0; i < res['button'].length; i++) {
                var menu = res['button'][i];
                lists[cnt] = {
                    rank: 1
                }
                for(var key in menu) {
                    if (key != "sub_button") {
                        lists[cnt][key] = menu[key];
                    }
                }
                lists[cnt]['cnt'] = cnt;
                cnt++;
                if (menu["sub_button"]) {
                    for (var j = 0; j < menu['sub_button'].length; j++) {
                        lists[cnt] = menu['sub_button'][j];
                        lists[cnt]['rank'] = 2;
                        lists[cnt]['cnt'] = cnt;
                        cnt++;
                    };
                }
                lists[cnt] = {
                    name: "添加二级菜单",
                    rank: 3,
                    cnt: cnt
                };
                cnt++;
            };
            //console.log(lists);
            $scope.lists = lists;
            $scope.typeArray = {
                click: "菜单Key",
                view: "跳转网页",
                scancode_push: "扫描事件",
                scancode_waitmsg: "扫描弹框",
                pic_sysphoto: "拍照发图",
                pic_photo_or_album: "拍照相册",
                pic_weixin: "相册发图",
                location_select: "地理选择"
            };
        });
    });

    // 预览
    app.controller('preview', function($scope) {

    });

    $(".container").show();
})();