(function(){
    
    var app = angular.module('weixin_menu', []);

    function getLength(str) {
        return str.replace(/[^\x00-\xff]/g,"aa").length;
    };

    // 菜单编辑
    app.controller('menu', function($scope, $http) {
        $scope.back = {};
        $scope.checked = [];
        $scope.editting = {};
        $scope.has_error = false;
        $scope.lists = [];
        $scope.menus = [];
        $scope.menuShow = [];
        $scope.modalError = false;
        $scope.typeArray = {};

        $scope.publish = function() {

        }

        function copyItem(item) {
            var res = {
                name: item.name,
                sub_button: []
            };
            if (item.type) {
                res.type = item.type;
                if (item.type == "view") {
                    res.url = item.key;
                } else {
                    res.key = item.key;
                }
            }
            return res;
        }

        $scope.preview = function() {
            var menu = [], cnt = -1, item, num;
            for (var i = 0; i < $scope.lists.length; i++) {
                if ($scope.lists[i].unselect == true) {
                    alert("存在还未设置响应动作的菜单，请检查");
                    return false;
                }
            }
            for (var i = 0; i < $scope.lists.length; i++) {
                item = $scope.lists[i];
                if (item.rank == 3) {
                    continue;
                }
                if (item.rank == 1) {
                    num = 0;
                    menu[++cnt] = copyItem(item);
                } else {
                    menu[cnt].sub_button[num++] = copyItem(item);
                }
            };
            $scope.menuShow = [];
            $scope.menus = menu;
        }

        $scope.menuClick = function(one, two) {
            var open = $scope.menuShow[one];
            $scope.menuShow = [];
            if ($scope.menus[one].sub_button && $scope.menus[one].sub_button.length != 0) {
                $scope.menuShow[one] = !open;
            }
        };

        // 新增菜单
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

        // 模态框完成
        $scope.modalFinish = function() {
            var key = $scope.editting.key;
            var num = $scope.editting.num;
            var type = $scope.editting.type;

            if (!key) {
                $scope.modalError = true;
                return false;
            }

            $scope.lists[num].unselect = false;
            $scope.lists[num].type = type;
            $scope.lists[num].key = key;
            $('#myModal').modal('hide');
        };

        // 模态框取消
        $scope.modalCancel = function() {
            var key = $scope.back.modal;
            if (key) {
                $scope.editting.key = key;
            }
            $scope.modalFinish();
        };

        $scope.modalKeyup = function(e){
            $scope.modalError = false;
            var keycode = window.event ? e.keyCode : e.which;
            if(keycode == 13) {
                $('#myModalInput').blur();
                $scope.modalFinish();
            }
        };
        // 打开模态框
        $scope.select = function(num, type) {
            var key = $scope.lists[num].key;
            $scope.back.modal = key;
            $scope.editting = {
                num: num,
                type: type,
                key: key,
                title: type=="view" ? '设置菜单跳转链接' : '设置菜单KEY值',
                note: type=="view" ? "点击该菜单会跳到以上链接" : "菜单KEY值，用于消息接口推送，不超过64个字"
            };
            $("#myModal").modal({
                backdrop: 'static',
                keyboard: false
            });
            $('#myModalInput').focus();
        };

        // 删除列表
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

        // 输入框失去焦点
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

        // 编辑输入框
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
                    $scope.lists[num-1].unselect = false;
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

        // 输入过程
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

        // 生成列表
        $http({
            url:'menu.json',
            method:'GET'
        }).success(function(res) {
            var lists = [], cnt = 0;
            // 将数组的层数将为一层
            $scope.menus = res['button'];
            for (var i = 0; i < $scope.menus.length; i++) {
                var menu = $scope.menus[i];
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
            // 再次处理特殊情况
            for (var i = 0; i < lists.length; i++) {
                if(lists[i].url) {
                    lists[i].key = lists[i].url;
                }
            };
            //console.log($scope.menu);
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

    $(".container").show();
    //$(".list-group").sortable().disableSelection();
})();