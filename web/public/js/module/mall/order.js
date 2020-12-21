require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $exportExcel = $("#exportExcel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    var $batchImport = $("#batchImport");
    //按钮组集合
    var lookButton = '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        completeBouutn =  '<button class="btn btn-primary" type="button" data-operate="complete">完成</button>',
        refundButton = '<button class="btn btn-danger" type="button" data-operate="activistRefund">退款</button>',
        validButton = '<button class="btn btn-danger" type="button" data-operate="valid">无效</button>',
        deliverButton = '<button class="btn btn-primary" type="button" data-operate="deliver">发货</button>',
        submitSupplierButton = '<button class="btn btn-primary" type="button" data-operate="submitSupplier">接单</button>',
        noSupplierButton = '<button class="btn btn-danger" type="button" data-operate="noSupplier">不接单</button>',
        supplierButton = '<button class="btn btn-primary" type="button" data-operate="supplier">供应商接单</button>',
        bindMemberIdButton = '<button class="btn btn-primary" type="button" data-operate="bindMemberId">绑定会员运营ID</button>';

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
            var orderNo = $this.closest("tr").find("td").eq(1).find("div").eq(0).text();
            window.open("@@HOSTview/mall/orderDetails.html?id=" + id);
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
        //维权退款
        activistRefund:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认维权退款吗?', '', function () {
                utils.ajaxSubmit(apis.order.refundById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //无效
        valid:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认订单无效吗?', '', function () {
                utils.ajaxSubmit(apis.order.inValidById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //退款申请
        refund:function($this){
            var id = $this.closest("tr").attr("data-id");
            var orderNo = $this.closest("tr").find("td").eq(1).find("div").eq(0).text();
            var amountText = $this.closest("tr").find("td").eq(7).text();
            var amount = amountText.substring(0,amountText.length-1);
            var num = $this.closest("tr").find("td").eq(10).text();
            var initialData = {
                dataArr:{
                    id:id,
                    orderNo:orderNo,
                    amount:amount,
                    reason:'',
                    num:num
                }
            };
            utils.renderModal('申请退款', template('refundModal', initialData), function(){
                if($("#refundForm").valid()) {
                    utils.ajaxSubmit(apis.mallOrderRefundRequest.create, $("#refundForm").serialize(), function (data) {
                        hound.success("申请退款成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
        },
        //发货
        deliver:function($this){
            var id = $this.closest("tr").attr("data-id");
            var orderNo = $this.closest("tr").find("td").eq(1).find("div").eq(0).text();
            var initialData = {
                dataArr:{
                    id:id,
                    orderNo:orderNo,
                    expressCompany:'',
                    expressNo:''
                }
            };
            utils.renderModal('发货', template('deliverModal', initialData), function(){
                if($("#deliverForm").valid()) {
                    utils.ajaxSubmit(apis.order.deliveredById, $("#deliverForm").serialize(), function (data) {
                        hound.success("发货成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
        },
        //接单
        submitSupplier:function($this){
            var id = $this.closest("tr").attr("data-id");
            var initialData = {
                dataArr:{
                    id:id,
                    amount:''
                }
            };
            utils.renderModal('接单', template('submitSupplierModal', initialData), function(){
                if($("#submitSupplierForm").valid()) {
                    utils.ajaxSubmit(apis.order.submitSupplierById, $("#submitSupplierForm").serialize(), function (data) {
                        hound.success("接单成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
        },
        //不接单
        noSupplier:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.reason('确认不接单吗?','请输入不接单原因',function(data){
                utils.ajaxSubmit(apis.order.submitSupplierById, {id: id,isAccept:2,reason:data}, function (data) {
                    hound.success("操作成功", "", 1000);
                    loadData();
                });
            })
        },
        bindMemberId:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.reason('确认绑定会员运营ID吗?','请输入要绑定的会员运营ID',function(data){
                utils.ajaxSubmit(apis.order.bindMemberOperationId, {id: id,memberOperationId:data}, function (data) {
                    hound.success("操作成功", "", 1000);
                    loadData();
                });
            })
        },
        supplier:function($this){
            var id = $this.closest("tr").attr("data-id");
            var totalAmount = $this.closest("tr").find("td").eq(6).find("span").eq(0).text();
            var actualTotalAmount = $this.closest("tr").find("td").eq(7).text();
            var num = $this.closest("tr").find("td").eq(10).text();
            var goodsAmount = $this.closest("tr").find("td").eq(6).find("span").eq(1).text();
            var expressFee = $this.closest("tr").find("td").eq(6).find("span").eq(2).text();
            var deductionPrice = $this.closest("tr").find("td").eq(8).text();
            var initialData = {
                dataArr:{
                    id:id,
                    totalAmount:totalAmount,
                    actualTotalAmount:actualTotalAmount,
                    num:num,
                    goodsAmount:goodsAmount,
                    expressFee:expressFee,
                    deductionPrice:deductionPrice
                }
            };
            utils.renderModal('供应商接单', template('supplierModal', initialData), function(){
                if($("#supplierForm").valid()) {
                    utils.ajaxSubmit(apis.order.submitSupplierById, $("#supplierForm").serialize(), function (data) {
                        hound.success("操作成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
            $("select[name=isAccept]").on("change",function(){
                if($(this).val()==1){
                    $(".amountDiv").show();
                    $(".reasonDiv").hide();
                    $(".amount").attr("required","required");
                    $(".amount").attr("name","amount");
                    $(".reason").removeAttr("required");
                    $(".reason").removeAttr("name");
                }else{
                    $(".amountDiv").hide();
                    $(".reasonDiv").show();
                    $(".reason").attr("required","required");
                    $(".reason").attr("name","reason");
                    $(".amount").removeAttr("required");
                    $(".amount").removeAttr("name");
                }
            })
        }
    }
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
        userId:''
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

    var showTypeArr;
    var parentArr;
    function getConstsLists(){
        utils.ajaxSubmit(apis.order.getConstLists, '', function (data) {
            showTypeArr = data.showTypeArr;
        });
    }
    function getParentLists(){
        utils.ajaxSubmit(apis.order.getParentLists, '', function (data) {
            parentArr = data;
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.order.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.orderStatus[n.status];
                //n.isSettlementText = consts.status.orderSettlementStatus[n.isSettlement];
                if(n.status==1 || n.status==2 || n.status==3){
                    n.materialButtonGroup = lookButton + refundButton + validButton;
                }else{
                    n.materialButtonGroup = lookButton ;
                }
                if(n.memberOperationId=='' || n.memberOperationId==null){
                    n.materialButtonGroup = n.materialButtonGroup + bindMemberIdButton ;
                }else{
                    n.materialButtonGroup = n.materialButtonGroup ;
                }
            });
            data.statusText = listDropDown.statusText;
            data.settlementText = listDropDown.settlementText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            $sampleTable.find('#time').val(param.time);
            $('#time').daterangepicker(null, function(start, end, label) {});
        });
    }
    // 页面首次加载列表数据
    //getConstsLists();
    //getParentLists();
    //setTimeout(function(){
        loadData();
    //},100);
    utils.bindList($(document), operates);
    var listDropDown = {
        statusText:'状态',
        settlementText:'结算状态'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        loadData();
    }).on('click', '#dropSettlementOptions a[data-id]', function () {
        param.isSettlement = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.settlementText = "结算状态" : listDropDown.settlementText = $(this).text();
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
        if(selectSearchLabel=="用户昵称"){
            var param = {
                pageNo: 1,
                pageSize:50,
                status:'',
                mobile:'',
                nickName:$("#searchCont").val()
            };
            utils.ajaxSubmit(apis.user.getLists, param, function (data) {
                if(data.dataArr.length!=0){
                    var $economyAbilityItem = '';
                    $.each(data.dataArr, function (i, v) {
                        $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.nickName +'</div>'
                    })
                    $('.ability-list').remove();
                    var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                    $("#searchCont").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function(){
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $("#searchCont").val(data.dataArr[$index].nickName);
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
        }else if(selectSearchLabel=="供应商"){
            var supplierParam = {
                pageNo: 1,
                pageSize:50,
                name:$("#searchCont").val(),
                status:'',
                source:'',
                accountType:''
            };
            utils.ajaxSubmit(apis.mallSupplier.getLists, supplierParam, function (data) {
                if(data.dataArr.length!=0){
                    var $economyAbilityItem = '';
                    $.each(data.dataArr, function (i, v) {
                        $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.name +'</div>'
                    })
                    $('.ability-list').remove();
                    var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                    $("#searchCont").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function(){
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $("#searchCont").val(data.dataArr[$index].name);
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
            //订单号搜索
            param.orderNo = $("#searchCont").val();
            param.memberOperationId = '';
            loadData();
        }else if(selectSearchLabel=="会员运营ID"){
            //商品标题搜索
            param.memberOperationId = $("#searchCont").val();
            param.orderNo = '';
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});