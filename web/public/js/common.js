define("common", ["consts", "apis", "utils"], function(consts, apis, utils) {
    //检验此时是否登录
    utils.ajaxSubmit(apis.login.isLogin,'',function(data){
        if(data.userToken==''){
            window.location.href = "@@HOSTlogin.html";
        }else{
            $(".app-sidebar__user-name").text(data.userName);
            $(".app-sidebar__user-designation").text(data.roleName);
        }
    });
    //退出登录
    $("#logout").on("click",function(){
        //$.removeCookie("userName",{ path: '/'});
        $.removeCookie("userToken",{ path: '/'});
        window.location.href = "@@HOSTlogin.html";
    });
    //小铃铛的警告提示
    function warnList(){
        utils.ajaxSubmit(apis.warn.getLists, '', function (data) {
            $("#warnList").html(template('warnItem',data));
            $(".warnCnt").text(data.cnt);
            if(data.cnt>0){
                $(".warnCnt").css({display:"inline-block"});
                $(".warnCnt").parent().find("a").find("i").attr("id","bell");
            }else{
                $(".warnCnt").hide();
                $(".warnCnt").parent().find("a").find("i").removeAttr("id");
            }
        });
    }
    //warnList();
    //获取排行榜的管理tag
    function getRankingList(){
        var rankParam = {
            pageNo: 1,
            pageSize:20,
            status:1
        };
        utils.ajaxSubmit(apis.ranking.getLists,rankParam,function(data){
            $("#rankingDiv").html(template('rankingItem', data));

            var currentUrl = window.location.href;
            var itemArr = $(".treeview-item");
            if(currentUrl.length>1){
                $.each(itemArr,function(i,n){
                    if(currentUrl.indexOf($(this).attr("href"))!= -1){
                        $(this).closest(".treeview").addClass("is-expanded");
                        $(this).closest("ul").show();
                        $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                        $(this).addClass("active");
                    }else if(currentUrl.indexOf("store/add.html")!= -1 || currentUrl.indexOf("store/edit.html")!= -1 || currentUrl.indexOf("store/look.html")!= -1){
                        if($(this).attr("href").indexOf("store/goods.html")!= -1){
                            $(this).closest(".treeview").addClass("is-expanded");
                            $(this).closest("ul").show();
                            $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                            $(this).addClass("active");
                        }
                    }else if(currentUrl.indexOf("subject/add.html")!= -1 || currentUrl.indexOf("subject/edit.html")!= -1 || currentUrl.indexOf("subject/look.html")!= -1){
                        if($(this).attr("href").indexOf("subject/subject.html")!= -1){
                            $(this).closest(".treeview").addClass("is-expanded");
                            $(this).closest("ul").show();
                            $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                            $(this).addClass("active");
                        }
                    }
                });
            }
        });
    }
    //getRankingList();
    //打开的对应的页面nav + active属性
    var currentUrl = window.location.href;
    var itemArr = $(".common-item");
    if(currentUrl.length>1){
        $.each(itemArr,function(i,n){
            if(currentUrl.indexOf($(this).attr("href"))!= -1){
                $(this).closest(".treeview").addClass("is-expanded");
                $(this).closest("ul").show();
                $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                $(this).addClass("active");
            }else if(currentUrl.indexOf("store/add.html")!= -1 || currentUrl.indexOf("store/edit.html")!= -1 || currentUrl.indexOf("store/look.html")!= -1){
                if($(this).attr("href").indexOf("store/goods.html")!= -1){
                    $(this).closest(".treeview").addClass("is-expanded");
                    $(this).closest("ul").show();
                    $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                    $(this).addClass("active");
                }
            }else if(currentUrl.indexOf("subject/add.html")!= -1 || currentUrl.indexOf("subject/edit.html")!= -1 || currentUrl.indexOf("subject/look.html")!= -1){
                if($(this).attr("href").indexOf("subject/subject.html")!= -1){
                    $(this).closest(".treeview").addClass("is-expanded");
                    $(this).closest("ul").show();
                    $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                    $(this).addClass("active");
                }
            }
        });
    }
    //三级导航栏
    $(".three_menu_item").on("click",function(){
        var threeList = $(this).parent().find(".three_list");
        if(threeList.css("display")=="block"){
            threeList.slideUp(100);
            $(this).find("i").eq(1).removeClass("three_item_rotate");
            $(this).find("i").eq(1).addClass("three_item_rotate1");
        }else{
            threeList.slideDown(100);
            $(this).find("i").eq(1).addClass("three_item_rotate");
            $(this).find("i").eq(1).removeClass("three_item_rotate1");
        }
    });
    //2020.09.21
    function getMenuLists(){
        utils.ajaxSubmit(apis.gather.getMenuLists,'',function(data){
            var oneLevelArr = [];
            var twoLevelArr = [];
            var threeLevelArr = [];
            $.each(data,function(i,n){
                oneLevelArr.push(n.title);
                $.each(n.child,function(j,m){
                    twoLevelArr.push(m.title);
                    $.each(m.child,function(k,v){
                        threeLevelArr.push(v.title);
                    })
                })
            });

            var menu1 = $(".app-menu>li>a");
            for(var i=0;i<menu1.length;i++){
                var menuText = menu1.eq(i).find("span").text();
                if(oneLevelArr.indexOf(menuText)!="-1"){
                    menu1.eq(i).parent().show();
                }else{
                    menu1.eq(i).parent().hide();
                }
            }

            var menu3 = $(".app-menu>li>ul>li>.common-item");
            for(var i=0;i<menu3.length;i++){
                var menuText3 = menu3.eq(i).text();
                if(twoLevelArr.indexOf(menuText3)!="-1"){
                    menu3.eq(i).parent().show();
                }else{
                    menu3.eq(i).parent().hide();
                }
            }

            var menu2 = $(".app-menu>li>ul>li>.app-menu__item");
            for(var i=0;i<menu2.length;i++){
                var menuText2 = menu2.eq(i).find("span").text();
                if(twoLevelArr.indexOf(menuText2)!="-1"){
                    menu2.eq(i).parent().show();
                }else{
                    menu2.eq(i).parent().hide();
                }
            }

            var menu4 = $(".app-menu>li>ul>li>.three_list>li");
            for(var i=0;i<menu4.length;i++){
                var menuText4 = menu4.eq(i).find("a").text();
                if(threeLevelArr.indexOf(menuText4)!="-1"){
                    menu4.eq(i).show();
                }else{
                    menu4.eq(i).hide();
                }
            }
        })
    }
    //getMenuLists();
    //2020.09.22
    function getMenuLists1(){
        utils.ajaxSubmit(apis.gather.getMenuLists,'',function(data){
            $(".app-menu").html("");
            var getData = {
                data:data
            };
            $(".app-menu").html(template('menuItem', getData));

            $(".treeview").on("click",function(){
                if($(this).hasClass("is-expanded")){
                    $(this).removeClass("is-expanded");
                }else{
                    $(this).addClass("is-expanded");
                }
            });

            $(".three_menu_item").on("click",function(event){
                event.stopPropagation();
                var threeList = $(this).parent().find(".three_list");
                if(threeList.css("display")=="block"){
                    threeList.slideUp(100);
                    $(this).find("i").eq(1).removeClass("three_item_rotate");
                    $(this).find("i").eq(1).addClass("three_item_rotate1");
                }else{
                    threeList.slideDown(100);
                    $(this).find("i").eq(1).addClass("three_item_rotate");
                    $(this).find("i").eq(1).removeClass("three_item_rotate1");
                }
            });

            var currentUrl = window.location.href;
            var itemArr = $(".three_item");
            if(currentUrl.length>1){
                $.each(itemArr,function(i,n){
                    if(currentUrl.indexOf($(this).attr("href"))!= -1){
                        $(this).closest(".treeview").addClass("is-expanded");
                        $(this).closest("ul").show();
                        $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                        $(this).addClass("active");
                    }else if(currentUrl.indexOf("store/add.html")!= -1 || currentUrl.indexOf("store/edit.html")!= -1 || currentUrl.indexOf("store/look.html")!= -1){
                        if($(this).attr("href").indexOf("store/goods.html")!= -1){
                            $(this).closest(".treeview").addClass("is-expanded");
                            $(this).closest("ul").show();
                            $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                            $(this).addClass("active");
                        }
                    }else if(currentUrl.indexOf("subject/add.html")!= -1 || currentUrl.indexOf("subject/edit.html")!= -1 || currentUrl.indexOf("subject/look.html")!= -1){
                        if($(this).attr("href").indexOf("subject/subject.html")!= -1){
                            $(this).closest(".treeview").addClass("is-expanded");
                            $(this).closest("ul").show();
                            $(this).closest("ul").parent().find("i").eq(1).addClass("three_item_rotate");
                            $(this).addClass("active");
                        }
                    }
                });
            }
        })
    }
    //getMenuLists1();
});