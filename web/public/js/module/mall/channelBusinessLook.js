require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    //按钮组集合
    var completeButton = '<button class="btn btn-primary" type="button" data-operate="complete">绑定</button>'+
                         '<button class="btn btn-danger" type="button" data-operate="reject">驳回</button>';

    //页面操作配置
    var operates = {
        getBasicMessage:function(){
            utils.ajaxSubmit(apis.channelBusiness.getById, {id:param[0]}, function (data) {
                var getByIdData = {dataArr:data};
                $("#basicMessage").html(template('basicList', getByIdData));
            })
        },
        getFansLists:function(){
            utils.ajaxSubmit(apis.channelBusiness.getFansLists, fansParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr
                };
                $("#tabContent").html(template('fansList', getByIdData));
                utils.bindPagination($("#fansPagination"), fansParam, operates.getFansLists);
                $("#fansPagination").html(utils.pagination(parseInt(data.cnt), fansParam.pageNo));
            })
        },
        getCommissionLogList:function(){
            utils.ajaxSubmit(apis.channelBusiness.getCommissionLogLists, commissionParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr
                };
                $.each(data.dataArr,function(i,n){
                    n.typeText = consts.status.channelBusinessCommissionType[n.type];
                    n.orderStatusText = consts.status.channelBusinessOrderStatus[n.orderStatus];
                });
                $("#tabContent").html(template('commissionLogList', getByIdData));
                utils.bindPagination($("#commissionLogPagination"), commissionParam, operates.getCommissionLogList);
                $("#commissionLogPagination").html(utils.pagination(parseInt(data.cnt), commissionParam.pageNo));
            });
        },
        getWalletArr:function(){
            utils.ajaxSubmit(apis.channelBusiness.getWalletArr, {id:param[0]}, function (data) {
                var getByIdData = {walletArr:data};
                $("#tabContent").html(template('walletList', getByIdData));
            });
        },
        //绑定
        complete:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认绑定吗?', '', function () {
                utils.ajaxSubmit(apis.taobaoMemberOperationIdBindRequest.bindById, {id: id}, function (data) {
                    hound.success("操作成功", "", 1000);
                    operates.waitList();
                });
            });
        },
        reject:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.reason('确认驳回吗?','请输入驳回原因',function(data){
                utils.ajaxSubmit(apis.taobaoMemberOperationIdBindRequest.rejectById, {id: id,reason:data}, function (data) {
                    hound.success("操作成功", "", 1000);
                    operates.waitList();
                });
            })
        }
    };

    // 页面首次加载列表数据
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var param = id.split("=");

    var fansParam = {
        pageNo: 1,
        pageSize:10,
        id:param[0]
    };
    var commissionParam = {
        pageNo: 1,
        pageSize:10,
        id:param[0]
    };

    operates.getBasicMessage();
    operates.getFansLists();
    $("#headerTab1").on("click",function(){
        operates.getFansLists();
        $(this).css({color:"orange"});
        $("#headerTab2").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
    });
    $("#headerTab2").on("click",function(){
        operates.getCommissionLogList();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
    });
    $("#headerTab3").on("click",function(){
        operates.getWalletArr();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab2").css({color:"#555555"});
    });
    utils.bindList($(document), operates);
});