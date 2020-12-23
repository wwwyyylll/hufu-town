require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    //按钮组集合
    var comButtons =
            '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>'+
            '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">有效</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">无效</button>',
        planButton = '<button class="btn btn-success" type="button" data-operate="plan">优化方案</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //上传图片文件
    function blobToDataURL(blob,cb) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            var base64 = evt.target.result;
            cb(base64)
        };
        reader.readAsDataURL(blob);
    }
    function uploadFile(){
        //选择图片文件
        $(".uploadImg").change(function(){
            var uploadFile = $(this).closest(".uploadFile");
            //判断是否支持FileReader
            if (window.FileReader) {
                var reader = new FileReader();
            } else {
                hound.alert("您的设备不支持图片预览功能，如需该功能请升级您的设备！");
            }
            var file = this.files[0];
            reader.onload = function(e) {
                //获取图片dom
                uploadFile.find(".imgUrl").html('<i class="fa fa-image mr-2"></i>' + file.name)
                if(file.name!=""){
                    uploadFile.find(".avatarUpload").removeAttr("disabled");
                    uploadFile.find(".avatarUpload").removeClass("btn-default");
                    uploadFile.find(".avatarUpload").addClass("btn-primary");
                }
            };
            reader.readAsDataURL(file);

            if(file){
                var url = URL.createObjectURL(file);
                var base64 = blobToDataURL(file,function(base64Url) {
                    uploadFile.find(".temporaryFile").text(base64Url);
                })
            }
        })
        // 上传图片文件
        $('.avatarUpload').click(function () {
            var uploadFile = $(this).closest(".uploadFile");
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
                    content:uploadFile.find(".temporaryFile").text()
                },
                dataType: 'json',
                success: function (res) {
                    uploadFile.find(".imgUrl").html("");
                    uploadFile.find(".imgUrl").html("<a target='_blank' href='"+ res.result +"'><img style='display: inline-block;width: 45px;height: 20px' src='"+ res.result +"'></a>");
                    uploadFile.find("input[type=hidden]").val(res.result);
                }
            }).fail(function (jqXHR, textStatus) {
                hound.error('Request failed: ' + textStatus);
            });
        });
    }

    function parentIdChange(){
        $("select[name=parentId]").on("change",function(){
            if($(this).val()!=0){
                $("#tipsDiv").show();
            }else{
                $("#tipsDiv").hide();
            }
        })
    }

    //新增分类
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{},
            parentArr:parentArr
        };
        utils.renderModal('新增分类', template('modalDiv',initialData), function(){
            //if($("#visaPassportForm").valid()){
            //    utils.loading(true);
            //    utils.ajaxSubmit(apis.category.create,$("#visaPassportForm").serialize(),function(data){
            //        utils.loading(false);
            //        hound.success("添加成功","",1000);
            //        utils.modal.modal('hide');
            //        param.pageNo = 1;
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
                            if($("#visaPassportForm").valid()){
                                $("input[name=tips]").val($(".w-e-text").html());
                                utils.ajaxSubmit(apis.category.create,$("#visaPassportForm").serialize(),function(data){
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
                        $("input[name=tips]").val($(".w-e-text").html());
                        utils.ajaxSubmit(apis.category.create,$("#visaPassportForm").serialize(),function(data){
                            hound.success("添加成功","",1000);
                            utils.modal.modal('hide');
                            param.pageNo = 1;
                            loadData();
                        })
                    }
                }
            }else{
                if($("#visaPassportForm").valid()){
                    $("input[name=tips]").val($(".w-e-text").html());
                    utils.ajaxSubmit(apis.category.create,$("#visaPassportForm").serialize(),function(data){
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
        uploadFile();
        parentIdChange();
    });

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.category.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data,
                    parentArr:parentArr
                };
                utils.renderModal('编辑分类', template('modalDiv', getByIdData), function(){
                    //if($("#visaPassportForm").valid()) {
                    //    utils.loading(true);
                    //    utils.ajaxSubmit(apis.category.updateById, $("#visaPassportForm").serialize(), function (data) {
                    //        utils.loading(false);
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
                                        $("input[name=tips]").val($(".w-e-text").html());
                                        utils.ajaxSubmit(apis.category.updateById, $("#visaPassportForm").serialize(), function (data) {
                                            hound.success("编辑成功", "", 1000);
                                            utils.modal.modal('hide');
                                            loadData();
                                        })
                                    }
                                }
                            },1500);
                        }else{
                            if($("#visaPassportForm").valid()) {
                                $("input[name=tips]").val($(".w-e-text").html());
                                utils.ajaxSubmit(apis.category.updateById, $("#visaPassportForm").serialize(), function (data) {
                                    hound.success("编辑成功", "", 1000);
                                    utils.modal.modal('hide');
                                    loadData();
                                })
                            }
                        }
                    }else{
                        if($("#visaPassportForm").valid()) {
                            $("input[name=tips]").val($(".w-e-text").html());
                            utils.ajaxSubmit(apis.category.updateById, $("#visaPassportForm").serialize(), function (data) {
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
                if(getByIdData.dataArr.tips){
                    //字符转化成代码显示
                    var n = getByIdData.dataArr;
                    n.tips = n.tips.replace(/&lt;/g,"<");
                    n.tips = n.tips.replace(/&gt;/g,">");
                    n.tips = n.tips.replace(/&quot;/g,'"');
                    n.tips = n.tips.replace(/&amp;nbsp;/g," ");
                }
                $(".w-e-text").html(getByIdData.dataArr.tips);
                $(".w-e-text-container").css({"z-index":"100"});
                $("#editor").find(".w-e-menu").css({"z-index":"101"});
                uploadFile();
                parentIdChange();
            });
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.category.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data,
                    parentArr:parentArr
                };
                utils.renderModal('查看分类', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
                var E = window.wangEditor;
                var editor = new E('#editor');
                editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
                editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
                editor.create();
                $(".w-e-text-container").css({"height":"300px"});
                if(getByIdData.dataArr.tips){
                    //字符转化成代码显示
                    var n = getByIdData.dataArr;
                    n.tips = n.tips.replace(/&lt;/g,"<");
                    n.tips = n.tips.replace(/&gt;/g,">");
                    n.tips = n.tips.replace(/&quot;/g,'"');
                    n.tips = n.tips.replace(/&amp;nbsp;/g," ");
                }
                $(".w-e-text").html(getByIdData.dataArr.tips);
                editor.$textElem.attr('contenteditable', false);
                $(".w-e-text-container").css({"z-index":"100"});
                $("#editor").find(".w-e-menu").css({"z-index":"101"});
            });
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.category.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.category.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //优化方案
        plan:function($this){
            var id = $this.closest("tr").attr("data-id");
            var parentCategoryTitle = $this.closest("tr").find("td").eq(3).text();
            var categoryTitle = $this.closest("tr").find("td").eq(1).text();
            window.open("@@HOSTview/mall/categoryPlan.html?id=" + id + "&parentCategoryTitle=" + parentCategoryTitle + "&categoryTitle=" + categoryTitle);
        }
    };

    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var urlParam = id.split("=");
    var categoryTitle = '';
    if(urlParam[0].indexOf("html")!='-1'){
        categoryTitle = '';
    }else{
        categoryTitle = urlParam[0];
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        title:categoryTitle,
        status:'',
        parentId:''
    };

    var parentArr;
    function loadData() {
        utils.ajaxSubmit(apis.category.getParentCategoryLists, '', function (data) {
            parentArr = data;
            utils.ajaxSubmit(apis.category.getLists, param, function (data) {
                $.each(data.dataArr,function(i,n){
                    n.statusText = consts.status.ordinary[n.status];
                    (n.status=="1")? n.materialButtonGroup = comButtons + stopButton : n.materialButtonGroup = comButtons + startBouutn;
                    (n.showPlan=='yes')?n.materialButtonGroup = n.materialButtonGroup + planButton :n.materialButtonGroup = n.materialButtonGroup ;
                });
                data.statusText = listDropDown.statusText;
                data.parentText = listDropDown.parentText;
                data.parentArr = parentArr;
                $sampleTable.html(template('visaListItem', data));
                utils.bindPagination($visaPagination, param, loadData);
                $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            });
        })
    }
    // 页面首次加载列表数据
    loadData();

    utils.bindList($(document), operates);
    var listDropDown = {
        statusText:'状态',
        parentText:'父级分类'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropParentOptions a[data-id]', function () {
        param.parentId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.parentText = "父级分类" : listDropDown.parentText = $(this).text();
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