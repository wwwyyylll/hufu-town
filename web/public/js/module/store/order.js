require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $exportExcel = $("#exportExcel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    //按钮组集合
    var lookButton = '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        completeBouutn =  '<button class="btn btn-primary" type="button" data-operate="complete">完成</button>',
        refundButton = '<button class="btn btn-danger" type="button" data-operate="refund">申请退款</button>',
        deliverButton = '<button class="btn btn-primary" type="button" data-operate="deliver">发货</button>',
        submitSupplierButton = '<button class="btn btn-primary" type="button" data-operate="submitSupplier">接单</button>',
        noSupplierButton = '<button class="btn btn-danger" type="button" data-operate="noSupplier">不接单</button>',
        supplierButton = '<button class="btn btn-primary" type="button" data-operate="supplier">供应商接单</button>';

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
    })
    $(document).on("click",function(){
        $('.ability-list').remove();
    })

    //导出订单
    $exportExcel.on("click",function(){
        utils.renderModal('导出订单', template('exportExcelModal', ''), function(){
            if($("#exportExcelForm").valid()) {
                utils.ajaxSubmit(apis.exportExcel.exportOrder, $("#exportExcelForm").serialize(), function (data) {
                    var downloadUrl = $(".downloadUrl");
                    if(data.url!=''){
                        downloadUrl.html("<a style='text-decoration:underline' download='' href='"+ data.url +"'>点此下载</a>");
                    }else{
                        downloadUrl.html("<span style='color:red'>暂无符合条件的数据</span>");
                    }
                })
            }
        }, 'md');
        $(".supplierName").on("click",function(){
            var supplierParam = {
                pageNo: 1,
                pageSize:50,
                name:$(".supplierName").val(),
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
                    $(".supplierName").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function(){
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $(".supplierName").val(data.dataArr[$index].name);
                        $(".supplierId").val(data.dataArr[$index].id);
                    });
                }
            });
        });
        $(document).ready(function() {
            $('#reservation1').daterangepicker(null, function(start, end, label) {
            });
        });
    })
    //页面操作配置
    var operates = {
        //查看
        look:function($this){
            var orderNo = $this.closest("tr").find("td").eq(1).find("div").eq(0).text();
            window.open("@@HOSTview/store/orderDetails.html?orderNo=" + orderNo);
        },
        //完成
        complete:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认完成订单吗?', '', function () {
                utils.ajaxSubmit(apis.mallOrder.completedById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //退款申请
        refund:function($this){
            var id = $this.closest("tr").attr("data-id");
            var orderNo = $this.closest("tr").find("td").eq(1).find("div").eq(0).text();
            var totalAmount = $this.closest("tr").find("td").eq(6).find("span").eq(0).text();
            var amountText = $this.closest("tr").find("td").eq(7).text();
            var amount = amountText.substring(0,amountText.length-1);
            var num = $this.closest("tr").find("td").eq(8).text();
            var deductionWalletPrice = $this.closest("tr").find("td").eq(6).find("span").eq(3).text();
            var initialData = {
                dataArr:{
                    id:id,
                    totalAmount:totalAmount,
                    orderNo:orderNo,
                    amount:amount,
                    reason:'',
                    num:num,
                    deductionWalletPrice:deductionWalletPrice
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
                    utils.ajaxSubmit(apis.mallOrder.deliveredById, $("#deliverForm").serialize(), function (data) {
                        hound.success("发货成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
            $(".expressCompanyId").on("keyup",function(){
                var expressParam = {
                    pageNo: 1,
                    pageSize:50000,
                    expName:$(".expressCompanyId").val(),
                    status:1
                };
                utils.ajaxSubmit(apis.mallExpressCompany.getLists, expressParam, function (data) {
                    if(data.dataArr.length!=0){
                        var $economyAbilityItem = '';
                        $.each(data.dataArr, function (i, v) {
                            $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.expName +'</div>'
                        });
                        $('.ability-list').remove();
                        var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                        $(".expressCompanyId").closest('.economy-wards').append($abilityList);

                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".expressCompanyId").val(data.dataArr[$index].expName);
                            $("input[name=expressCompanyId]").val(data.dataArr[$index].id);
                        });
                    }
                });
            });
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
                    utils.ajaxSubmit(apis.mallOrder.submitSupplierById, $("#submitSupplierForm").serialize(), function (data) {
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
                utils.ajaxSubmit(apis.mallOrder.submitSupplierById, {id: id,isAccept:2,reason:data}, function (data) {
                    hound.success("操作成功", "", 1000);
                    loadData();
                });
            })
        },
        supplier:function($this){
            var id = $this.closest("tr").attr("data-id");
            var totalAmount = $this.closest("tr").find("td").eq(6).find("span").eq(0).text();
            var actualTotalAmount = $this.closest("tr").find("td").eq(7).text();
            var num = $this.closest("tr").find("td").eq(8).text();
            var goodsAmount = $this.closest("tr").find("td").eq(6).find("span").eq(1).text();
            var expressFee = $this.closest("tr").find("td").eq(6).find("span").eq(2).text();
            var deductionWalletPrice = $this.closest("tr").find("td").eq(6).find("span").eq(3).text();
            var initialData = {
                dataArr:{
                    id:id,
                    totalAmount:totalAmount,
                    actualTotalAmount:actualTotalAmount,
                    num:num,
                    goodsAmount:goodsAmount,
                    expressFee:expressFee,
                    deductionWalletPrice:deductionWalletPrice
                }
            };
            utils.renderModal('供应商接单', template('supplierModal', initialData), function(){
                if($("#supplierForm").valid()) {
                    utils.ajaxSubmit(apis.mallOrder.submitSupplierById, $("#supplierForm").serialize(), function (data) {
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
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        popularizeGoodsCommissionStatus:'',
        userId:'',
        goodsTitle:'',
        orderNo:'',
        time:'',
        supplierId:'',
        searchType:''
    };
    var listDropDown = {
        statusText:'订单状态',
        commissionStatusText:'佣金结算'
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
        utils.ajaxSubmit(apis.mallOrder.getConstLists, '', function (data) {
            showTypeArr = data.showTypeArr;
        });
    }
    function getParentLists(){
        utils.ajaxSubmit(apis.mallOrder.getParentLists, '', function (data) {
            parentArr = data;
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.mallOrder.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                //for(var j=0;j<showTypeArr.length;j++){
                //    if(n.goodsShowType==showTypeArr[j].val){
                //        n.goodsShowTypeText=showTypeArr[j].name;
                //    }
                //}
                n.statusText = consts.status.orderStatus[n.status];
                n.popularizeGoodsCommissionStatusText = consts.status.isBind[n.popularizeGoodsCommissionStatus];
                (n.canComplete=="1")? n.materialButtonGroup = lookButton + completeBouutn : n.materialButtonGroup = lookButton;
                (n.canDeliver=="1")? n.materialButtonGroup = n.materialButtonGroup + deliverButton : n.materialButtonGroup = n.materialButtonGroup;
                (n.canSubmitSupplier=="1")? n.materialButtonGroup = n.materialButtonGroup + supplierButton : n.materialButtonGroup = n.materialButtonGroup;
                (n.canRefund=="1")? n.materialButtonGroup = n.materialButtonGroup + refundButton : n.materialButtonGroup = n.materialButtonGroup;
            });
            data.statusText = listDropDown.statusText;
            data.commissionStatusText = listDropDown.commissionStatusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    // 页面首次加载列表数据
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var urlParam = id.split("=");
    if(urlParam[0]==1){
        param.status = 2;
        listDropDown.statusText = "已支付";
    }else{
        param.status = '';
        listDropDown.statusText = "状态";
    }
    //getConstsLists();
    //getParentLists();
    //setTimeout(function(){
        loadData();
    //},100);
    utils.bindList($(document), operates);
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "订单状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropCommissionStatusOptions a[data-id]', function () {
        param.popularizeGoodsCommissionStatus = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.commissionStatusText = "佣金结算" : listDropDown.commissionStatusText = $(this).text();
        param.pageNo = 1;
        loadData();
    });
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
            param.userId = '';
            param.goodsTitle = '';
            param.time = '';
            param.supplierId = '';
            loadData();
        }else if(selectSearchLabel=="商品标题"){
            //商品标题搜索
            param.goodsTitle = $("#searchCont").val();
            param.userId = '';
            param.orderNo = '';
            param.time = '';
            param.supplierId = '';
            loadData();
        }else if(selectSearchLabel=="用户昵称"){
            //用户昵称搜索
            if($("#searchCont").val()==''){
                param.userId = '';
            }else{
                param.userId = $("#searchCont").attr("data-id");
            }
            param.goodsTitle = '';
            param.orderNo = '';
            param.time = '';
            param.supplierId = '';
            loadData();
        }else if(selectSearchLabel=="供应商"){
            //供应商搜索
            if($("#searchCont").val()==''){
                param.supplierId = '';
            }else{
                param.supplierId = $("#searchCont").attr("data-id");
            }
            param.userId = '';
            param.goodsTitle = '';
            param.orderNo = '';
            param.time = '';
            loadData();
        }else if(selectSearchLabel=="下单时间"){
            //日期范围搜索
            param.time = $("#searchCont").val();
            param.supplierId = '';
            param.userId = '';
            param.goodsTitle = '';
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