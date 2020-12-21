require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    //按钮组集合
    var editButton = '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>',
        startButton =  '<button class="btn btn-primary" type="button" data-operate="setOn">启动</button>',
        delButton = '<button class="btn btn-danger" type="button" data-operate="del">删除</button>',
        logButton = '<button class="btn btn-warning" type="button" data-operate="showLog">日志</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

    //新增机器人规则
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增机器人规则', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.robotRule.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'md');
    });

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.robotRule.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('编辑机器人规则', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.ajaxSubmit(apis.robotRule.updateById, $("#visaPassportForm").serialize(), function (data) {
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'md');
            });
        },
        //启动
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认启动吗?', '', function () {
                utils.ajaxSubmit(apis.robotRule.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        del:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认删除吗?', '', function () {
                utils.ajaxSubmit(apis.robotRule.delById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        showLog:function($this){
            var id = $this.closest("tr").attr("data-id");
            logParam.robotRuleId = id;
            //logListDropDown.statusText = "状态";
            //logParam.date = '';
            //logParam.status = '';
            logParam.pageNo = 1;
            logLoadData();
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        startTime:'',
        endTime:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.robotRule.getLists, param, function (data) {
            //根据状态值显示对应的状态文字
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.robotRoleStatus[n.status];
                if(n.status=="1"){
                    n.materialButtonGroup = editButton + startButton + delButton
                }else if(n.status=="2"){
                    n.materialButtonGroup = logButton
                }else{
                    n.materialButtonGroup = logButton
                }
            });
            data.statusText = listDropDown.statusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            $sampleTable.find('#startTime').val(param.startTime);
            $sampleTable.find('#endTime').val(param.endTime);
        });
    }
    var logParam = {
        pageNo: 1,
        pageSize:10,
        status:'',
        robotRuleId:'',
        typeContent:'',
        date:''
    };
   /* var logListDropDown = {
        statusText:'状态'
    };*/
    function logLoadData(){
        utils.ajaxSubmit(apis.robotRule.getLogListById, logParam, function (data) {
            //data.statusText = logListDropDown.statusText;
            utils.renderModal('规则ID为'+ logParam.robotRuleId +'的日志', template('logList', data),'', 'xl');
            utils.bindPagination($("#logPagination"), logParam, logLoadData);
            $("#logPagination").html(utils.pagination(parseInt(data.cnt), logParam.pageNo));
            //$("#logTable").find('#typeDate').val(logParam.date);

            //$("#logTable").on('click', '#dropLogStatusOptions a[data-id]', function () {
            //    logParam.status = $(this).data('id');
            //    ($(this).text()=="所有") ? logListDropDown.statusText = "状态" : logListDropDown.statusText = $(this).text();
            //    logParam.pageNo = 1;
            //    logLoadData();
            //}).on('click', '#dropLogTypeContentOptions a[data-id]', function () {
            //    logParam.typeContent = $(this).data('id');
            //    ($(this).text()=="所有") ? logListDropDown.TypeContentText = "期数/商品ID" : logListDropDown.TypeContentText = $(this).text();
            //    logParam.pageNo = 1;
            //    logLoadData();
            //});
            //$(".goSearchLog").on("click",function(){
            //    logParam.typeContent = $(".searchLogTypeContent").val();
            //    logListDropDown.TypeContentText =  logParam.typeContent;
            //    logParam.pageNo = 1;
            //    logLoadData();
            //});
            //setInterval(function () {
            //    var $typeDate = $("#logTable").find('#typeDate');
            //    if ($typeDate.length === 1) {
            //        if ($typeDate.val() !== logParam.date) {
            //            logParam.date = $typeDate.val();
            //            logParam.pageNo = 1;
            //            logLoadData();
            //        }
            //    }
            //},500);
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    var listDropDown = {
        statusText:'状态'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    });
    setInterval(function () {
        var $startTime = $sampleTable.find('#startTime');
        if ($startTime.length === 1) {
            if ($startTime.val() !== param.startTime) {
                param.startTime = $startTime.val();
                param.pageNo = 1;
                loadData();
            }
        }
        var $endTime = $sampleTable.find('#endTime');
        if ($endTime.length === 1) {
            if ($endTime.val() !== param.endTime) {
                param.endTime = $endTime.val();
                param.pageNo = 1;
                loadData();
            }
        }
    },500);
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