require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">置顶</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">下架</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

    //页面操作配置
    var operates = {
        //下架
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认下架吗?', '', function () {
                utils.ajaxSubmit(apis.taobaoRecommendAnchorDateSubject.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //置顶
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认置顶吗?', '', function () {
                utils.ajaxSubmit(apis.taobaoRecommendAnchorDateSubject.topById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10
    };

    function loadData() {
        utils.ajaxSubmit(apis.taobaoRecommendAnchorDateSubject.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                (n.status=="1")? n.materialButtonGroup = startBouutn + stopButton : n.materialButtonGroup = "<span style='color: orange'>------</span>" ;
            });
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
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
        loadData();
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        param.itemId = $("#searchCont").val();
        loadData();
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});