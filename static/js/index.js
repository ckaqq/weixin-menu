(function(){
    
    var app = angular.module('weixin_menu', []);
    
    // 菜单编辑
    app.controller('menu', function($scope, $http) {
        $scope.del = function(){
            alert("del");
        };
        return $http({
            url:'menu.json',
            method:'GET'
        }).success(function(res){
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
                cnt++;
                if (menu["sub_button"]) {
                    for (var j = 0; j < menu['sub_button'].length; j++) {
                        lists[cnt] = menu['sub_button'][j];
                        lists[cnt]['rank'] = 2;
                        cnt++;
                    };
                }
                if (!menu['sub_button'] || menu['sub_button'].length != 5) {
                    lists[cnt++] = {
                        name: "添加二级菜单",
                        rank: 3
                    }
                }
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

})();