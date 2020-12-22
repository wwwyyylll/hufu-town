require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    //按钮组集合
    var comButtons =
            '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>'+
            '<button class="btn btn-info" type="button" data-operate="look">查看</button>'
        ,
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">有效</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">无效</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //新增消息
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增消息', template('modalDiv',initialData), function(){
            var editerContent = $(".w-e-text");
            var editerImg = editerContent.find("img");
            //统计富文本编辑器中图片的数量
            if(editerImg.length>0){
                //图片src的长度大于500的需要上传，小于500的直接提交
                var submitImgArr = [];
                for(var i=0;i<editerImg.length;i++){
                    if(editerImg.eq(i).attr("src").length>500){
                        submitImgArr.push(editerImg.eq(i));
                    }
                }

                function func_digui(arry,len){
                    var temp;
                    for(i=0;i<len;i++){
                        if(i==0){
                            temp =arry[0];
                            arry.splice(i,1);
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
                                    content:temp.attr("src")
                                },
                                dataType: 'json',
                                success:function(data){
                                    temp.attr("src",data.result);
                                    len = arry.length;
                                    if(len ==0){
                                        return;
                                    }
                                    func_digui(arry,len);
                                }
                            });
                        }
                    }
                }
                if(submitImgArr.length!=0){
                    func_digui(submitImgArr,submitImgArr.length);
                    setTimeout(function(){
                        var canPost = true;
                        for(var i=0;i<editerImg.length;i++){
                            if(editerImg.eq(i).attr("src").length>500){
                                canPost = false;
                                break;
                            }
                        }
                        if(canPost){
                            if($("#visaPassportForm").valid()){
                                $("input[name=content]").val($(".w-e-text").html());
                                utils.ajaxSubmit(apis.message.create,$("#visaPassportForm").serialize(),function(data){
                                    hound.success("添加成功","",1000);
                                    utils.modal.modal('hide');
                                    param.pageNo = 1;
                                    loadData();
                                })
                            }
                        }
                    },1500);
                }else{
                    if($("#visaPassportForm").valid()){
                        $("input[name=content]").val($(".w-e-text").html());
                        utils.ajaxSubmit(apis.message.create,$("#visaPassportForm").serialize(),function(data){
                            hound.success("添加成功","",1000);
                            utils.modal.modal('hide');
                            param.pageNo = 1;
                            loadData();
                        })
                    }
                }
            }else{
                if($("#visaPassportForm").valid()){
                    $("input[name=content]").val($(".w-e-text").html());
                    utils.ajaxSubmit(apis.message.create,$("#visaPassportForm").serialize(),function(data){
                        hound.success("添加成功","",1000);
                        utils.modal.modal('hide');
                        param.pageNo = 1;
                        loadData();
                    })
                }
            }

        }, 'lg');
        var E = window.wangEditor;
        var editor = new E('#editor');
        editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
        editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
        editor.create();
        $(".w-e-text-container").css({"height":"300px"});
        $(".w-e-text-container").css({"z-index":"100"});
        $("#editor").find(".w-e-menu").css({"z-index":"101"});
    });

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.message.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('编辑消息', template('modalDiv', getByIdData), function(){
                    //if($("#visaPassportForm").valid()) {
                    //    utils.ajaxSubmit(apis.message.updateById, $("#visaPassportForm").serialize(), function (data) {
                    //        hound.success("编辑成功", "", 1000);
                    //        utils.modal.modal('hide');
                    //        loadData();
                    //    })
                    //}

                    var editerContent = $(".w-e-text");
                    var editerImg = editerContent.find("img");
                    //统计富文本编辑器中图片的数量
                    if(editerImg.length>0){
                        //图片src的长度大于500的需要上传，小于500的直接提交
                        var submitImgArr = [];
                        for(var i=0;i<editerImg.length;i++){
                            if(editerImg.eq(i).attr("src").length>500){
                                submitImgArr.push(editerImg.eq(i));
                            }
                        }

                        function func_digui(arry,len){
                            var temp;
                            for(i=0;i<len;i++){
                                if(i==0){
                                    temp =arry[0];
                                    arry.splice(i,1);
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
                                            content:temp.attr("src")
                                        },
                                        dataType: 'json',
                                        success:function(data){
                                            temp.attr("src",data.result);
                                            len = arry.length;
                                            if(len ==0){
                                                return;
                                            }
                                            func_digui(arry,len);
                                        }
                                    });
                                }
                            }
                        }
                        if(submitImgArr.length!=0){
                            func_digui(submitImgArr,submitImgArr.length);
                            setTimeout(function(){
                                var canPost = true;
                                for(var i=0;i<editerImg.length;i++){
                                    if(editerImg.eq(i).attr("src").length>500){
                                        canPost = false;
                                        break;
                                    }
                                }
                                if(canPost){
                                    if($("#visaPassportForm").valid()) {
                                        $("input[name=content]").val($(".w-e-text").html());
                                        utils.ajaxSubmit(apis.message.updateById, $("#visaPassportForm").serialize(), function (data) {
                                            hound.success("编辑成功", "", 1000);
                                            utils.modal.modal('hide');
                                            loadData();
                                        })
                                    }
                                }
                            },1500);
                        }else{
                            if($("#visaPassportForm").valid()) {
                                $("input[name=content]").val($(".w-e-text").html());
                                utils.ajaxSubmit(apis.message.updateById, $("#visaPassportForm").serialize(), function (data) {
                                    hound.success("编辑成功", "", 1000);
                                    utils.modal.modal('hide');
                                    loadData();
                                })
                            }
                        }
                    }else{
                        if($("#visaPassportForm").valid()) {
                            $("input[name=content]").val($(".w-e-text").html());
                            utils.ajaxSubmit(apis.message.updateById, $("#visaPassportForm").serialize(), function (data) {
                                hound.success("编辑成功", "", 1000);
                                utils.modal.modal('hide');
                                loadData();
                            })
                        }
                    }

                }, 'lg');
                var E = window.wangEditor;
                var editor = new E('#editor');
                editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
                editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
                editor.create();
                $(".w-e-text-container").css({"height":"300px"});
                //字符转化成代码显示
                var n = getByIdData.dataArr;
                n.content = n.content.replace(/&lt;/g,"<");
                n.content = n.content.replace(/&gt;/g,">");
                n.content = n.content.replace(/&quot;/g,'"');
                n.content = n.content.replace(/&amp;nbsp;/g," ");
                $(".w-e-text").html(getByIdData.dataArr.content);
                $(".w-e-text-container").css({"z-index":"100"});
                $("#editor").find(".w-e-menu").css({"z-index":"101"});
            });
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.message.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('查看消息', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
                var E = window.wangEditor;
                var editor = new E('#editor');
                editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
                editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
                editor.create();
                $(".w-e-text-container").css({"height":"300px"});
                //字符转化成代码显示
                var n = getByIdData.dataArr;
                n.content = n.content.replace(/&lt;/g,"<");
                n.content = n.content.replace(/&gt;/g,">");
                n.content = n.content.replace(/&quot;/g,'"');
                n.content = n.content.replace(/&amp;nbsp;/g," ");
                $(".w-e-text").html(getByIdData.dataArr.content);
                editor.$textElem.attr('contenteditable', false);
                $(".w-e-text-container").css({"z-index":"100"});
                $("#editor").find(".w-e-menu").css({"z-index":"101"});
            });
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.message.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.message.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        title:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.message.getLists, param, function (data) {
            //根据状态值显示对应的状态文字 + 显示 有效/无效按钮  置顶/取消置顶按钮
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary[n.status];
                (n.status=="1")? n.materialButtonGroup = comButtons + stopButton : n.materialButtonGroup = comButtons + startBouutn;
            });
            data.statusText = listDropDown.statusText;
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
        statusText:'状态',
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
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