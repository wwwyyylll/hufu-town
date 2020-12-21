require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var initialData = {
        dataArr:{
            isExpressFeeSuperposition:"2"
        },
        deliveryTimeArr:{},
        isExpressFeeSuperpositionArr: {},
        tagArr:{},
        exoressArr:{}
    };
    //上传图片文件
    function blobToDataURL(blob,cb) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            var base64 = evt.target.result
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
                    //http://lnhs.go-trip.com.cn/file/images/20200616/226b4d02a0c25d56fdf0cd83363eb9e5.jpeg
                    //http://lnhs.go-trip.com.cn/file/images/20200616/3cb2cefcee8b76143d022e3135beee77.jpeg
                }
            }).fail(function (jqXHR, textStatus) {
                hound.error('Request failed: ' + textStatus);
            });
        });
    }
    //页面操作配置
    var operates = {
        addSpec:function(){
            var data = {
                dataArr:{
                    isExpressFeeSuperposition:"2"
                },
                deliveryTimeArr:initialData.deliveryTimeArr,
                isExpressFeeSuperpositionArr:initialData.isExpressFeeSuperpositionArr,
                tagArr:initialData.tagArr,
                exoressArr:initialData.exoressArr,
                specsArr:{},
            };
            $(".specDiv").append(template('specItem', data));
            var specNumber = $(".specNumber");
            for(var i=0;i<specNumber.length;i++){
                specNumber.eq(i).text(i+1);
            }
            uploadFile();
        },
        delSpec:function($this){
            hound.confirm('确认删除吗?', '', function () {
                var specItem = $this.closest(".specItem");
                //编辑页面要统计已有ID的选项 delItemArr[0][id]
                var delId = specItem.find(".specItemId").val();
                if(delId!=""){
                    var delSpecArr = $("#delSpecArr");
                    delSpecArr.append('<div class="delSpecSingle"><input type="hidden" name="delSpecsArr[][id]" value="'+ delId +'" class="form-control"></div');
                }
                specItem.remove();
                var specNumber = $(".specNumber");
                for(var i=0;i<specNumber.length;i++){
                    specNumber.eq(i).text(i+1);
                }
            });
        },
        addImg:function(){
            var data = {
                dataArr:{}
            };
            $(".imgDiv").append(template('imgItem', data));
            var imgNumber = $(".imgNumber");
            for(var i=0;i<imgNumber.length;i++){
                imgNumber.eq(i).text(i+1);
            }
            uploadFile();
        },
        delImg:function($this){
            hound.confirm('确认删除吗?', '', function () {
                var imgItem = $this.closest(".imgItem");
                //编辑页面要统计已有ID的选项 delItemArr[0][id]
                var delId = imgItem.find(".imgItemId").val();
                if(delId!=""){
                    var delImgArr = $("#delImgArr");
                    delImgArr.append('<div class="delImgSingle"><input type="hidden" name="delImageArr[][id]" value="'+ delId +'" class="form-control"></div');
                }
                imgItem.remove();
                var imgNumber = $(".imgNumber");
                for(var i=0;i<imgNumber.length;i++){
                    imgNumber.eq(i).text(i+1);
                }
            });
        },
        addGoods:function(){
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
                            if($("#goodsForm").valid()){
                                $("input[name=details]").val($(".w-e-text").html());
                                utils.reInputName($(".specItem"));
                                utils.reInputName($(".imgItem"));
                                utils.reInputName($(".delSpecSingle"));
                                utils.reInputName($(".delImgSingle"));
                                utils.ajaxSubmit(apis.mallGoods.updateById,$("#goodsForm").serialize(),function(data){
                                    hound.success("编辑成功","",'').then(function(){
                                        getGoodsData();
                                    });
                                })
                            }
                        }
                    },1500);
                }else{
                    if($("#goodsForm").valid()){
                        $("input[name=details]").val($(".w-e-text").html());
                        utils.reInputName($(".specItem"));
                        utils.reInputName($(".imgItem"));
                        utils.reInputName($(".delSpecSingle"));
                        utils.reInputName($(".delImgSingle"));
                        utils.ajaxSubmit(apis.mallGoods.updateById,$("#goodsForm").serialize(),function(data){
                            hound.success("编辑成功","",'').then(function(){
                                getGoodsData();
                            });
                        })
                    }
                }
            }else{
                if($("#goodsForm").valid()){
                    $("input[name=details]").val($(".w-e-text").html());
                    utils.reInputName($(".specItem"));
                    utils.reInputName($(".imgItem"));
                    utils.reInputName($(".delSpecSingle"));
                    utils.reInputName($(".delImgSingle"));
                    utils.ajaxSubmit(apis.mallGoods.updateById,$("#goodsForm").serialize(),function(data){
                        hound.success("编辑成功","",'').then(function(){
                            getGoodsData();
                        });
                    })
                }
            }
        }
    }

    function getConstsLists(){
        utils.ajaxSubmit(apis.mallGoods.getConstLists, '', function (data) {
            initialData.deliveryTimeArr = data.deliveryTimeArr;
            initialData.isExpressFeeSuperpositionArr = data.isExpressFeeSuperpositionArr;
        });
        var labelParam = {
            pageNo: 1,
            pageSize:10000,
            name:'',
            status:'',
        };
        utils.ajaxSubmit(apis.mallTag.getLists, labelParam, function (data) {
            initialData.tagArr = data.dataArr;
        });
        var exoressPaream = {
            pageNo: 1,
            pageSize:10000,
            title:'',
            status:''
        };
        utils.ajaxSubmit(apis.mallExpressFee.getLists, exoressPaream, function (data) {
            initialData.exoressArr = data.dataArr;
        });
    }
    utils.bindList($(document), operates);

    $(document).on("click",function(){
        $('.ability-list').remove();
    });
    // 页面首次加载列表数据
    function copyText(){
        var btns = document.querySelectorAll('.copyBtn');
        var clipboard = new ClipboardJS(btns);
        clipboard.on('success', function(e) {
            hound.success("商品地址复制成功", "", 1000);
        });
        clipboard.on('error', function(e) {
            hound.error("商品地址复制失败", "", 1000);
        });
    }
    getConstsLists();
    function getGoodsData(){
        //getById获取数据
        var loc = location.href;
        var n1 = loc.length;//地址的总长度
        var n2 = loc.indexOf("=");//取得=号的位置
        var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
        var urlParam = id.split("=");
        utils.ajaxSubmit(apis.mallGoods.getById, {id:urlParam[0]}, function (data) {
            var getByIdData = {
                exoressArr:initialData.exoressArr,
                tagArr:initialData.tagArr,
                deliveryTimeArr:initialData.deliveryTimeArr,
                isExpressFeeSuperpositionArr:initialData.isExpressFeeSuperpositionArr,
                dataArr:data.dataArr,
                imagesArr:data.imagesArr,
                specsArr:data.specsArr,
            };
            getByIdData.dataArr.statusText = consts.status.goodsStatus[getByIdData.dataArr.status];
            getByIdData.dataArr.previewUrl = data.previewUrl;
            $("#goodsForm").html(template('goodsFormContent', getByIdData));
            $("#tabContent1").html(template('specList', getByIdData));
            $("#tabContent2").html(template('imgList', getByIdData));

            $(document).ready(function () {
                $(".sortable-list").sortable({
                    connectWith: ".connectList"
                }).disableSelection();
            });
            $("#headerTab1").on("click",function(){
                $("#tabContent1").show();
                $("#tabContent2").hide();
                $("#tabContent3").hide();
                $(this).css({color:"orange"});
                $("#headerTab2").css({color:"#555555"});
                $("#headerTab3").css({color:"#555555"});
            });
            $("#headerTab2").on("click",function(){
                $("#tabContent2").show();
                $("#tabContent1").hide();
                $("#tabContent3").hide();
                $(this).css({color:"orange"});
                $("#headerTab1").css({color:"#555555"});
                $("#headerTab3").css({color:"#555555"});
                $(document).mouseup(function(){
                    var sort = $(".agile-list li").find(".sort");
                    setTimeout(function(){
                        var sort=$(".agile-list li").find(".sort");
                        for(var j=0;j<sort.length;j++){
                            sort.eq(j).val(j+1)
                        }
                    },50)
                });
            });
            $("#headerTab3").on("click",function(){
                $("#tabContent3").show();
                $("#tabContent1").hide();
                $("#tabContent2").hide();
                $(this).css({color:"orange"});
                $("#headerTab1").css({color:"#555555"});
                $("#headerTab2").css({color:"#555555"});
            });
            uploadFile();
            var E = window.wangEditor;
            var editor = new E('#editor');
            editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
            editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
            editor.create();
            $(".w-e-text-container").css({"height":"500px"});
            $(".w-e-text").html(getByIdData.dataArr.details);
            $(".w-e-text-container").css({"z-index":"100"});
            $("#editor").find(".w-e-menu").css({"z-index":"101"});

            $(".supplierName").on("input",function(){
                var param = {
                    pageNo: 1,
                    pageSize:50,
                    name:$(".supplierName").val(),
                    status:'',
                    source:'',
                    accountType:''
                };
                utils.ajaxSubmit(apis.mallSupplier.getLists, param, function (data) {
                    if(data.dataArr.length!=0){
                        var $economyAbilityItem = '';
                        $.each(data.dataArr, function (i, v) {
                            $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.name +'</div>'
                        })
                        $('.ability-list').remove();
                        var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                        $(".supplierName").closest('.economy-wards').append($abilityList);

                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".supplierName").val(data.dataArr[$index].name);
                            $(".supplierId").val(data.dataArr[$index].id);
                        });
                    }
                });
            });
            $(".categoryName").on("click",function(){
                utils.ajaxSubmit(apis.mallCategory.getCategoryLists, '', function (data) {
                    if(data.length!=0){
                        $('.ability-list').remove();
                        var $abilityList = '<div class="ability-list"></div>';
                        $(".categoryName").closest('.economy-wards').append($abilityList);
                        var list = $(".categoryName").closest('.economy-wards').find(".ability-list");
                        for(var i=0;i<data.length;i++){
                            list.append('<div style="line-height:30px" class="economy-ability-item1">'+ "<div data-id='"+ data[i].parentArr.id +"' class='economy-ability-item'>" + "*&nbsp;" + data[i].parentArr.name + '</div>' + '</div>');
                            for(var j=0;j<data[i].childArr.length;j++){
                                $(".economy-ability-item1").eq(i).append("<ul style='margin-bottom: 0;padding-left: 25px'>" +
                                    "<li style='list-style:none' data-id='"+ data[i].childArr[j].id +"' class='economy-ability-item'>"+ "**&nbsp;" + data[i].childArr[j].name +"</li>"+
                                    "</ul>");
                            }
                        }
                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".categoryName").val($(this).text());
                            $(".categoryId").val($(this).attr("data-id"));
                        });
                    }
                });
            });
            copyText();
        });
    }
    setTimeout(function(){
        getGoodsData();
    },100);
});