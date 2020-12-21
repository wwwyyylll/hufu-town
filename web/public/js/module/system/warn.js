require(["consts", "apis", "utils", "common"], function(consts, apis, utils) {
    var $sampleTable = $('#sampleTable');
    function loadData() {
        utils.ajaxSubmit(apis.warn.getLists, '', function (data) {
            $sampleTable.html(template('visaListItem',data));
        });
    }
    // 页面首次加载列表数据
    loadData();
});