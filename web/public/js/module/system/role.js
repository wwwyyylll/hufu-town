require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var searchlabel = $(".searchlabel");
    var $addModal = $("#addModal");
    var $sampleTable = $('#sampleTable');
    var $visaPagination = $("#visaPagination");
    //按钮组集合
    var comButtons =
            '<button class="btn btn-primary" type="button" data-operate="edit">编辑</button>'+
            '<button class="btn btn-info" type="button" data-operate="look">查看</button>',
        startBouutn =  '<button class="btn btn-primary" type="button" data-operate="setOn">有效</button>',
        stopButton = '<button class="btn btn-danger" type="button" data-operate="setOff">无效</button>',
        roleButton = '<button class="btn btn-primary" type="button" data-operate="assign">分配权限</button>';

    searchlabel.on("click",function(){
        $("#selectsearchlabel").text($(this).text());
        $("#searchCont").val("");
        $("#searchCont").attr("data-id",'');
    })

    //新增
    $addModal.on("click",function(){
        var initialData = {
            dataArr:{}
        };
        utils.renderModal('新增角色', template('modalDiv',initialData), function(){
            if($("#visaPassportForm").valid()){
                utils.ajaxSubmit(apis.role.create,$("#visaPassportForm").serialize(),function(data){
                    hound.success("添加成功","",1000);
                    utils.modal.modal('hide');
                    param.pageNo = 1;
                    loadData();
                })
            }
        }, 'md');
    })

    //页面操作配置
    var operates = {
        //编辑
        edit:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.role.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('编辑角色', template('modalDiv', getByIdData), function(){
                    if($("#visaPassportForm").valid()) {
                        utils.ajaxSubmit(apis.role.updateById, $("#visaPassportForm").serialize(), function (data) {
                            hound.success("编辑成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'md');
            });
        },
        //查看
        look:function($this){
            var id = $this.closest("tr").attr("data-id");
            utils.ajaxSubmit(apis.role.getById, {id: id}, function (data) {
                var getByIdData = {
                    dataArr:data
                };
                utils.renderModal('查看角色', template('modalDiv', getByIdData),'', 'md');
                $("#visaPassportForm").append($("fieldset").prop('disabled', true));
            });
        },
        //无效
        setOff:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认无效吗?', '', function () {
                utils.ajaxSubmit(apis.role.offById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        //有效
        setOn:function($this){
            var id = $this.closest("tr").attr("data-id");
            hound.confirm('确认有效吗?', '', function () {
                utils.ajaxSubmit(apis.role.onById, {id: id}, function (data) {
                    loadData();
                });
            });
        },
        assign:function($this){
            var roleId = $this.closest("tr").attr("data-id");
            var roleName = $this.closest("tr").find("td").eq(1).text();
            utils.ajaxSubmit(apis.roleModule.getLists, {roleId:roleId}, function (data) {
                var getData = {
                    dataArr:data
                };
                getData.dataArr.roleId = roleId;
                getData.dataArr.roleName = roleName;
                utils.renderModal('分配权限', template('roleModuleDiv', getData),function(){
                    if($("#roleModuleForm").valid()) {
                        utils.ajaxSubmit(apis.roleModule.create, $("#roleModuleForm").serialize(), function (data) {
                            hound.success("分配权限成功", "", 1000);
                            utils.modal.modal('hide');
                            loadData();
                        })
                    }
                }, 'lg');
            });
        },
        oneLevel:function($this){
            var oneLevelDiv = $this.closest(".oneLevelDiv");
            if(!$this.prop("checked")) {
                oneLevelDiv.find("input[type=checkbox]").prop("checked", $this.prop("checked"));
            }
        },
        twoLevel:function($this){
            if(!$this.prop("checked")){
                $this.closest(".twoLevelDiv").find(".threeLevelDiv").find("input[type=checkbox]").prop("checked", $this.prop("checked"));
            }else{
                //二级分类-------父级元素
                var oneLevelDiv = $this.closest(".oneLevelDiv");
                //所有的二级分类的同级元素
                var twoLevelDiv = $this.closest(".twoLevelDiv").siblings(".twoLevelDiv");
                var countNumber = [];
                for(var i=0;i<twoLevelDiv.length;i++){
                    if(twoLevelDiv.eq(i).find("div").eq(0).find("h6").find("input[type=checkbox]").prop("checked")){
                        countNumber.push(1);
                    }else{
                        countNumber.push(2);
                    }
                }
                //判断同级元素是否有选中的   有：不做改变 / 无：根据当前元素改变
                if(countNumber.indexOf(1)=="-1"){
                    oneLevelDiv.find("div").eq(0).find("h5").find("input[type=checkbox]").prop("checked", $this.prop("checked"));
                }
            }
        },
        threeLevel:function($this){
            //三级分类 --- 二级父类元素
            var twoLevelDiv = $this.closest(".twoLevelDiv");
            //所有的三级分类的同级元素
            var threeLevelDiv = $this.closest(".threeLevelDiv").siblings(".threeLevelDiv");
            var countNumber1 = [];
            for(var i=0;i<threeLevelDiv.length;i++){
                if(threeLevelDiv.eq(i).find("h6").find("input[type=checkbox]").prop("checked")){
                    countNumber1.push(1);
                }else{
                    countNumber1.push(2);
                }
            }
            //判断同级元素是否有选中的   有：不做改变 / 无：根据当前元素改变
            if(countNumber1.indexOf(1)=="-1"){
                twoLevelDiv.find("div").eq(0).find("h6").find("input[type=checkbox]").prop("checked", $this.prop("checked"));
            }

            //三级分类 --- 一级父类元素
            var oneLevelDiv = $this.closest(".oneLevelDiv");
            //所有的二级分类的同级元素
            var twoLevelDivArr = twoLevelDiv.siblings(".twoLevelDiv");
            var countNumber2 = [];
            for(var i=0;i<twoLevelDivArr.length;i++){
                if(twoLevelDivArr.eq(i).find("div").eq(0).find("h6").find("input[type=checkbox]").prop("checked")){
                    countNumber2.push(1);
                }else{
                    countNumber2.push(2);
                }
            }
            //判断同级元素是否有选中的   有：不做改变 / 无：根据当前元素改变
            if(countNumber2.indexOf(1)=="-1"){
                oneLevelDiv.find("div").eq(0).find("h5").find("input[type=checkbox]").prop("checked", twoLevelDiv.find("div").eq(0).find("h6").find("input[type=checkbox]").prop("checked"));
            }
        }
    };

    var param = {
        pageNo: 1,
        pageSize:10,
        status:'',
        title:''
    };

    function loadData() {
        utils.ajaxSubmit(apis.role.getLists, param, function (data) {
            //根据状态值显示对应的状态文字 + 显示对应的按钮
            $.each(data.dataArr,function(i,n){
                n.statusText = consts.status.ordinary[n.status];
                (n.status=="1")? n.materialButtonGroup = comButtons + stopButton : n.materialButtonGroup = comButtons + startBouutn;
                n.materialButtonGroup =  n.materialButtonGroup + roleButton;
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
    //列表筛选事件绑定
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