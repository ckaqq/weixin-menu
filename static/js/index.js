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
        $scope.editting = {};
        $scope.add = function() {
            var cnt = 0;
            var len = $scope.lists.length;
            for (var i = 0; i < len; i++) {
                if ($scope.lists[i].rank == 1) {
                    cnt++;
                }
            };
            if (cnt >= 3) {
                alert("一级菜单最多创建3个");
            } else {
                $scope.lists.push(
                    {
                        name: "",
                        rank: 1,
                        unselect: true,
                        cnt: len
                    },
                    {
                        name: "添加二级菜单",
                        rank: 3,
                        cnt: len + 1
                    }
                );
                $scope.edit(len);
            }
        }

        $('#myModal').on('hidden.bs.modal', function (e) {
            var key = $("#myModalInput").val();
            var num = $scope.editting.num;
            var type = $scope.editting.type;
            $scope.lists[num].unselect = false;
            $scope.lists[num].type = type;
            $scope.lists[num].key = key;
            $scope.$digest();
            return false;
        });
        $('#myModal').on('shown.bs.modal', function () {
            $('#myModalInput').focus()
        })
        $scope.select = function(num, type) {
            $scope.editting = {
                num: num,
                type: type
            };
            var text = type=="view" ? '设置菜单跳转链接' : '设置菜单KEY值';
            $("#myModalInput").val('');
            $("#myModalLabel").text(text);
            $("#myModal").modal({
                backdrop: 'static',
                keyboard: false
            });
        };

        $scope.del = function(num) {
            var lists = [], cnt = 0, flag = false;
            var rank = $scope.lists[num].rank;
            if(rank == 2) {
                if ($scope.lists[num-1].rank == 1) {
                    if (!$scope.lists[num+2] || $scope.lists[num+2].rank == 1) {
                        $scope.lists[num-1].unselect = true;
                        $scope.lists[num-1].key = '';
                    }
                }
            }
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
        $scope.myBlur = function(num) {
            var name = $scope.lists[num].name.trim();
            var rank = $scope.lists[num].rank;
            $scope.has_error = false;
            $scope.checked[num] = false;
            if (name === "") {
                $scope.lists[num].name = $scope.back[num].name;
                $scope.lists[num].rank = $scope.back[num].rank;
                return false;
            }
            while(getLength(name) > rank * 8) {
                $scope.lists[num].name = name.substr(0, name.length-1);
                name = $scope.lists[num].name;
            }
            if ($scope.back[num].rank == 3) {
                $scope.lists[num].unselect = true;
                var lists = [], cnt = 0;
                for (var i = 0; i < $scope.lists.length; i++) {
                    lists[cnt] = $scope.lists[i];
                    lists[cnt].cnt = cnt;
                    cnt++;
                    if (num == i) {
                        lists[cnt] = {
                            name: "添加二级菜单",
                            rank: 3,
                            cnt: cnt
                        };
                        cnt++;
                    }
                };
                $scope.lists = lists;
            }
            $scope.back[num] = {};
        }
        $scope.edit = function(num) {
            $scope.back[num] = {};
            $scope.back[num].name = $scope.lists[num].name;
            $scope.back[num].rank = $scope.lists[num].rank;
            var rank = $scope.lists[num].rank;
            if (rank == 3) {
                if($scope.lists[num-1].rank == 1) {
                    if (!confirm("确认使用二级菜单？\n使用二级菜单后，当前编辑的消息将会被清除。")) {
                        return false;
                    }
                    $scope.lists[num-1].type = '';
                    $scope.lists[num-1].key = '';
                } else {
                    var tmp = num, cnt = 0;
                    while(tmp >=0 && $scope.lists[tmp-1].rank != 1) {
                        cnt++;
                        tmp--;
                    }
                    if (cnt == 5) {
                        alert("每个一级菜单下最多只能有5个二级菜单");
                        return false;
                    }
                }
                $scope.lists[num].rank = 2;
                $scope.lists[num].name = '';
            }
            $scope.checked[num] = true;
            setTimeout(function(){$(".input-" + num).focus();}, 50);
        };
        $scope.myKeyup = function(e, num){
            var name = $scope.lists[num].name.trim();
            var rank = $scope.lists[num].rank;
            if (getLength(name) > 8 * rank) {
                $scope.has_error = true;
            } else {
                $scope.has_error = false;
            }
            var keycode = window.event ? e.keyCode : e.which;
            if(keycode == 13) {
                $scope.myBlur(num);
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
                click: {
                    name: "菜单Key",
                    type: "click"
                },
                view: {
                    name: "跳转网页",
                    type: "view"
                },
                scancode_push: {
                    name: "扫描事件",
                    type: "scancode_push"
                },
                scancode_waitmsg: {
                    name: "扫描弹框",
                    type: "scancode_waitmsg"
                },
                pic_sysphoto: {
                    name: "拍照发图",
                    type: "pic_sysphoto"
                },
                pic_photo_or_album: {
                    name: "拍照相册",
                    type: "pic_photo_or_album"
                },
                pic_weixin: {
                    name: "相册发图",
                    type: "pic_weixin"
                },
                location_select: {
                    name: "地理选择",
                    type: "location_select"
                }
            };
        });
    });

    // 预览
    app.controller('preview', function($scope) {

    });

    $(".container").show();
})();