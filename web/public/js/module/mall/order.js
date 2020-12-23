require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $exportExcel = $("#exportExcel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    var $batchImport = $("#batchImport");
    //按钮组集合
    var lookButton = '<button class="btn btn-info" type="button" data-operate="look">查看详情</button>',
        doingButton = '<button class="btn btn-primary" type="button" data-operate="doing">处理</button>',
        completeBouutn =  '<button class="btn btn-primary" type="button" data-operate="complete">完成</button>',
        refundButton = '<button class="btn btn-danger" type="button" data-operate="refund">退款</button>',
        getLogListButton = '<button class="btn btn-info" type="button" data-operate="getLogList">状态变更日志</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
        if($("#selectsearchlabel").text()=="下单时间"){
            $('#searchCont').addClass("dateRange");
            $(document).ready(function() {
                $('.dateRange').daterangepicker(null, function(start, end, label) {
                });
            });
        }else{
            //销毁日期选择器
            if($('#searchCont').hasClass("dateRange")){
                $('#searchCont').removeClass("dateRange");
                $('#searchCont').data("daterangepicker").remove();
            }
        }
    });
    $(document).on("click",function(){
        $('.ability-list').remove();
    });

    var importFileData = '';
    $batchImport.on("click",function(){
        utils.renderModal('批量导入', template('batchImportModal',''), function(){
            utils.loading(true);
            //console.log(importFileData);
            //var importData = {
            //    source:$("select[name=source]").val(),
            //    file:importFileData
            //}
            //utils.ajaxSubmit(apis.goods.importFromExcel, importData, function (data) {
            //    hound.success("导入成功", "", 1000);
            //    utils.modal.modal('hide');
            //    loadData();
            //})

            var formFile = new FormData();
            formFile.append("c", "taobaoOrder");
            formFile.append("a", "importFromExcel");
            formFile.append("linkUserName", consts.param.linkUserName);
            formFile.append("linkPassword", consts.param.linkPassword);
            formFile.append("signature", consts.param.signature);
            formFile.append("userToken", $.cookie('userToken'));
            //formFile.append("source", $("select[name=source]").val());
            formFile.append("file", importFileData);

            $.ajax({
                type:'POST',
                url: "@@API",
                data: formFile,
                dataType: 'json',
                cache: false, //上传文件无需缓存
                processData: false, //用于对data参数进行序列化处理 这里必须false
                contentType: false, //必须
                success: function (res) {
                    utils.loading(false);
                    if(res.code==200){
                        hound.success('导入成功',res.result,'').then(function(){
                            utils.modal.modal('hide');
                            loadData();
                        });
                    }else{
                        hound.error(res.message);
                    }
                }
            }).fail(function (jqXHR, textStatus) {
                utils.loading(false);
                hound.error('Request failed: ' + textStatus);
            });

        },'md');
        $('.uploadFileBatch').change(function () {
            if (window.FileReader) {
                var reader = new FileReader();
            } else {
                hound.alert("您的设备不支持图片预览功能，如需该功能请升级您的设备！");
            }
            $('.avatarUploadBatch').removeClass('btn-default').addClass('btn-primary').prop('disabled', false);
            var file = this.files[0];
            importFileData = file;
            console.log(importFileData);
            reader.onload = function(e) {
                $(".imgUrl").html('<i class="fa fa-folder mr-2"></i>' + file.name)
            };
            reader.readAsDataURL(file);

            //if(file){
            //    var url = URL.createObjectURL(file);
            //    var base64 = blobToDataURL(file,function(base64Url) {
            //        importFileData = base64Url;
            //    })
            //}
        });
    });

    //订单支付时间筛选
    $exportExcel.on("click",function(){
        utils.renderModal('订单支付时间筛选', template('exportExcelModal', ''), function(){
            if($("#exportExcelForm").valid()) {
                utils.modal.modal('hide');
                param.time = $("#reservation1").val();
                param.pageNo = 1;
                loadData();
            }
        }, 'md');
        $(document).ready(function() {
            $('#reservation1').daterangepicker(null, function(start, end, label) {
            });
        });
    });
    //页面操作配置
    var operates = {
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            var orderNo = $this.closest("tr").find("td").eq(1).text();
            window.open("@@HOSTview/mall/orderDetails.html?orderNo=" + orderNo);
        },
        //处理
        doing:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认处理订单吗?', '', function () {
                utils.ajaxSubmit(apis.order.doingById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //完成
        complete:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认完成订单吗?', '', function () {
                utils.ajaxSubmit(apis.order.completedById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //退款
        refund:function($this){
            var id = $this.closest("tr").attr("data-id");
            var orderNo = $this.closest("tr").find("td").eq(1).text();
            var moneyText = $this.closest("tr").find("td").eq(9).text();
            var money = moneyText.substring(0,moneyText.length-1);
            var initialData = {
                dataArr:{
                    id:id,
                    orderNo:orderNo,
                    money:money,
                    reason:''
                }
            };
            utils.renderModal('退款', template('refundModal', initialData), function(){
                if($("#refundForm").valid()) {
                    utils.ajaxSubmit(apis.order.refundById, $("#refundForm").serialize(), function (data) {
                        hound.success("退款成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
        },
        //状态变更日志列表
        getLogList:function($this){
            var id = $this.closest("tr").attr("data-id");
            var orderNo = $this.closest("tr").find("td").eq(1).text();
            utils.ajaxSubmit(apis.order.getOrderLogListsByOrderId, {id:id}, function (data) {
                $.each(data,function(i,n){
                    n.statusText = consts.status.orderStatus[n.status];
                    n.operatorTypeText = consts.status.userType[n.operatorType];
                });
                var getData = {
                    dataArr:data,
                    orderNo:orderNo
                };
                utils.renderModal('状态变更日志列表',template('logList', getData),'', 'lg');
            })
        }
    };
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var urlParam = id.split("=");
    var warnValue = '';
    if(urlParam[0]==2){
        warnValue = 1;
        $("input[name=warnParam][value='1']").attr("checked","checked");
    }else if(urlParam[0]==3){
        warnValue = 2;
        $("input[name=warnParam][value='2']").attr("checked","checked");
    }else{
        warnValue = '';
        $("input[name=warnParam][value='0']").attr("checked","checked");
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        orderNo:'',
        mobile:'',
        userId:'',
        channelId:''
    };

    $("input[name=warnParam]").on("click",function(){
        if($(this).val()!=0){
            param.pageNo = 1;
            param.searchType = $(this).val();
            loadData();
        }else{
            param.pageNo = 1;
            param.searchType = '';
            loadData();
        }
    });

    var channelArr;
    function getChannelArr(){
        var channelParam = {
            pageNo: 1,
            pageSize:50,
            status:'',
            title:''
        };
        utils.ajaxSubmit(apis.channel.getLists, channelParam, function (data) {
            channelArr = data.dataArr;
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.order.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.orderStatus[n.status];
                if(n.status==1){
                    //待处理
                    n.materialButtonGroup = lookButton + doingButton + refundButton + getLogListButton;
                }else if(n.status==2){
                    //处理中
                    n.materialButtonGroup = lookButton + completeBouutn + refundButton + getLogListButton;
                }else if(n.status==3){
                    //已完成
                    n.materialButtonGroup = lookButton + getLogListButton;
                }else if(n.status==4){
                    //已退款
                    n.materialButtonGroup = lookButton + getLogListButton;
                }
            });
            data.statusText = listDropDown.statusText;
            data.channelArr = channelArr;
            data.channelText = listDropDown.channelText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            $sampleTable.find('#time').val(param.time);
            $('#time').daterangepicker(null, function(start, end, label) {});
        });
    }
    // 页面首次加载列表数据
    getChannelArr();
    setTimeout(function(){
        loadData();
    },100);
    utils.bindList($(document), operates);
    var listDropDown = {
        statusText:'状态',
        channelText:'渠道'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        loadData();
    }).on('click', '#dropChannelOptions a[data-id]', function () {
        param.channelId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.channelText = "渠道" : listDropDown.channelText = $(this).text();
        loadData();
    });
    setInterval(function () {
        var $time = $sampleTable.find('#time');
        if ($time.length === 1) {
            if ($time.val() !== param.time) {
                param.time = $time.val();
                param.pageNo = 1;
                loadData();
            }
        }
    },500);
    $("#searchCont").on("input",function(){
        var selectSearchLabel = $("#selectsearchlabel").text();
        if(selectSearchLabel=="渠道"){
            var param = {
                pageNo: 1,
                pageSize:50,
                status:'',
                title:$("#searchCont").val()
            };
            utils.ajaxSubmit(apis.channel.getLists, param, function (data) {
                if(data.dataArr.length!=0){
                    var $economyAbilityItem = '';
                    $.each(data.dataArr, function (i, v) {
                        $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.title +'</div>'
                    })
                    $('.ability-list').remove();
                    var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                    $("#searchCont").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function(){
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $("#searchCont").val(data.dataArr[$index].title);
                        $("#searchCont").attr("data-id",data.dataArr[$index].id);
                    });
                }else{
                    $('.ability-list').remove();
                    var $abilityList = '<div class="ability-list">'+
                        '<div data-id="-1" class="economy-ability-item">无数据</div>'
                        +'</div>';
                    $("#searchCont").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function(){
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $("#searchCont").val("无数据");
                        $("#searchCont").attr("data-id","-1");
                    });
                }
            });
        }
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        //判断是什么条件搜索
        var selectSearchLabel = $("#selectsearchlabel").text();
        if(selectSearchLabel=="订单号"){
            param.orderNo = $("#searchCont").val();
            param.mobile = '';
            param.userId = '';
            param.channelId = '';
            loadData();
        }else if(selectSearchLabel=="手机号"){
            param.mobile = $("#searchCont").val();
            param.orderNo = '';
            param.userId = '';
            param.channelId = '';
            loadData();
        }else if(selectSearchLabel=="用户ID"){
            param.userId = $("#searchCont").val();
            param.orderNo = '';
            param.mobile = '';
            param.channelId = '';
            loadData();
        }else if(selectSearchLabel=="渠道"){
            param.channelId = $("#searchCont").attr("data-id");
            param.userId = '';
            param.orderNo = '';
            param.mobile = '';
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});