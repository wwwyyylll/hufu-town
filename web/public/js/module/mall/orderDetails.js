require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var getByIdData = {};
    //页面操作配置
    var operates = {
        //获取订单详情信息
        look:function(orderNo){
            utils.ajaxSubmit(apis.order.getByOrderNo, {orderNo: orderNo}, function (data) {
                getByIdData = {
                    dataArr:data
                };
                getByIdData.dataArr.statusText = consts.status.orderStatus[getByIdData.dataArr.status];
                $("#basicMessage").html(template('orderMessage', getByIdData));
                $("#basicMessage").find("input").prop('disabled', true);
            });
        }
    };
    // 页面首次加载列表数据
    //打开的对应的页面nav + active属性
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var param = id.split("=");

    utils.bindList($(document), operates);

    operates.look(param[0]);

    $("#headerTab1").on("click",function(){
        operates.look(param[0]);
        $(this).css({color:"orange"});
        $("#headerTab2").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
        $("#headerTab4").css({color:"#555555"});
    });
    $("#headerTab2").on("click",function(){
        operates.user();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
        $("#headerTab4").css({color:"#555555"});
    });
    $("#headerTab3").on("click",function(){
        operates.log();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab2").css({color:"#555555"});
        $("#headerTab4").css({color:"#555555"});
    });
    $("#headerTab4").on("click",function(){
        operates.logistics();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
        $("#headerTab2").css({color:"#555555"});
        $("#headerTab3").css({color:"#555555"});
    })
});