require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    //按钮组集合
    var editButton = '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>',
        lookButton = '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">有效</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">无效</button>',
        topButton = '<button class="btn btn-primary" type="button" data-operate="setTop">置顶</button>',
        cancelTopButton = '<button class="btn btn-danger" type="button" data-operate="cancelTop">取消置顶</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

    //页面操作配置
    var operates = {
        add:function($this){
            var id = '';
            var title = '';
            var parentId;
            var parentName;
            if($this.attr("data-id")=="oneLevel"){
                parentId = 0;
                parentName = "此模块为一级分类，无父级分类";
            }else if($this.attr("data-id")=="twoLevel"){
                parentId = $this.parent().find("span").eq(0).attr("data-id");
                parentName = $this.parent().find("span").eq(0).text();
            }else if($this.attr("data-id")=="threeLevel"){
                parentId = $this.parent().find("span").eq(0).attr("data-id");
                parentName = $this.parent().find("span").eq(0).text();
            }
            var idx = '';
            var url = '';
            var initialData = {
                dataArr:{
                    id:id,
                    title:title,
                    parentId:parentId,
                    parentName:parentName,
                    idx:idx,
                    url:url
                }
            };
            utils.renderModal('新增', template('moduleItem',initialData), function(){
                if($("#moduleForm").valid()){
                    utils.ajaxSubmit(apis.module.create,$("#moduleForm").serialize(),function(data){
                        hound.success("添加成功","",1000);
                        utils.modal.modal('hide');
                        loadData(1);
                    })
                }
            }, 'lg');
        },
        //编辑
        edit:function($this){
            var id = $this.parent().find("span").eq(0).attr("data-id");
            var title = $this.parent().find("span").eq(0).text();
            var parentId = $this.attr("data-value");
            var parentName;
            if($this.attr("data-id")=="oneLevel"){
                parentName = "此模块为一级分类，无父级分类";
            }else if($this.attr("data-id")=="twoLevel"){
                parentName = $this.closest(".oneLevelDiv").find("div").eq(0).find("h5").find("span").eq(0).text();
            }else if($this.attr("data-id")=="threeLevel"){
                parentName = $this.closest(".twoLevelDiv").find("div").eq(0).find("h6").find("span").eq(0).text();
            }
            var idx = $this.parent().find("span").eq(1).text();
            var url = $this.parent().find("span").eq(2).text();

            var getByIdData = {
                dataArr:{
                    id:id,
                    title:title,
                    parentId:parentId,
                    parentName:parentName,
                    idx:idx,
                    url:url
                }
            };
            utils.renderModal('编辑', template('moduleItem', getByIdData), function(){
                if($("#moduleForm").valid()) {
                    utils.ajaxSubmit(apis.module.updateById, $("#moduleForm").serialize(), function (data) {
                        hound.success("编辑成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData(1);
                    })
                }
            }, 'lg');
        },
        //查看
        look:function($this){
            var id = $this.parent().find("span").eq(0).attr("data-id");
            var title = $this.parent().find("span").eq(0).text();
            var parentId = $this.attr("data-value");
            var parentName;
            if($this.attr("data-id")=="oneLevel"){
                parentName = "此模块为一级分类，无父级分类";
            }else if($this.attr("data-id")=="twoLevel"){
                parentName = $this.closest(".oneLevelDiv").find("div").eq(0).find("h5").find("span").eq(0).text();
            }else if($this.attr("data-id")=="threeLevel"){
                parentName = $this.closest(".twoLevelDiv").find("div").eq(0).find("h6").find("span").eq(0).text();
            }
            var idx = $this.parent().find("span").eq(1).text();
            var url = $this.parent().find("span").eq(2).text();

            var getByIdData = {
                dataArr:{
                    id:id,
                    title:title,
                    parentId:parentId,
                    parentName:parentName,
                    idx:idx,
                    url:url
                }
            };
            utils.renderModal('查看', template('moduleItem', getByIdData),'', 'lg');
            $("#moduleForm").append($("fieldset").prop('disabled', true));
        },
        //无效
        setOff:function($this){
            var id = $this.parent().find("span").eq(0).attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.module.offById, {id: id}, function (data) {
                    loadData(1);
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.parent().find("span").eq(0).attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.module.onById, {id: id}, function (data) {
                    loadData(1);
                });
            });
        },
        showTwoLevel:function($this){
            var twoLevelDiv = $this.closest(".oneLevelDiv").find(".twoLevelDiv");
            var element = $this.parent().find("i").eq(0);
            if(twoLevelDiv.length!=0){
                $this.parent().find(".moduleMessage").hide();
                if(twoLevelDiv.css("display")=="block"){
                    element.removeClass("fa-folder-open");
                    element.addClass("fa-folder");
                    twoLevelDiv.slideUp(100);
                }else{
                    element.addClass("fa-folder-open");
                    element.removeClass("fa-folder");
                    twoLevelDiv.slideDown(100);
                }
            }else{
                $this.parent().find(".moduleMessage").show();
            }
        },
        showThreeLevel:function($this){
            var threeLevelDiv = $this.closest(".twoLevelDiv").find(".threeLevelDiv");
            var element = $this.parent().find("i").eq(0);
            if(threeLevelDiv.length!=0){
                $this.parent().find(".moduleMessage").hide();
                if(threeLevelDiv.css("display")=="block"){
                    element.removeClass("fa-folder-open");
                    element.addClass("fa-folder");
                    threeLevelDiv.slideUp(100);
                }else{
                    element.addClass("fa-folder-open");
                    element.removeClass("fa-folder");
                    threeLevelDiv.slideDown(100);
                }
            }else{
                $this.parent().find(".moduleMessage").show();
            }
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        isTop:''
    };

    var controllerLists;
    var typeArr;
    var caListsArr;
    var positionArr;
    function getControllerLists(){
        utils.ajaxSubmit(apis.module.getControllerLists, '', function (data) {
            controllerLists = data;
            utils.ajaxSubmit(apis.module.getCaListsByControllerId,{id:controllerLists[0].id}, function (data) {
                caListsArr = data;
            });
        });
        utils.ajaxSubmit(apis.module.getConstLists, '', function (data) {
            typeArr = data.typeArr;
            positionArr = data.positionArr;
        });
    }
    //getControllerLists();

    function loadData(isShow) {
        utils.ajaxSubmit(apis.module.getLists, '', function (data) {
            var getData = {
                dataArr:data
            };
            if(isShow==1){
                getData.isShow = 1;
            }else{
                getData.isShow = 2;
            }
            $sampleTable.html(template('visaListItem', getData));
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        loadData();
        var titleText = "";
        ($(this).text()=="所有") ? titleText = "状态" : titleText = $(this).text();
        setTimeout(function(){
            $("#dropStatus").text(titleText);
        },300)
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        param.title = $("#searchCont").val();
        loadData();
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});