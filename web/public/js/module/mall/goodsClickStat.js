require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    //按钮组集合
    var comButtons = '<button class="btn btn-primary" type="button" data-operate="reply">回复</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //页面操作配置
    var operates = {
        reply:function($this){
            var id = $this.closest("tr").attr("data-id");
            var tr = $this.closest("tr");
            var submitPeople = tr.find("td").eq(1).text();
            var title = tr.find("td").eq(2).text();
            var submitTime = tr.find("td").eq(3).text();
            var reason = tr.find("td").eq(4).text();
            var otherReason = tr.find("td").eq(5).text();
            var getByIdData = {
                dataArr:{
                    id:id,
                    title:title,
                    submitPeople:submitPeople,
                    submitTime:submitTime,
                    reason:reason,
                    otherReason:otherReason
                }
            };
            utils.renderModal('回复', template('modalDiv', getByIdData), function(){
                if($("#visaPassportForm").valid()) {
                    utils.ajaxSubmit(apis.goodsSoldOutSign.replyById, $("#visaPassportForm").serialize(), function (data) {
                        hound.success("回复成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'lg');
        },
        //查看商品详情
        lookGoods:function($this){
            var id = $this.attr("data-id");
            utils.ajaxSubmit(apis.goods.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data,
                    anchorArr:anchorArr,
                    categoryArr:categoryArr,
                    dateArr:dateArr
                };
                utils.renderModal('查看商品详情', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        time:'',
        goodsTitle:''
    };

    var anchorArr;
    var categoryArr;
    var dateArr;
    function getDownLists(){
        var anchorParam = {
            pageNo: 1,
            pageSize:50000,
            name:'',
            status:''
        };
        utils.ajaxSubmit(apis.anchor.getLists, anchorParam, function (data) {
            anchorArr = data.dataArr;
        });
        var categoryParam = {
            pageNo: 1,
            pageSize:10000,
            title:'',
            status:''
        };
        utils.ajaxSubmit(apis.category.getLists, categoryParam, function (data) {
            categoryArr = data.dataArr;
        });
        var dateParam = {
            pageNo: 1,
            pageSize:50000,
            status:'',
            title:'',
            date:'',
            anchorId:''
        };
        utils.ajaxSubmit(apis.anchorGoodsDate.getLists, dateParam, function (data) {
            dateArr = data.dataArr;
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.goodsClickStat.getLists, param, function (data) {
            data.statusText = listDropDown.statusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            $sampleTable.find('#time').val(param.time);
            $('#time').daterangepicker(null, function(start, end, label) {});
        });
    }
    // 页面首次加载列表数据
    getDownLists();
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
        var $time = $sampleTable.find('#time');
        if ($time.length === 1) {
            if ($time.val() !== param.time) {
                param.time = $time.val();
                param.pageNo = 1;
                loadData();
            }
        }
    },500);
    $("#search").on("click",function(){
        param.pageNo = 1;
        param.goodsTitle = $("#searchCont").val();
        loadData();
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});