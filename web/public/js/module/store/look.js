require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var initialData = {
        deliveryTimeArr:{},
        isExpressFeeSuperpositionArr: {},
        tagArr:{},
        exoressArr:{},
        categoryArr:{},
        parentCategoryArr:{},
        brandArr:{}
    };
    //页面操作配置
    var operates = {
        backList:function(){
            window.close();
        },
        addGoods:function(){
            var editerContent = $(".w-e-text");
            var editerImg = editerContent.find("p").find("img");
            if(editerImg.length>0){
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
                        content:editerImg.attr("src")
                    },
                    dataType: 'json',
                    success: function (res) {
                    }
                }).fail(function (jqXHR, textStatus) {
                    hound.error('Request failed: ' + textStatus);
                });
            }
            $("input[name=details]").val($(".w-e-text").html());
            utils.reInputName($(".specItem"));
            utils.reInputName($(".imgItem"));
            utils.ajaxSubmit(apis.mallGoods.create,$("#goodsForm").serialize(),function(data){
                hound.success("添加成功","",1000);
                utils.modal.modal('hide');
            })
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
            status:''
        };
        utils.ajaxSubmit(apis.mallTag.getLists, labelParam, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary1[n.status];
            });
            initialData.tagArr = data.dataArr;
        });
        var exoressPaream = {
            pageNo: 1,
            pageSize:10000,
            title:'',
            status:''
        };
        utils.ajaxSubmit(apis.mallExpressFee.getLists, exoressPaream, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary1[n.status];
            });
            initialData.exoressArr = data.dataArr;
        });
        var categoryParam = {
            pageNo: 1,
            pageSize:10000,
            title:'',
            status:'',
            orderBy:'',
            parentId:''
        };
        utils.ajaxSubmit(apis.mallCategory.getLists, categoryParam, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary1[n.status];
            });
            initialData.categoryArr = data.dataArr;
        });

        utils.ajaxSubmit(apis.mallCategory.getParentCategoryLists, '', function (data) {
            $.each(data,function(i,n){
                n.statusText = consts.status.ordinary1[n.status];
            });
            initialData.parentCategoryArr = data;
        });

        var brandParam = {
            pageNo: 1,
            pageSize:10000,
            status:'',
            title:''
        };
        utils.ajaxSubmit(apis.mallBrand.getLists, brandParam, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary1[n.status];
            });
            initialData.brandArr = data.dataArr;
        });
    }
    utils.bindList($(document), operates);
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
    //getConstsLists();
    function getGoodsData(){
        //getById获取数据
        var loc = location.href;
        var n1 = loc.length;//地址的总长度
        var n2 = loc.indexOf("=");//取得=号的位置
        var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
        var urlParam = id.split("=");
        utils.ajaxSubmit(apis.mallGoods.getById, {id:urlParam[0]}, function (data) {
            var getByIdData = {
                categoryArr:initialData.categoryArr,
                parentCategoryArr:initialData.parentCategoryArr,
                brandArr:initialData.brandArr,
                exoressArr:initialData.exoressArr,
                tagArr:initialData.tagArr,
                deliveryTimeArr:initialData.deliveryTimeArr,
                isExpressFeeSuperpositionArr:initialData.isExpressFeeSuperpositionArr,
                dataArr:data.dataArr,
                imagesArr:data.imagesArr,
                specsArr:data.specsArr
            };
            getByIdData.dataArr.statusText = consts.status.goodsStatus[getByIdData.dataArr.status];
            getByIdData.dataArr.previewUrl = data.previewUrl;
            $("#goodsForm").html(template('goodsFormContent', getByIdData));
            $("#tabContent1").html(template('specList', getByIdData));
            $("#tabContent2").html(template('imgList', getByIdData));

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
            var E = window.wangEditor;
            var editor = new E('#editor');
            editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
            editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
            editor.create();
            $(".w-e-text-container").css({"height":"500px"});
            $(".w-e-text").html(getByIdData.dataArr.details);
            editor.$textElem.attr('contenteditable', false);
            $("#goodsForm").append($("fieldset").prop('disabled', true));
            $(".saveButton").remove();

            $(".supplierId").on("input",function(){
                var param = {
                    pageNo: 1,
                    pageSize:50,
                    name:$(".supplierId").val(),
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
                        $(".supplierId").closest('.economy-wards').append($abilityList);

                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".supplierId").val(data.dataArr[$index].name);
                            $(".supplierId").attr("data-id",data.dataArr[$index].id);
                        });
                    }
                });
            });
            $(".categoryId").on("input",function(){
                var param = {
                    pageNo: 1,
                    pageSize:50,
                    name:$(".categoryId").val(),
                    status:''
                };
                utils.ajaxSubmit(apis.mallCategory.getLists, param, function (data) {
                    if(data.dataArr.length!=0){
                        var $economyAbilityItem = '';
                        $.each(data.dataArr, function (i, v) {
                            $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.name +'</div>'
                        })
                        $('.ability-list').remove();
                        var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                        $(".categoryId").closest('.economy-wards').append($abilityList);

                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".categoryId").val(data.dataArr[$index].name);
                            $(".categoryId").attr("data-id",data.dataArr[$index].id);
                        });
                    }
                });
            });
            copyText();
        });
    }
    /*setTimeout(function(){
        //getById获取数据
        var loc = location.href;
        var n1 = loc.length;//地址的总长度
        var n2 = loc.indexOf("=");//取得=号的位置
        var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
        var urlParam = id.split("=");
        utils.ajaxSubmit(apis.mallGoods.getById, {id:urlParam[0]}, function (data) {
            var getByIdData = {
                categoryArr:initialData.categoryArr,
                parentCategoryArr:initialData.parentCategoryArr,
                brandArr:initialData.brandArr,
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
            var E = window.wangEditor;
            var editor = new E('#editor');
            editor.customConfig.showLinkImg = false;         // 隐藏“网络图片”tab
            editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
            editor.create();
            $(".w-e-text-container").css({"height":"500px"});
            $(".w-e-text").html(getByIdData.dataArr.details);
            editor.$textElem.attr('contenteditable', false);
            $("#goodsForm").append($("fieldset").prop('disabled', true));
            $(".saveButton").remove();

            $(".supplierId").on("input",function(){
                var param = {
                    pageNo: 1,
                    pageSize:50,
                    name:$(".supplierId").val(),
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
                        $(".supplierId").closest('.economy-wards').append($abilityList);

                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".supplierId").val(data.dataArr[$index].name);
                            $(".supplierId").attr("data-id",data.dataArr[$index].id);
                        });
                    }
                });
            });
            $(".categoryId").on("input",function(){
                var param = {
                    pageNo: 1,
                    pageSize:50,
                    name:$(".categoryId").val(),
                    status:''
                };
                utils.ajaxSubmit(apis.mallCategory.getLists, param, function (data) {
                    if(data.dataArr.length!=0){
                        var $economyAbilityItem = '';
                        $.each(data.dataArr, function (i, v) {
                            $economyAbilityItem += '<div data-id="'+ v.id +'" class="economy-ability-item">'+ v.name +'</div>'
                        })
                        $('.ability-list').remove();
                        var $abilityList = '<div class="ability-list">'+ $economyAbilityItem +'</div>';
                        $(".categoryId").closest('.economy-wards').append($abilityList);

                        $('.economy-ability-item').click(function(){
                            $('.ability-list').remove();
                            var $index = $(this).index();
                            $(".categoryId").val(data.dataArr[$index].name);
                            $(".categoryId").attr("data-id",data.dataArr[$index].id);
                        });
                    }
                });
            });
            copyText();
        });
    },100);*/
    $.when(
        getConstsLists()
    ).done(function(){
            setTimeout(function(){
                getGoodsData();
            },300)
        }).fail(function(){
            hound.error("ERROR", "", 1000);
        });
});