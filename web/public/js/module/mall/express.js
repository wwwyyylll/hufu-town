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

    //新增遇见未来
    $addModal.on("click",function(){
        var initialData = {
            itemArr : [{}],
            dataArr:{}
        };
        initialData.dataArr.regionDataArr = regionDataArr;
        utils.renderModal('新增快递费', template('modalDiv',initialData), function(){
            var checkboxItem = $(".checkboxItem");
            var checkboxItemChecked = [];
            for(var i=0;i<checkboxItem.length;i++){
                if(checkboxItem.eq(i).attr("checked")){
                    checkboxItemChecked.push(checkboxItem.eq(i));
                }else{
                    checkboxItem.eq(i).next("label").find("input").eq(0).removeAttr("name");
                    checkboxItem.eq(i).next("label").find("input").eq(1).removeAttr("name");
                    checkboxItem.eq(i).next("label").find("input").eq(1).removeAttr("required");
                }
            }
            for(var j=0;j<checkboxItemChecked.length;j++){
                checkboxItemChecked[j].attr("name","itemArr["+ j +"][province]");
                checkboxItemChecked[j].next("label").find("input").eq(0).attr("name","itemArr["+ j +"][id]");
                checkboxItemChecked[j].next("label").find("input").eq(1).attr("name","itemArr["+ j +"][fee]");
                checkboxItemChecked[j].next("label").find("input").eq(1).attr("required","required");
            }
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.mallExpressFee.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'lg');
    })

    //页面操作配置
    var operates = {
        //新增预见选项
        addSelect:function(){
            $("#itemSelectDiv").append(template('singItemDiv', ''));
        },
        checkProvince:function($this){
            if($this.attr("checked")){
                $this.removeAttr("checked");
                var id = $this.next("label").find("input").eq(0).val();
                if(id!=""){
                    var delItemArr = $("#delItemArr");
                    delItemArr.append('<div class="delItemSingle"><input type="hidden" name="delItemArr[][id]" value="'+ id +'" class="form-control"></div');
                }
            }else{
                $this.attr("checked","checked");
            }
        },
        //删除预见选项
        delSelect:function($this){
            var row = $this.closest(".form-row");
            //编辑页面要统计已有ID的预见选项 delItemArr[0][id]
            var delId = row.find("input").eq(0).val();
            if(delId!=""){
                var delItemArr = $("#delItemArr");
                delItemArr.append('<div class="delItemSingle"><input type="hidden" name="delItemArr[][id]" value="'+ delId +'" class="form-control"></div');
            }
            row.remove();
        },
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.mallExpressFee.getById, {id: id}, function (data) {
                var data = {
                    itemArr:(data.itemArr.length!=0)? data.itemArr : [{}],
                    dataArr:data
                };
                data.dataArr.regionDataArr = regionDataArr;
                utils.renderModal('编辑快递费', template('modalDiv', data), function(){
                    var checkboxItem = $(".checkboxItem");
                    var checkboxItemChecked = [];
                    for(var i=0;i<checkboxItem.length;i++){
                        if(checkboxItem.eq(i).attr("checked")){
                            checkboxItemChecked.push(checkboxItem.eq(i));
                        }else{
                            checkboxItem.eq(i).next("label").find("input").eq(0).removeAttr("name");
                            checkboxItem.eq(i).next("label").find("input").eq(1).removeAttr("name");
                            checkboxItem.eq(i).next("label").find("input").eq(1).removeAttr("required");
                        }
                    }
                    for(var j=0;j<checkboxItemChecked.length;j++){
                        checkboxItemChecked[j].attr("name","itemArr["+ j +"][province]");
                        checkboxItemChecked[j].next("label").find("input").eq(0).attr("name","itemArr["+ j +"][id]");
                        checkboxItemChecked[j].next("label").find("input").eq(1).attr("name","itemArr["+ j +"][fee]");
                        checkboxItemChecked[j].next("label").find("input").eq(1).attr("required","required");
                    }
                    utils.reInputName($(".delItemSingle"));
                    if($("#visaPassportForm").valid()) {
                        utils.ajaxSubmit(apis.mallExpressFee.updateById, $("#visaPassportForm").serialize(), function (data) {
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'lg');
            });
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.mallExpressFee.getById, {id: id}, function (data) {
                var data = {
                    itemArr:(data.itemArr.length!=0)? data.itemArr : [{}],
                    dataArr:data
                };
                data.dataArr.regionDataArr = regionDataArr;
                utils.renderModal('查看快递费', template('modalDiv', data),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
        setAnswer:function($this){
            hound.confirm('确认设为答案吗?', '', function () {
                var row = $this.closest(".form-row");
                row.find(".col-9").find(".input-group").addClass("singItemSelect");
                row.siblings().find(".col-9").find(".input-group").removeClass("singItemSelect");

                var id = $("#settlementForm").find("input[name=id]").val();
                var itemId = '';
                var itemRow = $(".itemRow");
                for(var i=0;i<itemRow.length;i++){
                    if(itemRow.eq(i).find(".col-9").find(".input-group").hasClass("singItemSelect")){
                        itemId = itemRow.eq(i).find(".itemId").val();
                    }
                }
                var data = {
                    id:id,
                    itemId:itemId
                }
                if(itemId!=''){
                    utils.ajaxSubmit(apis.mallExpressFee.settlementById,data,function(data){
                        hound.success("设置成功","",1000);
                        utils.modal.modal('hide');
                        loadData();
                    })
                }else{
                    hound.error("请设置答案","","");
                }
            })
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.mallExpressFee.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.mallExpressFee.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        title:'',
        status:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.mallExpressFee.getLists, param, function (data) {
            //根据状态值显示对应的状态文字
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.predict[n.status];
                (n.status=="1")? n.materialButtonGroup = comButtons + stopButton : n.materialButtonGroup = comButtons + startBouutn;
            });
            data.statusText = listDropDown.statusText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));
        });
    }
    var regionDataArr = [];
    var regionData = {};
    function loadRegion(){
        $.ajax({
            type:'GET',
            url:'@@HOSTpublic/js/region.json',
            headers: {
                contentType : "application/json",
                "Content-Encoding": "UTF-8"
            },
            dataType: 'json',
            success: function (res) {
                 for(var i=0;i<res.length;i++){
                     regionDataArr.push(res[i].province);
                 }
            }
        }).fail(function (jqXHR, textStatus) {
            hound.error('Request failed: ' + textStatus);
        });
    }
    loadRegion();
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