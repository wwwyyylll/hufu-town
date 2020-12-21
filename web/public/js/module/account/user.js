require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    //按钮组集合
    var allowButton = '<button class="btn btn-primary" type="button" data-operate="allow">允许登录</button>',
        disableButton = '<button class="btn btn-danger" type="button" data-operate="notAllow">禁止登录</button>',
        rechargeButton = '<button class="btn btn-primary" type="button" data-operate="recharge">充值</button>',
        getMoneyListButton = '<button class="btn btn-info" type="button" data-operate="getMoneyList">金额变化日志列表</button>',
        lookButton = '<button class="btn btn-info" type="button" data-operate="look">查看详情</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

    //页面操作配置
    var operates = {
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            //window.location.href = "@@HOSTview/account/userDetailsLook.html?id=" + id;
            utils.ajaxSubmit(apis.user.getById, {id: id}, function (data) {
                //hound.success("操作成功", "", 1000);
                //loadData();
            });
        },
        //允许登录
        allow:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认设为允许登录吗?','',function(){
                utils.ajaxSubmit(apis.user.allowLoginById, {id: id}, function (data) {
                    hound.success("操作成功", "", 1000);
                    loadData();
                });
            })
        },
        //禁止登录
        notAllow:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认设为禁止登录吗?','',function(){
                utils.ajaxSubmit(apis.user.disableLoginById, {id: id}, function (data) {
                    hound.success("操作成功", "", 1000);
                    loadData();
                });
            })
        },
        //充值金额
        recharge:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.reason('确认充值金额吗?','请输入充值金额',function(data){
                utils.ajaxSubmit(apis.user.rechargeById, {id: id,money:data}, function (data) {
                    hound.success("操作成功", "", 1000);
                    loadData();
                });
            })
        },
        getMoneyList:function($this){
            var id = $this.closest("tr").attr("data-id");
            getMoneyListParam.id = id;
            getMoneyListData();
        }
    };

    var getMoneyListParam = {
        id:'',
        pageNo: 1,
        pageSize:10
    };
    function getMoneyListData(){
        utils.ajaxSubmit(apis.user.getUserMoneyLists, getMoneyListParam, function (data) {
            utils.renderModal('金额变化日志列表',template('moneyList', data),'', 'lg');
            utils.bindPagination($("#moneyPagination"), getMoneyListParam, getMoneyListData);
            $("#moneyPagination").html(utils.pagination(parseInt(data.cnt), getMoneyListParam.pageNo));
        });
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        id:'',
        status:'',
        mobile:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.user.getLists, param, function (data) {
            //根据状态值显示对应的状态文字 + 显示对应的 允许登录/禁止登录 按钮
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.user[n.status];
                (n.status=="1")? n.materialButtonGroup = disableButton + rechargeButton : n.materialButtonGroup = allowButton  ;
                n.materialButtonGroup = n.materialButtonGroup + getMoneyListButton ;
            });
            data.statusText = listDropDown.statusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    //列表筛选事件绑定
    var listDropDown = {
        statusText:'状态'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        var selectsearchLabel = $("#selectsearchlabel").text();
        if(selectsearchLabel=="用户ID"){
            param.id = $("#searchCont").val();
            param.mobile = '';
            loadData();
        }else if(selectsearchLabel=="用户手机号"){
            param.id = '';
            param.mobile = $("#searchCont").val();
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});