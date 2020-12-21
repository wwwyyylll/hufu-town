require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    //按钮组集合
    var lookButtons = '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        refundButton = '<button class="btn btn-danger" type="button" data-operate="refund">申请退款</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    function blobToDataURL(blob,cb) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            var base64 = evt.target.result
            cb(base64)
        };
        reader.readAsDataURL(blob);
    }
    var picFile = "";
    function uploadFile(){
        //选择图片文件
        $(".uploadImg").change(function(){
            //判断是否支持FileReader
            if (window.FileReader) {
                var reader = new FileReader();
            } else {
                hound.alert("您的设备不支持图片预览功能，如需该功能请升级您的设备！");
            }
            var file = this.files[0];
            reader.onload = function(e) {

            };
            reader.readAsDataURL(file);

            if(file){
                hound.confirm('确认发送选中图片吗?', '', function () {
                    var url = URL.createObjectURL(file);
                    var base64 = blobToDataURL(file,function(base64Url) {
                        picFile = base64Url;
                        $.ajax({
                            type:'POST',
                            url: "@@API",
                            data: {
                                c:"img",
                                a:"uploadForBase64",
                                linkUserName:consts.param.linkUserName,
                                linkPassword:consts.param.linkPassword,
                                signature:consts.param.signature,
                                userToken: $.cookie('userToken'),
                                content:picFile
                            },
                            dataType: 'json',
                            success: function (res) {
                                $(".temporaryFile").text(res.result);
                                operates.send();
                            }
                        }).fail(function (jqXHR, textStatus) {
                            hound.error('Request failed: ' + textStatus);
                        });
                    })
                });
            }
        })
    }
    //页面操作配置
    var operates = {
        send:function(){
            var imgUrl = $(".temporaryFile").text();
            var orderNo = $(".orderNo").find("a").text();
            var content;
            var isImage;
            if(imgUrl==""){
                isImage=2;
                content = $(".content").val();
            }else{
                isImage=1;
                content = imgUrl;
            }
            utils.ajaxSubmit(apis.mallPrivateMessage.create, {orderNo: orderNo,content:content,isImage:isImage}, function (data) {
                $(".temporaryFile").text("");
                utils.ajaxSubmit(apis.mallPrivateMessage.getByOrderNo, {orderNo: orderNo}, function (data) {
                    var getByIdData = {
                        orderArr:data.orderArr,
                        messageArr:data.messageArr
                    };
                    $.each(getByIdData.messageArr,function(i,n){
                        if(n.isImage==1){
                            var img_url = n.content;
                            var img = new Image();
                            img.src = img_url;
                            img.onload = function(){
                                if(img.width>1000){
                                    n.width = img.width*0.1;
                                    n.height = img.height*0.1;
                                    n.divHeight = img.height*0.1 + 20;
                                }else if(img.width<=1000 && img.width>500){
                                    n.width = img.width*0.2;
                                    n.height = img.height*0.2;
                                    n.divHeight = img.height*0.2 + 20;
                                }else if(img.width<=500 && img.width>200){
                                    n.width = img.width*0.5;
                                    n.height = img.height*0.5;
                                    n.divHeight = img.height*0.5 + 20;
                                }else if(img.width<=200 && img.width>0){
                                    n.width = img.width;
                                    n.height = img.height;
                                    n.divHeight = img.height + 20;
                                }else{
                                    n.width = 41;
                                    n.height = 41;
                                    n.divHeight = 61;
                                }
                            };
                            img.onload();
                        }
                    })
                    setTimeout(function(){
                        utils.renderModal('查看', template('modalDiv',getByIdData),'', 'md');
                        $('#dialogueBox').scrollTop($('#dialogueBox').prop("scrollHeight"));
                        uploadFile();
                    },300);
                });
            });
        },
        //查看
        look:function($this){
            var orderNo = $this.closest("tr").find("td").eq(0).find("a").text();
            utils.ajaxSubmit(apis.mallPrivateMessage.getByOrderNo, {orderNo: orderNo}, function (data) {
                var getByIdData = {
                    orderArr:data.orderArr,
                    messageArr:data.messageArr
                };
                $.each(getByIdData.messageArr,function(i,n){
                    if(n.isImage==1){
                        var img_url = n.content;
                        var img = new Image();
                        img.src = img_url;
                        img.onload = function(){
                            if(img.width>1000){
                                n.width = img.width*0.1;
                                n.height = img.height*0.1;
                                n.divHeight = img.height*0.1 + 20;
                            }else if(img.width<=1000 && img.width>500){
                                n.width = img.width*0.2;
                                n.height = img.height*0.2;
                                n.divHeight = img.height*0.2 + 20;
                            }else if(img.width<=500 && img.width>200){
                                n.width = img.width*0.5;
                                n.height = img.height*0.5;
                                n.divHeight = img.height*0.5 + 20;
                            }else if(img.width<=200 && img.width>0){
                                n.width = img.width;
                                n.height = img.height;
                                n.divHeight = img.height + 20;
                            }else{
                                n.width = 41;
                                n.height = 41;
                                n.divHeight = 61;
                            }
                        };
                        img.onload();
                    }
                });
                setTimeout(function(){
                    utils.renderModal('查看', template('modalDiv',getByIdData),'', 'md');
                    uploadFile();
                    setTimeout(function(){
                        $('#dialogueBox').scrollTop($('#dialogueBox').prop("scrollHeight"));
                    },200)
                },300);
            });
        },
        bigImg:function($this){
            var url = $this.attr("src");
            var width = parseInt($this.css("width"))*3;
            var height = parseInt($this.css("height"))*3;
            if(width>500 && height>500){
                width = parseInt($this.css("width"))*2;
                height = parseInt($this.css("height"))*2;
                $(".bigImg").css({width:width,height:height,display:"inline-block"});
            }else{
                $(".bigImg").css({width:width,height:height,display:"inline-block"});
            }
            $(".bigImg").attr("src",url);
            $(document).on("click",function(e){
                var target = $(e.target);
                if(!target.hasClass("smallImg")){
                    $(".bigImg").css({display:"none"});
                    $(".bigImg").attr("src","");
                }
            })
        },
        //退款申请
        refund:function($this){
            var id = $this.closest("tr").find("td").eq(0).find(".orderId").text();
            var orderNo = $this.closest("tr").find("td").eq(0).find("a").text();
            var amount = $this.closest("tr").find("td").eq(5).find("span").eq(0).text();
            var num = $this.closest("tr").find("td").eq(5).find("span").eq(1).text();
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
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        orderNo:'',
        userId:'',
        isJoinerUnreadMessage:''
    };
    var listDropDown = {
        statusText:'状态'
    };

    function loadData() {
        utils.ajaxSubmit(apis.mallPrivateMessage.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                if(n.requestMemo!=''){
                    n.materialButtonGroup = lookButtons ;
                }else{
                    n.materialButtonGroup = lookButtons ;
                }
                if(n.joinerUnreadMessageCount!=0){
                    n.isJoinerUnreadMessageText = "<span style='color:red'>未读</span>"
                }else if(n.joinerUnreadMessageCount==0){
                    n.isJoinerUnreadMessageText = "<span style='color:green'>已读</span>"
                }
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
        param.isJoinerUnreadMessage = 1;
        listDropDown.statusText = "未读";
    }else{
        param.isJoinerUnreadMessage = '';
        listDropDown.statusText = "状态";
    }


    loadData();
    utils.bindList($(document), operates);
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.isJoinerUnreadMessage = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
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
            loadData();
        }else if(selectSearchLabel=="用户昵称"){
            //用户昵称搜索
            if($("#searchCont").val()==''){
                param.userId = '';
            }else{
                param.userId = $("#searchCont").attr("data-id");
            }
            param.orderNo = '';
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
    $(document).on("click",function(){
        $('.ability-list').remove();
    })
});