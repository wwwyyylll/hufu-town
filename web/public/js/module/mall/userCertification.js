require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

    //页面操作配置
    var operates = {};

    var param = {
        pageNo: 1,
        pageSize:10,
        nickName:'',
        realName:'',
        mobile:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.taobaoUserCertification.getLists, param, function (data) {
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
        var selectSearchLabel = $("#selectsearchlabel").text();
        if(selectSearchLabel=="昵称"){
            //订单号搜索
            param.nickName = $("#searchCont").val();
            param.realName = '';
            param.mobile = '';
            loadData();
        }else if(selectSearchLabel=="真实姓名"){
            //商品标题搜索
            param.realName = $("#searchCont").val();
            param.nickName = '';
            param.mobile = '';
            loadData();
        }else if(selectSearchLabel=="手机号"){
            //商品标题搜索
            param.mobile = $("#searchCont").val();
            param.nickName = '';
            param.realName = '';
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});