require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
        if($("#selectsearchlabel").text()=="提交时间"){
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
    });

    //页面操作配置
    var operates = {
        //查看供应商
        look:function($this){
            var id = $this.attr("data-id");
            utils.ajaxSubmit(apis.mallSupplier.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('查看供应商', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        orderNo:'',
        isAccept:'',
        supplierId:'',
        time:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.mallOrderSubmitSupplier.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.isAcceptText = consts.status.top[n.isAccept];
            });
            data.isAcceptText = listDropDown.isAcceptText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    var listDropDown = {
        isAcceptText:'是否接单'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.isAccept = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.isAcceptText = "是否接单" : listDropDown.isAcceptText = $(this).text();
        loadData();
    });
    $("#searchCont").on("input",function(){
        var selectSearchLabel = $("#selectsearchlabel").text();
        if(selectSearchLabel=="供应商"){
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
            param.orderNo = '';
            param.time = '';
            loadData();
        }else if(selectSearchLabel=="提交时间"){
            //提交时间搜索
            param.time = $("#searchCont").val();
            param.supplierId = '';
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