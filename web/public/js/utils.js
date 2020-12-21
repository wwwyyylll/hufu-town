define("utils", ["consts", "apis"], function(consts, apis) {
    var $modal = $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">\n' +
        '    <div class="modal-dialog" role="document">\n' +
        '        <div class="modal-content">\n' +
        '            <div class="modal-header">\n' +
        '                <h4 class="modal-title flex-fill text-center font-weight-bold m-0"></h4>\n' +
        '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '                    <span aria-hidden="true">&times;</span>\n' +
        '                </button>\n' +
        '            </div>\n' +
        '            <div class="modal-body"></div>\n' +
        '            <div class="modal-footer">\n' +
        '                <button type="button" class="btn btn-primary">确定</button>\n' +
        '                <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>'),
        $modalTitle = $modal.find('.modal-title'),
        $modalBody = $modal.find('.modal-body'),
        $modalConfirm = $modal.find('.modal-footer .btn-primary'),
        $modalCancel = $modal.find('.modal-footer .btn-secondary'),
        $modalDialog = $modal.find('.modal-dialog'),
        modalSize = {
            sm: 'modal-sm',
            md: 'modal-md',
            lg: 'modal-lg',
            xl: 'modal-xl'
        },
        $loading = $('<div id="visaLoading" class="d-none"></div>');

    $('body').append($modal, $loading);
    $modal.on('hide.bs.modal', function () {
        $modal.find('.modal-footer .modal-body').empty();
        $modal.find('.modal-footer .btn-primary').off('click');
    });

    $.hound.setDefault({
        loadingText: 'loading……'
    });
    $.hound.setHandle({
        success: function (json, success) {
            switch (json.code) {
                case 200:
                    if ($.isFunction(success)) {
                        success(json.result);
                    }
                    break;
                case 'A00001':
                    me.loading(false);
                    $.hound.error(json.message);
                    //$.hound.redirect(consts.login, json.message);
                    break;
                case 'B00001':
                    $.cookie('pointcut', location.href, {path: '/'});
                    var wxCofnig = {
                        appid: 'wx55c5c00baa145fcf',
                        redirect_uri: consts.host + 'wxLogin.html',
                        response_type: 'code',
                        scope: 'snsapi_userinfo', //snsapi_login snsapi_userinfo snsapi_base
                        state: 'STATE'
                    };
                    location.href = '@@HOSTlogin.html';
                    break;
                default:
                    me.loading(false);
                    $.hound.error(json.message);
                    break;
            }
        },
    });

    var me = {
        /**
         * 更新重复型表单名称
         * @param $rows
         */
        reInputName: function ($rows) {
            $rows.each(function (i) {
                var index = '[' + i + ']';
                $(this).find(':input').each(function () {
                    var name = $(this).prop('name');
                    if (name) {
                        $(this).prop('name', name.replace(/^(\w+)\[\d*\](\[\w*\])?$/, '$1' + index + '$2'));
                    }
                });
            });
        },
        /**
         * 列表操作按钮事件绑定
         * @param $list
         * @param operates
         */
        bindList: function($list, operates) {
            $list.on('click', '[data-operate]', function () {
                var $this = $(this),
                    operate = operates[$(this).data('operate')],
                    id = $this.closest('tr').data('id');

                if (typeof operate === 'function') {
                    operate($this, id);
                }
            });
        },
        /**
         * 分页事件绑定
         * @param $pagination
         * @param param
         * @param loadData
         */
        bindPagination: function($pagination, param, loadData) {
            $pagination.one('click', '.pagination a', function () {
                param.pageNo = $(this).data('page');
                loadData();
            }).on('blur', '.pagination input', function () {
                var page = parseInt($(this).val());
                if (!isNaN(page) && param.pageNo !== page) {
                    param.pageNo = page;
                    loadData();
                }
            }).on('keypress', '.pagination input', function (e) {
                if (e.which === 13) {
                    var page = parseInt($(this).val());
                    if (!isNaN(page) && param.pageNo !== page) {
                        param.pageNo = page;
                        loadData();
                    }
                }
            })
        },
        /**
         * 生成分页导航
         * @param total
         * @param page
         * @param pageSize
         * @returns {jQuery|jQuery|HTMLElement}
         */
        pagination: function (total, page, pageSize) {
            // 进行分页操作
            if (total < 1) {
                return $('');
            }

            pageSize = pageSize || 10;

            var $pagination = $('<ul class="pagination"></ul>'),
                pageCount = Math.floor((total + pageSize - 1) / pageSize),
                pageBegin = 1,
                pageEnd = 0;

            if (pageCount < 11) {
                pageEnd = pageCount;
            } else if ((page - 5) < 1) {
                pageEnd = 10;
            } else if ((page + 5) > pageCount) {
                pageBegin = pageCount - 9;
                pageEnd = pageCount;
            } else {
                pageBegin = page - 4;
                pageEnd = page + 5;
            }
            if (page > 1) {
                $pagination.append('<li><a href="javascript:void(0);" title="上一页" data-page="' + (page - 1) + '">«</a></li>');
            } else {
                $pagination.append('<li><span class="disabled">«</span></li>');
            }
            //首页
            if (pageBegin > 1) {
                $pagination.append('<li><a href="javascript:void(0);" title="第1页" data-page="1">1</a></li>');
                $pagination.append('<li><span>...</span></li>');
            }
            for (var i = pageBegin; i <= pageEnd; i++) {
                $pagination.append(i === page ? '<li><span class="curr" title="第' + page + '页">' + page + '</span></li>' : '<li><a href="javascript:void(0);" title="第' + i + '页" data-page="' + i + '">' + i + '</a></li>');
            }
            if (pageCount > pageEnd) {
                $pagination.append('<li><span>...</span></li>');
                $pagination.append('<li><a href="javascript:void(0);" title="第' + pageCount + '页" data-page="' + pageCount + '">' + pageCount + '</a></li>');
            }
            if (pageCount > page) {
                $pagination.append('<li><a href="javascript:void(0);" title="上一页" data-page="' + (page + 1) + '">»</a></li>');
            } else {
                $pagination.append('<li><span class="disabled">»</span></li>');
            }

            $pagination.append('<li><span>共' + pageCount + '页&nbsp;/&nbsp;' + total +'条数据</span></li>');
            $pagination.append('<li><span>转到</span><span class="p-0"><input type="text" value="'+ page + '"></span><span>页</span></li>');

            return $pagination;
        },
        /**
         * 生成完整API
         * @param api
         * @param param
         * @returns {*}
         */
        parseApi: function(api, param) {
            return $.extend({}, param, api, consts.param, {userToken: $.cookie('userToken')});
        },
        /**
         * 加载遮罩层
         * @param isShow
         */
        loading: function(isShow) {
            if (isShow) {
                $loading.removeClass('d-none')
            } else {
                $loading.addClass('d-none')
            }
        },
        /**
         * AJAX方法请求接口数据
         * @param api
         * @param param
         * @param success
         * @param isLoading
         */
        ajaxSubmit: function(api, param, success, isLoading) {
            // if (typeof param === 'string') {
            //     param = hound.getRequest(param);
            // }
            // hound.post(consts.apiParse(api), param, success, isLoading);
            if (typeof param === 'string') {
                param = $.hound.getRequest(param);
            }
            $.hound.post(consts.apiBase, me.parseApi(api, param), success, isLoading);
        },
        modal: $modal,
        /**
         * 渲染Modal
         * @param title
         * @param body
         * @param confirm
         * @param size
         */
        renderModal: function (title, body, confirm, size) {
            var modalOptions = {
                size: 'xl',
                confirmText: '确定',
                cancelText: '取消'
            };
            $modalTitle.html(title);
            $modalBody.html(body);

            if (typeof confirm === "function") {
                $modalConfirm.removeClass('d-none').on('click', confirm);
            } else {
                modalOptions.cancelText = '关闭';
                $modalConfirm.addClass('d-none');
                if (size === undefined) {
                    size = confirm;
                }
            }
            if ($.isPlainObject(size)) {
                modalOptions = $.extend(modalOptions, size);
            } else if (typeof size === 'string') {
                modalOptions.size = size;
            }
            $modalConfirm.html(modalOptions.confirmText);
            $modalCancel.html(modalOptions.cancelText);

            $.each(modalSize, function (i, n) {
                $modalDialog.removeClass(n);
            });
            if (modalSize[modalOptions.size]) {
                $modalDialog.addClass(modalSize[modalOptions.size]);
            }

            $modal.modal({
                backdrop: 'static',
                keyboard: false
            });
        },
        /**
         * 根据ID筛选记录
         * @param list
         * @param id
         * @returns {{}}
         */
        grepItem: function (list, id) {
            var item = $.grep(list, function (n, i) {
                return n.id == id;
            });

            return item.length === 1 ? item[0]: {};
        },
        /**
         * Radio 切换指定区域
         * @param showVal
         * @param $input
         * @param $target
         * @param $reverse
         */
        toggleRadio: function ($input, showVal, $target, $reverse) {
            if (!($reverse instanceof jQuery)) {
                $reverse = $(null);
            }
            $input.click(function () {
                if ($(this).val() === showVal) {
                    $target.removeClass('d-none');
                    $reverse.addClass('d-none');
                } else {
                    $target.addClass('d-none');
                    $reverse.removeClass('d-none');
                }
            }).filter(':checked').trigger('click');
        },
        /**
         * Checkbox 切换指定区域
         * @param $input
         * @param $target
         * @param $reverse
         */
        toggleCheckbox: function ($input, $target, $reverse) {
            if (!($reverse instanceof jQuery)) {
                $reverse = $(null);
            }
            $input.click(function () {
                if ($(this).is(':checked')) {
                    $target.removeClass('d-none');
                    $reverse.addClass('d-none');
                } else {
                    $target.addClass('d-none');
                    $reverse.removeClass('d-none');
                }
            }).filter(':checked').trigger('click');
        },
        /**
         * Select 切换指定区域
         * @param showVal
         * @param $input
         * @param $target
         * @param $reverse
         */
        toggleSelect: function ($input, showVal, $target, $reverse) {
            if (!($reverse instanceof jQuery)) {
                $reverse = $(null);
            }
            $input.change(function () {
                var isShow = showVal instanceof Function ? showVal($input) : $input.val() === showVal;
                if (isShow) {
                    $target.removeClass('d-none');
                    $reverse.addClass('d-none');
                } else {
                    $target.addClass('d-none');
                    $reverse.removeClass('d-none');
                }
            }).trigger('change');
        },
        /**
         * Input 输入值切换指定区域
         * @param showVal
         * @param $input
         * @param $target
         * @param $reverse
         */
        toggleInput: function ($input, showVal, $target, $reverse) {
            if (!($reverse instanceof jQuery)) {
                $reverse = $(null);
            }
            $input.on('input propertychange', function () {
                var isShow = showVal instanceof Function ? showVal($input) : $input.val() === showVal;
                if (isShow) {
                    $target.removeClass('d-none');
                    $reverse.addClass('d-none');
                } else {
                    $target.addClass('d-none');
                    $reverse.removeClass('d-none');
                }
            }).trigger('input');
        },
		/**
         * stat 请求统计
         * @param url
         * @param data
         */
		stat: function (url, data) {
			var param = $.extend({
                url: url,
				ip: ip,
				aSource: 'h5',
				refererUrl: document.referrer,
				source: 3
			}, data);
			
			me.ajaxSubmit(apis.browseStat.stat, param, function () {});
		},
        /**
         * 日期加减
         * @param date
         * @param num
         * @param type
         * @returns {string}
         */
        dateAdd: function (date, num, type) {
            date = new Date(date);
            switch (type) {
                case 1:
                    date.setMonth(date.getMonth() + num);
                    break;
                case 2:
                    date.setYear(date.getYear() + num);
                    break;
                default:
                    date.setDate(date.getDate() + num);
                    break;
            }
            return me.dateString(date);
        },
        /**
         * 日期转字符 yyyy-MM-dd
         * @param date
         * @returns {string}
         */
        dateString: function (date) {
            date = date instanceof Date ? date : (typeof date === 'undefined' ? new Date() : new Date(date));
            return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
        },
        /**
         * 渲染时间控件
         * @param $e
         */
        renderDate: function ($e) {
            layui.use(['laydate'], function(){
                var laydate = layui.laydate;

                $e.find('.laydate').each(function () {
                    laydate.render({
                        elem: this
                    });
                });
            });
        },
        /**
         * 渲染时间范围控件
         * @param $e
         */
        renderDateRange: function ($e) {
            layui.use(['laydate'], function(){
                var laydate = layui.laydate;

                $e.find('.laydateRange').each(function () {
                    laydate.render({
                        elem: this,
                        max: 0,
                        range: true
                    });
                });
            });
        },
        /**
         * 渲染时间控件
         * @param e
         * @param done
         */
        inputDate: function (e, done) {
            layui.use(['laydate'], function(){
                var laydate = layui.laydate;

                laydate.render({
                    elem: e,
                    done: function(value, date){
                        if ($.isFunction(done)) {
                            done(value, date);
                        }
                    }
                });
            });
        },
        /**
         * 金额格式化
         * @param num
         * @returns {*|string}
         */
        toFixed: function (num) {
            return num.toFixed(2);
        },
        /**
         * 解析表单数据
         * @param $form
         */
        parseSerialize: function ($form) {
            var json = {};
            var serialize = $form.serialize();

            $.each(serialize.substr(serialize.indexOf('?') + 1).split("&"), function (i, n) {
                var pair = n.split('=');
                if (pair.length === 2) {
                    pair[0] = decodeURIComponent(pair[0]);
                    pair[1] = decodeURIComponent(pair[1]);
                    if (/^\w+\[\d*\]/.test(pair[0])) {
                        var index = pair[0].replace(/^\w+\[(\d*)\].*/, '$1');
                        pair[0] = pair[0].replace(/^(\w+)\[\d*\]/, '$1[]');
                        if (index === '') {
                            if ($.isArray(json[pair[0]])) {
                                json[pair[0]].push(pair[1]);
                            } else {
                                json[pair[0]] = [pair[1]];
                            }
                        } else {
                            if (!$.isArray(json[pair[0]])) {
                                json[pair[0]] = [];
                            }
                            json[pair[0]][index] = [pair[1]];
                        }
                    } else {
                        if (typeof json[pair[0]] === "undefined") {
                            json[pair[0]] = pair[1];
                        } else if (typeof json[pair[0]] === "string") {
                            json[pair[0]] = [json[pair[0]], pair[1]];
                        } else {
                            json[pair[0]].push(pair[1]);
                        }
                    }
                }
            });

            return json;
        },
        /**
         * 获取草稿
         * @param key
         * @return {{}}
         */
        getDrafts: function (key) {
            var s = localStorage.getItem('drafts-' + key);

            return s ? JSON.parse(s) : {};
        },
        /**
         * 设置草稿
         * @param key
         * @param s
         */
        setDrafts: function (key, s) {
            localStorage.setItem('drafts-' + key, JSON.stringify(s));
        }
    };

    return me;
});
