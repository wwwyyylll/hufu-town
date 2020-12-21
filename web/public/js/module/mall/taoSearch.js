require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    //按钮组集合
    var lookButton = '<button class="btn btn-info" type="button" data-operate="look">查看商品</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //页面操作配置
    var operates = {
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            itemParam.keywordsId = id;
            itemLoadData();
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        keywords:''
    };
    var listDropDown = {
        shopTypeText:'店铺类型',
        priceText:'价格',
        couponText:'优惠券',
        volumeText:'销量'
    };

    var itemParam = {
        pageNo: 1,
        pageSize:10,
        keywordsId:'',
        shopType:'',
        haveCoupon:'',
        orderByVolume:'',
        orderByPrice:''
    };
    function itemLoadData(){
        utils.ajaxSubmit(apis.searchTaobaoKeywords.getItemByKeywordsId, itemParam, function (data) {
            $.each(data.dataArr,function(i,n){
                n.shopTypeText = consts.status.shopType[n.shopType];
                n.haveCouponText = consts.status.haveCoupon[n.haveCoupon];
            });
            data.shopTypeText = listDropDown.shopTypeText;
            data.priceText = listDropDown.priceText;
            data.couponText = listDropDown.couponText;
            data.volumeText = listDropDown.volumeText;
            utils.renderModal('查看商品', template('listItem', data),'', 'xl');
            utils.bindPagination($("#itemPagination"), itemParam, itemLoadData);
            $("#itemPagination").html(utils.pagination(parseInt(data.cnt), itemParam.pageNo));

            $("#itemTable").on('click', '#dropShopTypeOptions a[data-id]', function () {
                itemParam.shopType = $(this).data('id');
                ($(this).text()=="所有") ? listDropDown.shopTypeText = "店铺类型" : listDropDown.shopTypeText = $(this).text();
                itemParam.pageNo = 1;
                itemLoadData();
            }).on('click', '#dropPriceOptions a[data-id]', function () {
                itemParam.orderByPrice = $(this).data('id');
                ($(this).text()=="所有") ? listDropDown.priceText = "价格" : listDropDown.priceText = $(this).text();
                itemParam.pageNo = 1;
                itemParam.orderByVolume = '';
                listDropDown.volumeText = '销量';
                itemLoadData();
            }).on('click', '#dropCouponOptions a[data-id]', function () {
                itemParam.haveCoupon = $(this).data('id');
                ($(this).text()=="所有") ? listDropDown.couponText = "优惠券" : listDropDown.couponText = $(this).text();
                itemParam.pageNo = 1;
                itemLoadData();
            }).on('click', '#dropVolumeOptions a[data-id]', function () {
                itemParam.orderByVolume = $(this).data('id');
                ($(this).text()=="所有") ? listDropDown.volumeText = "销量" : listDropDown.volumeText = $(this).text();
                itemParam.pageNo = 1;
                itemParam.orderByPrice = '';
                listDropDown.priceText = '价格';
                itemLoadData();
            });
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.searchTaobaoKeywords.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.materialButtonGroup = lookButton ;
            });
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    loadData();
    utils.bindList($(document), operates);
    $("#search").on("click",function(){
        param.pageNo = 1;
        param.keywords = $("#searchCont").val();
        loadData();
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});