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
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        title:''
    };
    var listDropDown = {
        statusText:'状态'
    };

    function loadData() {
        utils.ajaxSubmit(apis.goodsSoldOutSign.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.message[n.status];
                (n.status=="1")? n.materialButtonGroup = comButtons: n.materialButtonGroup = '';
            });
            data.statusText = listDropDown.statusText;
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
        param.status = 1;
        listDropDown.statusText = "待回复";
    }else{
        param.status = '';
        listDropDown.statusText = "状态";
    }

    loadData();
    utils.bindList($(document), operates);
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    });
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