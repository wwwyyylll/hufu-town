require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    //按钮组集合
    var handleButtons = '<button class="btn btn-danger" type="button" data-operate="handle">退款</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //新增
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.user.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    loadData();
                })
            }
        }, 'lg');
    })

    var processedParam = {
        pageNo: 1,
        pageSize:10,
        orderNo:''
    };
    var waitParam = {
        pageNo: 1,
        pageSize:10,
        orderNo:''
    };
    //页面操作配置
    var operates = {
        intoPoliceStation:function($this){
            var id = $("input[name=id]").val();
            var initialData = {
                dataArr:{
                    userId:id,
                    charge:'',
                    day:''
                }
            };
            utils.renderModal('关进警察局', template('modalPoliceDiv',initialData), function(){
                if($("#policeForm").valid()){
                    utils.ajaxSubmit(apis.policeOffice.create,$("#policeForm").serialize(),function(data){
                        hound.success("添加成功","",1000);
                        utils.modal.modal('hide');
                        operates.look(param[0]);
                    })
                }
            }, 'lg');
        },
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.user.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('编辑用户', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.ajaxSubmit(apis.user.updateById, $("#visaPassportForm").serialize(), function (data) {
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'lg');
            });
        },
        //查看
        look:function(id){
            utils.ajaxSubmit(apis.user.getById, {id: id}, function (data) {
                data.sourceText = consts.status.sourceText[data.source];
                var getByIdData = {
                    dataArr:data
                };
                $("#basicMessage").html(template('basicList', getByIdData));
                $("#basicMessage").find("input").prop('disabled', true);
            });
        },
        processed:function(id){
            processedParam.orderNo = $("#searchCont").val();
            utils.ajaxSubmit(apis.mallOrderRefundRequest.getProcessedLists, processedParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr,
                    orderNo:processedParam.orderNo
                };
                $("#tabContent").html(template('processedList', getByIdData));
                utils.bindPagination($("#visaPagination"), processedParam, operates.processed);
                $("#visaPagination").html(utils.pagination(parseInt(data.cnt), processedParam.pageNo));
                $("#search").on("click",function(){
                    processedParam.pageNo = 1;
                    processedParam.orderNo = $("#searchCont").val();
                    operates.processed();
                });
                $('#searchCont').on('keypress',function(event){
                    if (event.keyCode == 13) {
                        $('#search').click();
                    }
                });
            })
        },
        waitList:function(){
            waitParam.orderNo = $("#searchCont1").val();
            utils.ajaxSubmit(apis.mallOrderRefundRequest.getWaitLists, waitParam, function (data) {
                var getByIdData = {
                    dataArr:data.dataArr,
                    orderNo:waitParam.orderNo
                };
                $.each(data.dataArr,function(i,n){
                    n.materialButtonGroup = handleButtons;
                })
                $("#tabContent").html(template('waitList', getByIdData));
                utils.bindPagination($("#waitPagination"), waitParam, operates.waitList);
                $("#waitPagination").html(utils.pagination(parseInt(data.cnt), waitParam.pageNo));
                $("#search1").on("click",function(){
                    waitParam.pageNo = 1;
                    waitParam.orderNo = $("#searchCont1").val();
                    operates.waitList();
                });
                $('#searchCont1').on('keypress',function(event){
                    if (event.keyCode == 13) {
                        $('#search1').click();
                    }
                });
            });
        },
        //退款
        handle:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认退款吗?', '', function () {
                utils.ajaxSubmit(apis.mallOrderRefundRequest.handleById, {id: id}, function (data) {
                    operates.waitList();
                });
            });
        }
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        mobile:$("#searchCont").val()
    };

    function loadData() {
        utils.ajaxSubmit(apis.user.getLists, param, function (data) {
            //根据状态值显示对应的状态文字 + 显示对应的 允许登录/禁止登录 按钮
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.user[n.status];
                n.sourceText = consts.status.source[n.source];
                (n.status=="1")? n.materialButtonGroup = disableButton + comButtons : n.materialButtonGroup = allowButton + comButtons ;
                (n.isPrison=="2")? n.materialButtonGroup = n.materialButtonGroup + intoPoliceStationButton : n.materialButtonGroup = n.materialButtonGroup;
            })
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    // 页面首次加载列表数据
    //打开的对应的页面nav + active属性
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var param = id.split("=");

    var dynamicParam = {
        pageNo: 1,
        pageSize:10,
        id:param[0]
    }

    //operates.look(param[0]);
    operates.waitList();
    $("#headerTab1").on("click",function(){
        operates.processed();
        $(this).css({color:"orange"});
        $("#headerTab2").css({color:"#555555"});
    })
    $("#headerTab2").on("click",function(){
        operates.waitList();
        $(this).css({color:"orange"});
        $("#headerTab1").css({color:"#555555"});
    })
    //loadData();
    utils.bindList($(document), operates);
    //列表筛选事件绑定
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        loadData();
        var titleText = "";
        ($(this).text()=="所有") ? titleText = "状态" : titleText = $(this).text();
        setTimeout(function(){
            $("#dropStatus").text(titleText);
        },300)
    });
});