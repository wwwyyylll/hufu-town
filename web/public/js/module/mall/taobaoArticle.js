require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    //按钮组集合
    var comButtons = '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            window.open("@@HOSTview/mall/taobaoArticleDetails.html?id=" + id);
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        type:'',
        date:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.taobaoArticle.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.typeText = consts.status.articleType[n.type];
            });
            $.each(data.dataArr,function(i,n){
                n.materialButtonGroup = comButtons ;
            });
            data.typeText = listDropDown.typeText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            $sampleTable.find('#date').val(param.date);
            //$('#date').daterangepicker(null, function(start, end, label) {});
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    var listDropDown = {
        typeText:'类型'
    };
    $sampleTable.on('click', '#dropTypeOptions a[data-id]', function () {
        param.type = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.typeText = "类型" : listDropDown.typeText = $(this).text();
        loadData();
    });
    setInterval(function () {
        var $date = $sampleTable.find('#date');
        if ($date.length === 1) {
            if ($date.val() !== param.date) {
                param.date = $date.val();
                param.pageNo = 1;
                loadData();
            }
        }
    },500);
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