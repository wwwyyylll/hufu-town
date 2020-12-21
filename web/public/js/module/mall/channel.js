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
                    $("input[name=picUrl]").val(res.result);
                }
            }).fail(function (jqXHR, textStatus) {
                hound.error('Request failed: ' + textStatus);
            });
        });
    }
    function getUserLists(){
        $(".nickName").on("input",function() {
            var param = {
                pageNo: 1,
                pageSize: 5000000,
                status: '',
                mobile: '',
                nickName: $(".nickName").val(),
                source: 1
            };
            utils.ajaxSubmit(apis.user.getLists, param, function (data) {
                if (data.dataArr.length != 0) {
                    var $economyAbilityItem = '';
                    $.each(data.dataArr, function (i, v) {
                        $economyAbilityItem += '<div data-id="' + v.id + '" class="economy-ability-item">' + v.nickName + '</div>'
                    })
                    $('.ability-list').remove();
                    var $abilityList = '<div class="ability-list">' + $economyAbilityItem + '</div>';
                    $(".nickName").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function () {
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $(".nickName").val(data.dataArr[$index].nickName);
                        $("input[name=userId]").val(data.dataArr[$index].id);
                    });
                } else {
                    $('.ability-list').remove();
                    var $abilityList = '<div class="ability-list">' +
                        '<div data-id="-1" class="economy-ability-item">无数据</div>'
                        + '</div>';
                    $(".nickName").closest('.economy-wards').append($abilityList);

                    $('.economy-ability-item').click(function () {
                        $('.ability-list').remove();
                        var $index = $(this).index();
                        $(".nickName").val("无数据");
                        $("input[name=userId]").val("-1");
                    });
                }
            });
        })
    }
    //新增
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增渠道商', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.channel.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'md');
        getUserLists();
    });

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            var tr = $this.closest("tr");
            var mobile = tr.find("td").eq(3).find("div").eq(0).text();
            var pwd = tr.find("td").eq(3).find("div").eq(1).text();
            var data = {
                dataArr:{
                    id:id,
                    mobile:mobile,
                    pwd:pwd
                }
            };
            utils.renderModal('编辑渠道商', template('modalDiv', data), function(){
                if($("#visaPassportForm").valid()) {
                    utils.ajaxSubmit(apis.channel.updateById, $("#visaPassportForm").serialize(), function (data) {
                        hound.success("编辑成功", "", 1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }
            }, 'md');
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            window.open("@@HOSTview/mall/channelBusinessLook.html?id=" + id);
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.channel.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.channel.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        title:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.channel.getLists, param, function (data) {
            //根据状态值显示对应的状态文字
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary[n.status];
            });
            $.each(data.dataArr,function(i,n){
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
    var listDropDown = {
        statusText:'状态'
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