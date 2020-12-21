require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    var $searchCont = $("#searchCont");
    var $batchImport = $("#batchImport");
    //按钮组集合
    var comButtons =
            '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>'+
            '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">上架</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">下架</button>',
        soldOutButton = '<button class="btn btn-warning" type="button" data-operate="soldOut">售罄</button>',
        delButton = '<button class="btn btn-danger" type="button" data-operate="del">删除</button>',
        handButton = '<button class="btn btn-success" type="button" data-operate="hand">手动同步</button>',
        autoButton = '<button class="btn btn-primary" type="button" data-operate="auto">自动同步</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    function getDateArr(){
        $("select[name=anchorId]").on("change",function(){
            var anchorId = $(this).val();
            $.cookie('anchorId',anchorId);
            if(anchorId!=''){
                var dateParam = {
                    pageNo: 1,
                    pageSize:50000,
                    status:'',
                    title:'',
                    date:'',
                    anchorId:anchorId
                };
                utils.ajaxSubmit(apis.anchorGoodsDate.getLists, dateParam, function (data) {
                    var optionArr = '<option value="">请选择</option>';
                    $.each(data.dataArr,function(i,n){
                        n.statusText = consts.status.goodsText[n.status];
                        optionArr+= "<option value='"+ n.id +"'>"+ n.date + "&nbsp;&nbsp;" + n.title + "【" + n.statusText + "】" +"</option>";
                    });
                    $("select[name=dateId]").html("");
                    $("select[name=dateId]").html(optionArr);
                })
            }else{
                $("select[name=dateId]").html('<option value="">请选择</option>');
            }
            $("input[name=sort]").val("1");
        });
        $("select[name=source]").on("change",function(){
            if($(this).val()==2){
                $("input[name=url]").attr("placeholder","请输入商品淘口令");
                $("input[name=url]").parent().find("span").text("商品淘口令");
            }else{
                $("input[name=url]").attr("placeholder","请输入商品链接");
                $("input[name=url]").parent().find("span").text("商品链接");
            }
        });
        $(".close").on("click",function(){
            $.cookie('anchorId',$("select[name=anchorId]").val());
            $.cookie('dateId',$("select[name=dateId]").val());
            utils.ajaxSubmit(apis.goods.getMaxSortByDateId,{anchorId:$.cookie('anchorId'),dateId:$.cookie('dateId')},function(data){
                $.cookie('sort',data);
            });
        });
        $(".modal-footer").find("button").eq(1).on("click",function(){
            $.cookie('anchorId',$("select[name=anchorId]").val());
            $.cookie('dateId',$("select[name=dateId]").val());
            utils.ajaxSubmit(apis.goods.getMaxSortByDateId,{anchorId:$.cookie('anchorId'),dateId:$.cookie('dateId')},function(data){
                $.cookie('sort',data);
            });
        })
    }

    var importFileData = '';
    $batchImport.on("click",function(){
        utils.renderModal('批量导入', template('batchImportModal',''), function(){
            utils.loading(true);
            //console.log(importFileData);
            //var importData = {
            //    source:$("select[name=source]").val(),
            //    file:importFileData
            //}
            //utils.ajaxSubmit(apis.goods.importFromExcel, importData, function (data) {
            //    hound.success("导入成功", "", 1000);
            //    utils.modal.modal('hide');
            //    loadData();
            //})

            var formFile = new FormData();
            formFile.append("c", "goods");
            formFile.append("a", "importFromExcel");
            formFile.append("linkUserName", consts.param.linkUserName);
            formFile.append("linkPassword", consts.param.linkPassword);
            formFile.append("signature", consts.param.signature);
            formFile.append("userToken", $.cookie('userToken'));
            formFile.append("source", $("select[name=source]").val());
            formFile.append("file", importFileData);

            $.ajax({
                type:'POST',
                url: "@@API",
                data: formFile,
                dataType: 'json',
                cache: false, //上传文件无需缓存
                processData: false, //用于对data参数进行序列化处理 这里必须false
                contentType: false, //必须
                success: function (res) {
                    utils.loading(false);
                    if(res.code==200){
                        hound.success(res.result,"",'').then(function(){
                            utils.modal.modal('hide');
                            loadData();
                        });
                    }else{
                        hound.error(res.message);
                    }
                }
            }).fail(function (jqXHR, textStatus) {
                utils.loading(false);
                hound.error('Request failed: ' + textStatus);
            });

        },'md');
        $('.uploadFileBatch').change(function () {
            if (window.FileReader) {
                var reader = new FileReader();
            } else {
                hound.alert("您的设备不支持图片预览功能，如需该功能请升级您的设备！");
            }
            $('.avatarUploadBatch').removeClass('btn-default').addClass('btn-primary').prop('disabled', false);
            var file = this.files[0];
            importFileData = file;
            console.log(importFileData);
            reader.onload = function(e) {
                $(".imgUrl").html('<i class="fa fa-folder mr-2"></i>' + file.name)
            };
            reader.readAsDataURL(file);

            //if(file){
            //    var url = URL.createObjectURL(file);
            //    var base64 = blobToDataURL(file,function(base64Url) {
            //        importFileData = base64Url;
            //    })
            //}
        });
    });

    //新增商品
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{
                anchorArr:{
                    id:$.cookie('anchorId')
                },
                dateArr:{
                    id:$.cookie('dateId')
                },
                categoryArr:{},
                itemArr:{},
                shopArr:{},
                sort:$.cookie('sort'),
                source:2
            },
            anchorArr:anchorArr,
            categoryArr:categoryArr,
            dateArr:dateArr
        };
        utils.renderModal('新增商品', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.loading(true);
                utils.ajaxSubmit(apis.goods.create,$("#visaPassportForm").serialize(),function(data){
                    $.cookie('anchorId',$("select[name=anchorId]").val());
                    $.cookie('dateId',$("select[name=dateId]").val());
                    utils.ajaxSubmit(apis.goods.getMaxSortByDateId,{anchorId:$.cookie('anchorId'),dateId:$.cookie('dateId')},function(data){
                        $.cookie('sort',data);
                    });
                    utils.loading(false);
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'lg');
        uploadFile();
        getDateArr();
        $("select[name=dateId]").on("change",function(){
            var anchorId = $("select[name=anchorId]").val();
            var dateId = $(this).val();
            $.cookie('dateId',dateId);
            utils.ajaxSubmit(apis.goods.getMaxSortByDateId,{anchorId:anchorId,dateId:dateId},function(data){
               $("input[name=sort]").val(data);
            })
        })
    });
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
                //获取图片dom
                $(".imgUrl").html('<i class="fa fa-image mr-2"></i>' + file.name)
                if(file.name!=""){
                    $(".avatarUpload").removeAttr("disabled");
                    $(".avatarUpload").removeClass("btn-default");
                    $(".avatarUpload").addClass("btn-primary");
                }
            };
            reader.readAsDataURL(file);

            if(file){
                var url = URL.createObjectURL(file);
                var base64 = blobToDataURL(file,function(base64Url) {
                    picFile = base64Url;
                })
            }
        })
        // 上传图片文件
        $(".uploadFile").find('.avatarUpload').click(function () {
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
                    $(".imgUrl").html("");
                    $(".imgUrl").html("<a target='_blank' href='"+ res.result +"'>图片预览</a>");
                    $("input[name=coverImg]").val(res.result);
                }
            }).fail(function (jqXHR, textStatus) {
                hound.error('Request failed: ' + textStatus);
            });
        });
    }
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

    function closeWindow(){
        $(".close").one("click",function(){
            utils.modal.modal('hide');
            loadData();
        });
        $(".secondCancel").one("click",function(){
            utils.modal.modal('hide');
            loadData();
        });
        var footerCancel = $(".modal-footer").find("button").eq(1);
        footerCancel.one("click",function(){
            utils.modal.modal('hide');
            loadData();
        });
    }
    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.goods.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data,
                    anchorArr:anchorArr,
                    categoryArr:categoryArr,
                    dateArr:dateArr
                };
                getByIdData.dataArr.statusText = consts.status.goods[getByIdData.dataArr.status];
                utils.renderModal('编辑商品', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.loading(true);
                        utils.ajaxSubmit(apis.goods.updateById, $("#visaPassportForm").serialize(), function (data) {
                            utils.loading(false);
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'lg');
                uploadFile();
                getDateArr();
                closeWindow();
                $("select[name=dateId]").on("change",function(){
                    var anchorId = $("select[name=anchorId]").val();
                    var dateId = $(this).val();
                    //$.cookie('dateId',dateId);
                    utils.ajaxSubmit(apis.goods.getMaxSortByDateId,{anchorId:anchorId,dateId:dateId},function(data){
                        $("input[name=sort]").val(data);
                    })
                })
            });
        },
        sameCancel:function($this){
            var footer = $(".modal-footer");
            //footer.find("button").eq(1).click();
            utils.modal.modal('hide');
            loadData();
        },
        sameUpdate:function($this){
            var footer = $(".modal-footer");
            footer.find("button").eq(0).click();
        },
        updateTaoMessage:function($this){
            var id = $("input[name=id]").val();
            var itemId = $("input[name=itemId]").val();
            utils.loading(true);
            utils.ajaxSubmit(apis.goods.syncById, {id: id,itemId:itemId}, function (data) {
                var getByIdData = {
                    dataArr:data,
                    anchorArr:anchorArr,
                    categoryArr:categoryArr,
                    dateArr:dateArr
                };
                getByIdData.dataArr.statusText = consts.status.goods[getByIdData.dataArr.status];
                utils.renderModal('编辑商品', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.loading(true);
                        utils.ajaxSubmit(apis.goods.updateById, $("#visaPassportForm").serialize(), function (data) {
                            utils.loading(false);
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'lg');
                uploadFile();
                getDateArr();
                closeWindow();
                utils.loading(false);
                hound.success("同步成功", "", 1000);
            });
        },
        updateTaoPwd:function($this){
            var id = $("input[name=id]").val();
            var itemId = $("input[name=itemId]").val();
            hound.confirm('确认更新淘口令吗?', '', function () {
                utils.ajaxSubmit(apis.goods.getPwdById, {itemId: itemId}, function (data) {
                    $(".pwd").val(data);
                });
            });
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.goods.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data,
                    anchorArr:anchorArr,
                    categoryArr:categoryArr,
                    dateArr:dateArr
                };
                getByIdData.dataArr.statusText = consts.status.goods[getByIdData.dataArr.status];
                utils.renderModal('查看商品', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认下架吗?', '', function () {
                utils.ajaxSubmit(apis.goods.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认上架吗?', '', function () {
                utils.ajaxSubmit(apis.goods.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //售罄
        soldOut:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认售罄吗?', '', function () {
                utils.ajaxSubmit(apis.goods.soldOutById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //删除
        del:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认删除吗?', '', function () {
                utils.ajaxSubmit(apis.goods.delById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        hand:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认手动同步吗?', '', function () {
                utils.ajaxSubmit(apis.goods.handSyncById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        auto:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认自动同步吗?', '', function () {
                utils.ajaxSubmit(apis.goods.autoSyncById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        title:'',
        anchorId:'',
        source:'',
        categoryId:'',
        dateId:'',
        date:'',
        id:'',
        syncWay:'',
        externalId:''
    };
    var listDropDown = {
        anchorText:'主播',
        categoryText:'分类',
        sourceText:'来源',
        statusText:'状态',
        dateText:'带货日期',
        syncWayText:'同步方式'
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
            pageSize:50000,
            title:'',
            status:'',
            orderBy:1
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
            $.each(dateArr,function(i,n){
                n.statusText = consts.status.goodsText[n.status];
            })
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.goods.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.goods[n.status];
                n.sourceText = consts.status.source[n.source];
                n.syncWayText = consts.status.syncWay[n.itemArr.syncWay];
                if(n.status=="1"){
                    n.materialButtonGroup = comButtons + stopButton + delButton;
                }else if(n.status=="2"){
                    n.materialButtonGroup = comButtons + startBouutn + delButton;
                }else if(n.status=="3"){
                    n.materialButtonGroup = comButtons + startBouutn + stopButton + delButton;
                }
                if(n.itemArr.syncWay=="1"){
                    n.materialButtonGroup = n.materialButtonGroup + autoButton;
                }else{
                    n.materialButtonGroup = n.materialButtonGroup + handButton;
                }
            });
            data.anchorArr = anchorArr;
            data.categoryArr = categoryArr;
            data.dateArr = dateArr;
            data.anchorText = listDropDown.anchorText;
            data.categoryText = listDropDown.categoryText;
            data.sourceText = listDropDown.sourceText;
            data.statusText = listDropDown.statusText;
            data.dateText = listDropDown.dateText;
            data.syncWayText = listDropDown.syncWayText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            $sampleTable.find('#date').val(param.date);
            copyText();
        });
    }
    // 页面首次加载列表数据
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var n3 = loc.indexOf("?");//取得?号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    if(loc.substr(n3).indexOf("dateId")!='-1'){
        var urlParam = id.split("=");
        param.dateId = urlParam[0];
    }else{
        var urlParam = id.split("=");
        if(urlParam[0]==1){
            param.status = 2;
            listDropDown.statusText = "下架";
        }else{
            param.status = '';
            listDropDown.statusText = "状态";
        }
    }

    getDownLists();
    setTimeout(function(){
        loadData();
    },100);
    utils.bindList($(document), operates);

    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropAnchorOptions a[data-id]', function () {
        param.anchorId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.anchorText = "主播" : listDropDown.anchorText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropCategoryOptions a[data-id]', function () {
        param.categoryId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.categoryText = "分类" : listDropDown.categoryText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropSourceOptions a[data-id]', function () {
        param.source = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.sourceText = "来源" : listDropDown.sourceText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropDateOptions a[data-id]', function () {
        param.dateId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.dateText = "带货日期" : listDropDown.dateText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropSyncWayOptions a[data-id]', function () {
        param.syncWay = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.syncWayText = "同步方式" : listDropDown.syncWayText = $(this).text();
        param.pageNo = 1;
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
        var selectSearchLabel = $("#selectsearchlabel").text();
        if(selectSearchLabel=="商品ID"){
            param.id = $("#searchCont").val();
            param.title = '';
            param.externalId = '';
            loadData();
        }else if(selectSearchLabel=="淘宝商品ID"){
            param.id = '';
            param.title = '';
            param.externalId = $("#searchCont").val();
            loadData();
        }else if(selectSearchLabel=="标题"){
            param.id = '';
            param.externalId = '';
            param.title = $("#searchCont").val();
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});