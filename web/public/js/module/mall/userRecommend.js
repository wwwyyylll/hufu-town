require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    //按钮组集合
    var completeButton = '<button class="btn btn-primary" type="button" data-operate="complete">审核通过</button>'+
                         '<button class="btn btn-danger" type="button" data-operate="reject">驳回</button>';
    var processedParam = {
        pageNo: 1,
        pageSize:10,
        status:2,
        itemId:''
    };
    var waitParam = {
        pageNo: 1,
        pageSize:10,
        status:1,
        itemId:''
    };
    var rejectParam = {
        pageNo: 1,
        pageSize:10,
        status:3,
        itemId:''
    };
    //页面操作配置
    var operates = {
        processed:function(id){
            var content = $("#searchCont").val();
            var contentType = $("#selectsearchlabel").text();
            utils.ajaxSubmit(apis.userRecommendTaobaoItemRequest.getLists, processedParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr,
                    content:content,
                    contentType:contentType?contentType:"物料商品Id"
                };
                $.each(data.dataArr,function(i,n){
                    n.statusText = consts.status.userRecommendStatus[n.status];
                });
                $("#tabContent").html(template('processedList', getByIdData));
                utils.bindPagination($("#visaPagination"), processedParam, operates.processed);
                $("#visaPagination").html(utils.pagination(parseInt(data.cnt), processedParam.pageNo));

                $(".searchlabel").on("click",function(){
                    $("#selectsearchlabel").text($(this).text());
                    $("#searchCont").val("");
                    $("#searchCont").attr("data-id",'');
                });

                $("#search").on("click",function(){
                    processedParam.pageNo = 1;
                    var selectSearchLabel = $("#selectsearchlabel").text();
                    if(selectSearchLabel=="物料商品Id"){
                        processedParam.itemId = $("#searchCont").val();
                        operates.processed();
                    }
                });
                $('#searchCont').on('keypress',function(event){
                    if (event.keyCode == 13) {
                        $('#search').click();
                    }
                });
            })
        },
        waitList:function(){
            var content = $("#searchCont1").val();
            var contentType = $("#selectsearchlabel1").text();
            utils.ajaxSubmit(apis.userRecommendTaobaoItemRequest.getLists, waitParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr,
                    content:content,
                    contentType:contentType?contentType:"物料商品Id"
                };
                $.each(data.dataArr,function(i,n){
                    n.statusText = consts.status.userRecommendStatus[n.status];
                    n.materialButtonGroup = completeButton;
                });
                $("#tabContent").html(template('waitList', getByIdData));
                utils.bindPagination($("#waitPagination"), waitParam, operates.waitList);
                $("#waitPagination").html(utils.pagination(parseInt(data.cnt), waitParam.pageNo));

                $(".searchlabel1").on("click",function(){
                    $("#selectsearchlabel1").text($(this).text());
                    $("#searchCont1").val("");
                    $("#searchCont1").attr("data-id",'');
                });

                $("#search1").on("click",function(){
                    waitParam.pageNo = 1;
                    var selectSearchLabel1 = $("#selectsearchlabel1").text();
                    if(selectSearchLabel1=="物料商品Id"){
                        waitParam.itemId = $("#searchCont1").val();
                        operates.waitList();
                    }
                });
                $('#searchCont1').on('keypress',function(event){
                    if (event.keyCode == 13) {
                        $('#search1').click();
                    }
                });
            });
        },
        rejectList:function(){
            var content = $("#searchCont2").val();
            var contentType = $("#selectsearchlabel2").text();
            utils.ajaxSubmit(apis.userRecommendTaobaoItemRequest.getLists, rejectParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr,
                    content:content,
                    contentType:contentType?contentType:"物料商品Id"
                };
                $.each(data.dataArr,function(i,n){
                    n.statusText = consts.status.userRecommendStatus[n.status];
                });
                $("#tabContent").html(template('rejectList', getByIdData));
                utils.bindPagination($("#rejectPagination"), rejectParam, operates.rejectList);
                $("#rejectPagination").html(utils.pagination(parseInt(data.cnt), rejectParam.pageNo));

                $(".searchlabel2").on("click",function(){
                    $("#selectsearchlabel2").text($(this).text());
                    $("#searchCont2").val("");
                    $("#searchCont2").attr("data-id",'');
                });

                $("#search2").on("click",function(){
                    rejectParam.pageNo = 1;
                    var selectSearchLabel2 = $("#selectsearchlabel2").text();
                    if(selectSearchLabel2=="物料商品Id"){
                        rejectParam.itemId = $("#searchCont2").val();
                        operates.rejectList();
                    }
                });
                $('#searchCont2').on('keypress',function(event){
                    if (event.keyCode == 13) {
                        $('#search2').click();
                    }
                });
            });
        },
        //审核通过
        complete:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认审核通过吗?', '', function () {
                utils.ajaxSubmit(apis.userRecommendTaobaoItemRequest.passById, {id: id}, function (data) {
                    hound.success("操作成功", "", 1000);
                    operates.waitList();
                });
            });
        },
        reject:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.reason('确认驳回吗?','请输入驳回原因',function(data){
                utils.ajaxSubmit(apis.userRecommendTaobaoItemRequest.rejectById, {id: id,reason:data}, function (data) {
                    hound.success("操作成功", "", 1000);
                    operates.waitList();
                });
            })
        }
    };

    // 页面首次加载列表数据
    operates.waitList();
    $("#headerTab1").on("click",function(){
        operates.processed();
        $(this).css({color:"orange"});
        $("#headerTab2").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
    });
    $("#headerTab2").on("click",function(){
        operates.waitList();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
    });
    $("#headerTab3").on("click",function(){
        operates.rejectList();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab2").css({color:"#555555"});
    });
    utils.bindList($(document), operates);
});