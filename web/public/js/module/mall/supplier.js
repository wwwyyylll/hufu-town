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
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">无效</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //新增供应商
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        initialData.dataArr.accountTypeArr = accountTypeArr;
        initialData.dataArr.sourceArr = sourceArr;
        utils.renderModal('新增供应商', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.mallSupplier.create,$("#visaPassportForm").serialize(),function(data){
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
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.mallSupplier.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                getByIdData.dataArr.accountTypeArr = accountTypeArr;
                getByIdData.dataArr.sourceArr = sourceArr;
                utils.renderModal('编辑供应商', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.ajaxSubmit(apis.mallSupplier.updateById, $("#visaPassportForm").serialize(), function (data) {
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
            utils.ajaxSubmit(apis.mallSupplier.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                getByIdData.dataArr.accountTypeArr = accountTypeArr;
                getByIdData.dataArr.sourceArr = sourceArr;
                utils.renderModal('查看供应商', template('modalDiv', getByIdData),'', 'lg');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.mallSupplier.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.mallSupplier.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        }
    }

    var param = {
        pageNo: 1,
        pageSize:10,
        name:$searchCont.val(),
        status:'',
        source:'',
        accountType:''
    };

    var accountTypeArr;
    var sourceArr;
    function loadData() {
        utils.ajaxSubmit(apis.mallSupplier.getLists, param, function (data) {
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.predict[n.status];
                (n.status=="1")? n.materialButtonGroup = comButtons + stopButton : n.materialButtonGroup = comButtons + startBouutn;
            });
            data.statusText = listDropDown.statusText;
            data.sourceText = listDropDown.sourceText;
            data.typeText = listDropDown.typeText;
            $sampleTable.html(template('visaListItem', data));
            utils.bindPagination($visaPagination, param, loadData);
            $visaPagination.html(utils.pagination(parseInt(data.cnt), param.pageNo));

            if(accountTypeArr==undefined){
                utils.ajaxSubmit(apis.mallSupplier.getConstLists, '', function (data) {
                    accountTypeArr = data.accountTypeArr;
                    sourceArr = data.sourceArr;
                    var dropData = {
                        accountTypeArr:accountTypeArr,
                        sourceArr:sourceArr,
                    }
                    $('#dropdownSourceOptions').html(template('dropdownSourceOption', dropData));
                    $('#dropdownTypeOptions').html(template('dropdownTypeOption', dropData));
                });
            }else{
                var dropData = {
                    accountTypeArr:accountTypeArr,
                    sourceArr:sourceArr,
                }
                $('#dropdownSourceOptions').html(template('dropdownSourceOption', dropData));
                $('#dropdownTypeOptions').html(template('dropdownTypeOption', dropData));
            }
        });
    }
    // 页面首次加载列表数据
    loadData();
    utils.bindList($(document), operates);
    var listDropDown = {
        statusText:'状态',
        sourceText:'来源',
        typeText:'账号类型'
    };
    $sampleTable.on('click', '#dropStatusOptions a[data-id]', function () {
        param.status = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.statusText = "状态" : listDropDown.statusText = $(this).text();
        loadData();
    }).on('click', '#dropdownSourceOptions a[data-id]', function () {
        param.source = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.sourceText = "来源" : listDropDown.sourceText = $(this).text();
        loadData();
    }).on('click', '#dropdownTypeOptions a[data-id]', function () {
        param.accountType = $(this).data('id');
        ($(this).text()=="所有") ? listDropDown.typeText = "账号类型" : listDropDown.typeText = $(this).text();
        loadData();
    });
    $("#search").on("click",function(){
        param.pageNo = 1;
        param.name = $("#searchCont").val();
        loadData();
    });
    $('#searchCont').on('keypress',function(event){
        if (event.keyCode == 13) {
            $('#search').click();
        }
    });
});