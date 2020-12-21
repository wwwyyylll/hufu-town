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
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">启用</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">停止</button>',
        delButton = '<button class="btn btn-danger" type="button" data-operate="del">删除</button>',
        downloadButton = '<button class="btn btn-success" type="button" data-operate="downloadCashCouponTest">下载</button>',
        userGetLogButton = '<button class="btn btn-warning" type="button" data-operate="userGetLog">会员领取日志</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    });

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
        });
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

    //新增现金券
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增现金券', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.mallCashCoupon.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'lg');
        uploadFile();
    });
    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.mallCashCoupon.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('编辑现金券', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.ajaxSubmit(apis.mallCashCoupon.updateById, $("#visaPassportForm").serialize(), function (data) {
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'lg');
                uploadFile();
            });
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.mallCashCoupon.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('查看现金券', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
        //停止
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认停止吗?', '', function () {
                utils.ajaxSubmit(apis.mallCashCoupon.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //启用
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认启用吗?', '', function () {
                utils.ajaxSubmit(apis.mallCashCoupon.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //删除
        del:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认删除吗?', '', function () {
                utils.ajaxSubmit(apis.mallCashCoupon.delById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //下载
        downloadCashCoupon:function($this){
            var id = $this.closest("tr").attr("data-id");
            //utils.ajaxSubmit(apis.mallCashCoupon.downloadById, {id: id}, function (data) {
                //var downloadUrl = data.url;

                // 创建隐藏的可下载链接
                // let  blob = 'http://pic.c-ctrip.com/VacationH5Pic/mice/wechat/ewm01.png';
                // var a = document.createElement('a');
                // a.style.display = 'none';
                // a.href = blob;
                // a.download = 'QRcode.jpg';
                // document.body.appendChild(a);
                // a.click();
                // //移除元素
                // document.body.removeChild(a);
                //canvans下载

                //function ddd(){
                //    var src = "http://wx.dhbiji.com/file/qrCode/20200910/1_goods_1.png";
                //    var canvas = document.createElement('canvas');
                //    var img = document.createElement('img');
                //    img.onload = function(e) {
                //        canvas.width = img.width;
                //        canvas.height = img.height;
                //        var context = canvas.getContext('2d');
                //        context.drawImage(img, 0, 0, img.width, img.height);
                //        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                //        canvas.toBlob(function(blob){
                //            let link = document.createElement('a');
                //            link.href = window.URL.createObjectURL(blob);
                //            link.download = 'aaa';
                //            link.click();
                //        }, "image/jpeg/png");
                //        //function aaa(){
                //        //    var link = document.createElement('a');
                //        //    link.href = window.URL.createObjectURL(blob);
                //        //    link.download = 'aaa';
                //        //    link.click();
                //        //}
                //        //canvas.toBlob(function(blob){
                //        //    return aaa();
                //        //})
                //    };
                //    img.setAttribute("crossOrigin",'Anonymous');
                //    img.src = src;
                //}
                //ddd();

            //function imageDownload(src){
            //    var canvas = document.createElement('canvas');
            //    var img = document.createElement('img');
            //    img.onload = () => {
            //        canvas.width = img.width;
            //        canvas.height = img.height;
            //        let context = canvas.getContext('2d');
            //        context.drawImage(img, 0, 0, img.width, img.height);
            //        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
            //        canvas.toBlob(blob => {
            //            let link = document.createElement('a');
            //            link.href = window.URL.createObjectURL(blob);
            //            link.download = 'download'; // resource name
            //            link.click()
            //        }, "image/jpeg/png", "0.95")
            //    };
            //    img.setAttribute("crossOrigin", 'Anonymous');
            //    img.src = src
            //}
            //imageDownload('http://wx.dhbiji.com/file/qrCode/20200910/1_goods_1.png');



            //});
        },
        downloadCashCouponTest:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.mallCashCoupon.downloadById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('查看现金券', template('downloadItemTest', getByIdData),'', 'lg');
            })
        },
        //会员领取日志
        userGetLog:function($this){
            var id = $this.closest("tr").attr("data-id");
            userLogParam.id = id;
            userLogData();
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        title:'',
        status:''
    };
    var userLogParam = {
        id:'',
        pageNo: 1,
        pageSize:10
    };

    function loadData() {
        utils.ajaxSubmit(apis.mallCashCoupon.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.remainNumber = parseInt(n.num)-parseInt(n.usedNum);
                n.statusText = consts.status.cashCouponStatus[n.status];
                if(n.status=="1"){
                    //未启用
                    n.materialButtonGroup = comButtons + startBouutn + delButton + downloadButton + userGetLogButton ;
                }else if(n.status=="2"){
                    //启用
                    n.materialButtonGroup = comButtons + stopButton + downloadButton + userGetLogButton ;
                }else if(n.status=="3"){
                    //停止
                    n.materialButtonGroup = '<button class="btn btn-info" type="button" data-operate="look">查看</button>' + downloadButton + userGetLogButton ;
                }else{
                    //删除
                    n.materialButtonGroup = "<span style='color:orange'>-----------</span>"
                }
            });
            data.statusText = listDropDown.statusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    function userLogData(){
        utils.ajaxSubmit(apis.mallCashCoupon.userListsById, userLogParam, function (data) {
            utils.renderModal("查看会员领取日志",template('userLogList', data),'','lg');
            utils.bindPagination($("#userLogPagination"), userLogParam, userLogData);
            $("#userLogPagination").html(utils.pagination(parseInt(data.cnt), userLogParam.pageNo));
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