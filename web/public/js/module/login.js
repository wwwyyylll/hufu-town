require(["consts", "apis", "utils"], function(consts, apis, utils) {
    var $login = $("#login");
    var $form = $('form');
//    登录页面
    //按回车键登录成功
    $(document).keypress(function(event){
        if (event.keyCode == 13) {
            $login.click();
        }
    });
    $login.on("click",function(){
        if($form.valid()){
            utils.ajaxSubmit(apis.login.login,$form.serialize(),function(data){
                //$.cookie('userName',$("input[name=userName]").val());
                $.cookie('userToken',data.userToken);
                window.location.href = "@@HOSTview/system/warn.html";
            });
        }
    });
});