require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var getByIdData = {};
    var loadFlag = 2;
    //页面操作配置
    var operates = {
        //查看
        look:function(id){
            utils.ajaxSubmit(apis.taobaoArticle.getById, {id: id}, function (data) {
                data.typeText = consts.status.articleType1[data.type];
                getByIdData = {
                    dataArr:data
                };
                $("#basicMessage").html(template('basicList', getByIdData));
                $("#basicMessage").find("input").prop('disabled', true);
                if(loadFlag == 1){
                    operates.supportCss();
                }else{
                    operates.noSupportCss();
                }
            });
        },
        supportCss:function(){
            var n = getByIdData.dataArr;
            n.cssHtml = n.cssHtml.replace(/&lt;/g,"<");
            n.cssHtml = n.cssHtml.replace(/&gt;/g,">");
            n.cssHtml = n.cssHtml.replace(/&quot;/g,'"');
            n.cssHtml = n.cssHtml.replace(/&amp;nbsp;/g," ");
            $("#tabContent").html(template('supportCssList', getByIdData));
        },
        noSupportCss:function(){
            var n = getByIdData.dataArr;
            n.noCssHtml = n.noCssHtml.replace(/&lt;/g,"<");
            n.noCssHtml = n.noCssHtml.replace(/&gt;/g,">");
            n.noCssHtml = n.noCssHtml.replace(/&quot;/g,'"');
            n.noCssHtml = n.noCssHtml.replace(/&amp;nbsp;/g," ");
            $("#tabContent").html(template('noSupportCssList', getByIdData));
        },
        preview:function($this){
            var runTextArea = $this.closest(".tile-body").find("textarea").val();
            var oNewWin = window.open('about:blank');
            oNewWin.document.write(runTextArea);
        },
        previewPwd:function($this){
            var runTextArea = $this.closest(".tile-body").find("textarea").val();
            var oNewWin = window.open('about:blank');
            oNewWin.document.write(runTextArea);

            var arr = oNewWin.document.querySelectorAll("div");
            for(var i=0;i<arr.length;i++){
                if(arr[i].innerText.indexOf("淘口令")!='-1'){
                    var nextElement = arr[i].nextSibling.nextSibling;
                    arr[i].remove();
                    nextElement.remove();
                }
            }
            var oNewWin = window.open('about:blank');
            oNewWin.document.write(runTextArea);
        },
        saveArticle:function($this){
            var tag = $this.attr("data-id");
            if(tag==1){
                //cssHtml
                var cssHtml = $this.closest(".tile-body").find("textarea").val();
                hound.confirm('确认保存吗?', '', function () {
                    utils.ajaxSubmit(apis.taobaoArticle.editArticle, {id: param[0],cssHtml:cssHtml,noCssHtml:''}, function (data) {
                        hound.success("操作成功", "", 1000);
                        loadFlag = 1;
                        operates.look(param[0]);
                        $("#headerTab1").click();
                    });
                });
            }else if(tag==2){
                //noCssHtml
                var noCssHtml = $this.closest(".tile-body").find("textarea").val();
                hound.confirm('确认保存吗?', '', function () {
                    utils.ajaxSubmit(apis.taobaoArticle.editArticle, {id: param[0],noCssHtml:noCssHtml,cssHtml:''}, function (data) {
                        hound.success("操作成功", "", 1000);
                        loadFlag = 2;
                        operates.look(param[0]);
                        $("#headerTab2").click();
                    });
                });
            }
        }
    };

    // 页面首次加载列表数据
    //打开的对应的页面nav + active属性
    var loc = location.href;
    var n1 = loc.length;//地址的总长度
    var n2 = loc.indexOf("=");//取得=号的位置
    var id = decodeURI(loc.substr(n2+1,n1-n2));//从=号后面的内容
    var param = id.split("=");

    operates.look(param[0]);
    // Tab模块选择
    $("#headerTab1").on("click",function(){
        operates.supportCss();
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    $("#headerTab2").on("click",function(){
        operates.noSupportCss();
        $(this).css({color:"orange"});
        $(this).closest("li").siblings().find("a").css({color:"#555555"});
    });
    utils.bindList($(document), operates);
});