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
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">置顶</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">下架</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
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
                    $(".imgUrl").html("<a target='_blank' href='"+ res.result +"'><img style='display: inline-block;width: 45px;height: 20px' src='"+ res.result +"'></a>");
                    $("input[name=coverImg]").val(res.result);
                }
            }).fail(function (jqXHR, textStatus) {
                hound.error('Request failed: ' + textStatus);
            });
        });
    }
    function typeChange(){
        $("select[name=type]").on("change",function(){
            var typeValue = $(this).val();
            if(typeValue==1){
                $(".itemDiv").hide();
                $(".uploadFile").show();
                $(".videoDiv").show();
            }else if(typeValue==2){
                $(".itemDiv").show();
                $(".uploadFile").hide();
                $(".videoDiv").hide();
            }else{
                $(".itemDiv").hide();
                $(".uploadFile").hide();
                $(".videoDiv").hide();
            }
        })
    }
    //新增
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增好物推荐', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.userRecommendTaobaoItem.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'lg');
        uploadFile();
        typeChange();
    });

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            var tr = $this.closest("tr");
            var userId = tr.find("td").eq(1).text();
            var itemId = tr.find("td").eq(3).text();
            var reason = tr.find("td").eq(6).text();
            var type = "";
            if(tr.find("td").eq(4).text()=="视频"){
                type = 1;
            }else if(tr.find("td").eq(4).text()=="物料商品"){
                type = 2;
            }
            var videoUrl = tr.find("td").eq(7).text();
            var coverImg = '';
            if(tr.find("td").eq(5).find("a").length>0){
                coverImg = tr.find("td").eq(5).find("a").attr("href");
            }else{
                coverImg = '';
            }
            var getData = {
                dataArr:{
                    id:id,
                    userId:userId,
                    itemId:itemId,
                    reason:reason,
                    type:type,
                    videoUrl:videoUrl,
                    coverImg:coverImg
                }
            };
            utils.renderModal('编辑好物推荐', template('modalDiv', getData), function(){
                if($("#visaPassportForm").valid()) {
                    utils.ajaxSubmit(apis.userRecommendTaobaoItem.updById, $("#visaPassportForm").serialize(), function (data) {
                        hound.success("编辑成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'lg');
            uploadFile();
            typeChange();
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            var tr = $this.closest("tr");
            var userId = tr.find("td").eq(1).text();
            var itemId = tr.find("td").eq(3).text();
            var reason = tr.find("td").eq(6).text();
            var type = "";
            if(tr.find("td").eq(4).text()=="视频"){
                type = 1;
            }else if(tr.find("td").eq(4).text()=="物料商品"){
                type = 2;
            }
            var videoUrl = tr.find("td").eq(7).text();
            var coverImg = '';
            if(tr.find("td").eq(5).find("a").length>0){
                coverImg = tr.find("td").eq(5).find("a").attr("href");
            }else{
                coverImg = '';
            }
            var getData = {
                dataArr:{
                    id:id,
                    userId:userId,
                    itemId:itemId,
                    reason:reason,
                    type:type,
                    videoUrl:videoUrl,
                    coverImg:coverImg
                }
            };
            utils.renderModal('查看好物推荐', template('modalDiv', getData),'', 'lg');
            $("#visaPassportForm").append($("fieldset").prop('disabled', true));
        },
        //下架
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认下架吗?', '', function () {
                utils.ajaxSubmit(apis.userRecommendTaobaoItem.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //置顶
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认置顶吗?', '', function () {
                utils.ajaxSubmit(apis.userRecommendTaobaoItem.topById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        itemId:'',
        type:'',
        source:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.userRecommendTaobaoItem.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.goodsStatus[n.status];
                n.typeText = consts.status.recommendType[n.type];
                n.sourceText = consts.status.recommendSource[n.source];
            });
            $.each(data.dataArr,function(i,n){
                (n.status=="1")? n.materialButtonGroup = comButtons + startBouutn + stopButton : n.materialButtonGroup = comButtons ;
            });
            data.statusText = listDropDown.statusText;
            data.typeText = listDropDown.typeText;
            data.sourceText = listDropDown.sourceText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    var listDropDown = {
        statusText:'状态',
        typeText:'类型',
        sourceText:'来源'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        loadData();
    }).on('click', '#dropTypeOptions a[data-id]', function () {
        param.type = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.typeText = "类型" : listDropDown.typeText = $(this).text();
        loadData();
    }).on('click', '#dropSourceOptions a[data-id]', function () {
        param.source = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.sourceText = "来源" : listDropDown.sourceText = $(this).text();
        loadData();
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        param.itemId = $("#searchCont").val();
        loadData();
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});