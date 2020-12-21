require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var getByIdData = {};
    //页面操作配置
    var operates = {
        //查看
        look:function(id){
            utils.ajaxSubmit(apis.user.getById, {id: id}, function (data) {
                data.sourceText = consts.status.userDetailSource[data.source];
                data.isSignUpText = consts.status.isBind1[data.isSignUp];
                getByIdData = {
                    dataArr:data
                };
                $("#basicMessage").html(template('basicList', getByIdData));
                $("#basicMessage").find("input").prop('disabled', true);
                operates.taskLists();
            });
        },
        commissionLog:function(){
            utils.ajaxSubmit(apis.user.getCommissionLogByUserId, commissionParam, function (data) {
                $.each(data.dataArr,function(i,n){
                    n.typeText = consts.status.commissionType[n.type];
                    n.settlementStatusText = consts.status.settlementStatus[n.isSettlement];
                    n.contentArr.fansTypeText = consts.status.fansType[n.contentArr.fansType];
                    n.contentArr.typeText = consts.status.buyType[n.contentArr.type];
                    n.contentArr.typeText1 = consts.status.buyType1[n.contentArr.type];
                });
                $("#tabContent").html(template('commissionLogList', data));
                utils.bindPagination($("#visaPagination"), commissionParam, operates.commissionLog);
                $("#visaPagination").html(utils.pagination(parseInt(data.cnt), commissionParam.pageNo));
            });
        },
        taobaoCommissionLog:function(){
            utils.ajaxSubmit(apis.user.getCommissionLogByUserId_taobao, taobaoCommissionParam, function (data) {
                $.each(data.dataArr,function(i,n){
                    n.typeText = consts.status.taobaoCommissionType[n.type];
                    n.settlementStatusText = consts.status.settlementStatus[n.isSettlement];
                    n.contentArr.fansTypeText = consts.status.fansType[n.contentArr.fansType];
                    n.contentArr.typeText = consts.status.buyType[n.contentArr.type];
                    n.contentArr.typeText1 = consts.status.buyType1[n.contentArr.type];
                });
                $("#tabContent").html(template('taobaoCommissionLogList', data));
                utils.bindPagination($("#visaPagination_taobao1"), taobaoCommissionParam, operates.taobaoCommissionLog);
                $("#visaPagination_taobao1").html(utils.pagination(parseInt(data.cnt), taobaoCommissionParam.pageNo));
            });
        },
        walletMessage:function(){
            $("#tabContent").html(template('walletMessage', getByIdData.dataArr));
            $("#tabContent").find("input").prop('disabled', true);
        },
        taobaoWalletMessage:function(){
            $("#tabContent").html(template('taobaoWalletMessage', getByIdData.dataArr));
            $("#tabContent").find("input").prop('disabled', true);
        },
        getCashOutRequestLists:function(){
            utils.ajaxSubmit(apis.user.getCashOutRequestLists, cashOutRequestParam, function (data) {
                $.each(data.dataArr,function(i,n){
                    n.statusText = consts.status.userStatus[n.status];
                    n.accountTypeText = consts.status.accountTypeShow[n.accountType];
                });
                $("#tabContent").html(template('cashOutRequestList', data));
                utils.bindPagination($("#visaPagination1"), cashOutRequestParam, operates.getCashOutRequestLists);
                $("#visaPagination1").html(utils.pagination(parseInt(data.cnt), cashOutRequestParam.pageNo));
            });
        },
        getTaoBaoCashOutRequestLists:function(){
            utils.ajaxSubmit(apis.user.getCashOutRequestLists_taobao, taobaoCashOutRequestParam, function (data) {
                $.each(data.dataArr,function(i,n){
                    n.statusText = consts.status.userStatus[n.status];
                    n.accountTypeText = consts.status.accountTypeShow[n.accountType];
                });
                $("#tabContent").html(template('taobaoCashOutRequestList', data));
                utils.bindPagination($("#visaPagination_taobao"), taobaoCashOutRequestParam, operates.getTaoBaoCashOutRequestLists);
                $("#visaPagination_taobao").html(utils.pagination(parseInt(data.cnt), taobaoCashOutRequestParam.pageNo));
            });
        },
        accountLists:function(){
            $.each(getByIdData.dataArr.accountArr,function(i,n){
                n.accountTypeText = consts.status.accountType[n.accountType];
                n.logArr = n.log.split("|");
            });
            $("#tabContent").html(template('accountList', getByIdData.dataArr));
        },
        taobaoAccountLists:function(){
            $.each(getByIdData.dataArr.taobaoAccountArr,function(i,n){
                n.accountTypeText = consts.status.accountType[n.accountType];
                n.logArr = n.log.split("|");
            });
            $("#tabContent").html(template('taobaoAccountList', getByIdData.dataArr));
        },
        userLogLook:function($this){
            var logArrContent = [];
            var divArr = $this.closest("td").find("div");
            for(var i=0;i<divArr.length;i++){
                logArrContent.push(divArr.eq(i).text())
            }
            var userLogLookData = {
                dataArr:logArrContent
            };
            utils.renderModal('查看操作日志', template('userLogLists', userLogLookData),'', 'md');
        },
        certificationMessage:function(){
            $("#tabContent").html(template('certificationMessage', getByIdData.dataArr));
            $("#tabContent").find("input").prop('disabled', true);
        },
        taobaoCertificationMessage:function(){
            $("#tabContent").html(template('taobaoCertificationMessage', getByIdData.dataArr));
            $("#tabContent").find("input").prop('disabled', true);
        },
        userLevelLogLists:function(){
            utils.ajaxSubmit(apis.user.getUserLevelLogListsByUserId, userLevelLogParam, function (data) {
                $("#tabContent").html(template('userLevelLogList', data));
                utils.bindPagination($("#visaPagination2"), userLevelLogParam, operates.userLevelLogLists);
                $("#visaPagination2").html(utils.pagination(parseInt(data.cnt), userLevelLogParam.pageNo));
            });
        },
        taskLists:function(){
            utils.ajaxSubmit(apis.user.getTaobaoTaskLists, taskParam, function (data) {
                $.each(data.dataArr,function(i,n){
                    n.typeText = consts.status.taskType[n.type];
                    n.userId = taskParam.userId;
                    if(n.type!=9){
                        n.isCompletedText = consts.status.isCompletedType[n.isCompleted];
                    }else{
                        n.isCompletedText = consts.status.isCompletedType1[n.isCompleted];
                    }
                });
                $("#tabContent").html(template('taskList', data));
                utils.bindPagination($("#taskPagination"), taskParam, operates.taskLists);
                $("#taskPagination").html(utils.pagination(parseInt(data.cnt), taskParam.pageNo,20));
            });
        },
        //允许登录
        allow:function($this){
            var id = $("input[name=id]").val();
            hound.reason('确认设为允许登录吗?','请输入允许登录原因',function(data){
                utils.ajaxSubmit(apis.user.allowLoginById, {id: id,reason:data}, function (data) {
                    operates.look(param[0]);
                });
            })
        },
        //禁止登录
        notAllow:function($this){
            var id = $("input[name=id]").val();
            hound.reason('确认设为禁止登录吗?','请输入禁止登录原因',function(data){
                utils.ajaxSubmit(apis.user.disableLoginById, {id: id,reason:data}, function (data) {
                    operates.look(param[0]);
                });
            })
        }
    };

    // 页面首次加载列表数据
    //打开的对应的页面nav + active属性
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var param = id.split("=");

    var commissionParam = {
        pageNo: 1,
        pageSize:10,
        userId:param[0]
    };
    var taobaoCommissionParam = {
        pageNo: 1,
        pageSize:10,
        userId:param[0]
    };
    var cashOutRequestParam = {
        pageNo: 1,
        pageSize:10,
        userId:param[0]
    };
    var taobaoCashOutRequestParam = {
        pageNo: 1,
        pageSize:10,
        userId:param[0]
    };
    var userLevelLogParam = {
        pageNo: 1,
        pageSize:10,
        userId:param[0]
    };
    var taskParam = {
        pageNo: 1,
        pageSize:20,
        userId:param[0]
    };
    operates.look(param[0]);
    // 好物商城 or 胡夫塔
    $("#big_headerTab1").on("click",function(){
        $("#headerTab1").css({color:"orange"});
        $("#headerTab1").closest("li").siblings().find("a").css({color:"#555555"});
        operates.commissionLog();
        $(".bigContent1").show();
        $(".bigContent2").hide();
        $(".titleName").find("a").text("奖励明细");
        $(this).css({color:"#ffffff"});
        $(this).closest("li").css({background:"#fba07d"});
        $(this).closest("li").siblings().css({background:"#ffffff"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#big_headerTab2").on("click",function(){
        $("#headerTab7").css({color:"orange"});
        $("#headerTab7").closest("li").siblings().find("a").css({color:"#555555"});
        operates.taskLists();
        $(".bigContent1").hide();
        $(".bigContent2").show();
        $(".titleName").find("a").text("收益明细");
        $(this).css({color:"#ffffff"});
        $(this).closest("li").css({background:"#fba07d"});
        $(this).closest("li").siblings().css({background:"#ffffff"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    // Tab模块选择
    $("#headerTab1").on("click",function(){
        if($("#big_headerTab1").css("color")=="rgb(255, 255, 255)"){
            operates.commissionLog();
        }else{
            operates.taobaoCommissionLog();
        }
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab2").on("click",function(){
        if($("#big_headerTab1").css("color")=="rgb(255, 255, 255)"){
            operates.walletMessage();
        }else{
            operates.taobaoWalletMessage();
        }
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab3").on("click",function(){
        if($("#big_headerTab1").css("color")=="rgb(255, 255, 255)"){
            operates.getCashOutRequestLists();
        }else{
            operates.getTaoBaoCashOutRequestLists();
        }
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab4").on("click",function(){
        if($("#big_headerTab1").css("color")=="rgb(255, 255, 255)"){
            operates.certificationMessage();
        }else{
            operates.taobaoCertificationMessage();
        }
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab5").on("click",function(){
        if($("#big_headerTab1").css("color")=="rgb(255, 255, 255)"){
            operates.accountLists();
        }else{
            operates.taobaoAccountLists();
        }
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab6").on("click",function(){
        operates.userLevelLogLists();
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab7").on("click",function(){
        operates.taskLists();
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    utils.bindList($(document), operates);
});