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
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">上架</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">下架</button>',
        delButton = '<button class="btn btn-danger" type="button" data-operate="delGoods">删除</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //新增商品
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        initialData.dataArr.parentArr = parentArr;
        initialData.dataArr.showTypeArr = showTypeArr;
        utils.renderModal('新增商品', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.mallGoods.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    loadData();
                })
            }
        }, 'xl');
        uploadFile();
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
                    $("input[name=pic]").val(res.result);
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
    //页面操作配置
    var operates = {
        add:function(){
            //window.location.href = "@@HOSTview/store/add.html";
            window.open("@@HOSTview/store/add.html");
        },
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            //window.location.href = "@@HOSTview/store/edit.html?id=" + id;
            window.open("@@HOSTview/store/edit.html?id=" + id);
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            //window.location.href = "@@HOSTview/store/look.html?id=" + id;
            window.open("@@HOSTview/store/look.html?id=" + id);
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认下架吗?', '', function () {
                utils.ajaxSubmit(apis.mallGoods.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认上架吗?', '', function () {
                utils.ajaxSubmit(apis.mallGoods.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //删除
        delGoods:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认删除吗?', '', function () {
                utils.ajaxSubmit(apis.mallGoods.delById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        title:'',
        status:'',
        supplierId:'',
        categoryId:'',
        parentCategoryId:'',
        tagId:'',
        willExpire:'',
        id:''
    };

    var parentCategoryArr;
    var categoryArr;
    var supplierArr;
    var tagArr;
    function getDownLists(){
        utils.ajaxSubmit(apis.mallCategory.getParentCategoryLists, '', function (data) {
            parentCategoryArr = data;
        });
        var categoryParam = {
            pageNo: 1,
            pageSize:10000,
            title:'',
            status:'',
            orderBy:''
        };
        utils.ajaxSubmit(apis.mallCategory.getLists, categoryParam, function (data) {
            categoryArr = data.dataArr;
        });
        var supplierParam = {
            pageNo: 1,
            pageSize:50000,
            name:'',
            status:'',
            source:'',
            accountType:''
        };
        utils.ajaxSubmit(apis.mallSupplier.getLists, supplierParam, function (data) {
            supplierArr = data.dataArr;
        });
        var labelParam = {
            pageNo: 1,
            pageSize:10000,
            name:'',
            status:''
        };
        utils.ajaxSubmit(apis.mallTag.getLists, labelParam, function (data) {
            tagArr = data.dataArr;
        });
    }
    function loadData() {
        utils.ajaxSubmit(apis.mallGoods.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.goodsStatus[n.status];
                (n.status=="1")? n.materialButtonGroup = comButtons + '<button data-clipboard-text="'+ n.previewUrl +'" class="btn btn-info copyBtn" type="button">预览</button>' + stopButton : n.materialButtonGroup = comButtons +  '<button data-clipboard-text="'+ n.previewUrl +'" class="btn btn-info copyBtn" type="button">预览</button>' + startBouutn;
                (n.canDel=="1")? n.materialButtonGroup = n.materialButtonGroup + delButton : n.materialButtonGroup = n.materialButtonGroup;
                (n.status=="3")? n.materialButtonGroup = '<button class="btn btn-info" type="button" data-operate="look">查看</button>' : n.materialButtonGroup = n.materialButtonGroup;
            });
            data.parentCategoryArr = parentCategoryArr;
            data.categoryArr = categoryArr;
            data.supplierArr = supplierArr;
            data.tagArr = tagArr;
            data.categoryText = listDropDown.categoryText;
            data.supplierText = listDropDown.supplierText;
            data.labelText = listDropDown.labelText;
            data.statusText = listDropDown.statusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
            copyText();
        });
    }
    // 页面首次加载列表数据
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var urlParam = id.split("=");
    if(urlParam[0]==1){
        param.willExpire = 1;
    }else{
        param.willExpire = '';
    }

    //getDownLists();
    //setTimeout(function(){
    //    loadData();
    //},100);

    //2020.09.24 ajax按序执行
    $.when(
        getDownLists()
    ).done(function(){
        loadData();
    }).fail(function(){
        hound.error("ERROR", "", 1000);
    });

    utils.bindList($(document), operates);
    var listDropDown = {
        categoryText:'分类',
        supplierText:'供应商',
        labelText:'标签',
        statusText:'状态'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropCategoryOptions a[data-id]', function () {
        param.parentCategoryId = $(this).data('id');
        param.categoryId = '';
        ($(this).text()=="所有") ? listDropDown.categoryText = "分类" : listDropDown.categoryText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropCategoryOptions a[data-value]', function () {
        param.categoryId = $(this).data('value');
        param.parentCategoryId = '';
        ($(this).text()=="所有") ? listDropDown.categoryText = "分类" : listDropDown.categoryText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropSupplierOptions a[data-id]', function () {
        param.supplierId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.supplierText = "供应商" : listDropDown.supplierText = $(this).text();
        param.pageNo = 1;
        loadData();
    }).on('click', '#dropTagOptions a[data-id]', function () {
        param.tagId = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.labelText = "标签" : listDropDown.labelText = $(this).text();
        param.pageNo = 1;
        loadData();
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        var selectSearchLabel = $("#selectsearchlabel").text();
        if(selectSearchLabel=="标题"){
            param.title = $("#searchCont").val();
            param.id = '';
            loadData();
        }else if(selectSearchLabel=="商品ID"){
            param.id = $("#searchCont").val();
            param.title = '';
            loadData();
        }
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});