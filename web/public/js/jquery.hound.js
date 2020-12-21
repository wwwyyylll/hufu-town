/*!
 * jQuery Hound Plugin
 * version: 3.2.0
 * Requires:jQuery 3+
 *          jQuery Validation
 *          jQuery Form
 *          Bootstrap-bundle
 *          SweetAlert2
 *          RequireJS
 * Bundle append:
 *          jQuery cookie
 *          jQuery autocomplete
 * Admin append:
 *          jQuery cookie
 *          jQuery autocomplete
 *          [vali-admin plugins]
 * Mobile append:
 *          jQuery cookie
 *          jQuery autocomplete
 *          swiper
 *          iscroll-probe
 *          pullLoad
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    /**
     * 页面重定向
     * @param url
     */
    function redirect(url) {
        switch (url) {
            case "reload":
                window.location.reload();
                break;
            case "back":
                window.history.back();
                break;
            case "close":
                window.self.focus();
                window.self.close();
                return false;
            default :
                var a = document.createElement("a");
                if (!a.click) {
                    location.href = url.replace(/&amp;/ig, "&");
                } else {
                    a.href = url;
                    a.style.display = "none";
                    document.body.appendChild(a);
                    a.click();
                }
                break;
        }
    }


    // SweetAlert2 - mixin
    var Toast = Swal.mixin({
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 3000
        }),
        Confirm = Swal.mixin({
            icon: 'question',
            confirmButtonText: '确定',
            showCancelButton: true,
            cancelButtonText: '取消',
            allowOutsideClick: false
        }),
        Timer = Swal.mixin({
            allowOutsideClick: false,
            timer: 3000
        });


    // hound jQuery functions
    window.hound = $.hound = {
        // Hound 版本
        version: '3.2.0',
        // 默认配置
        default: {
            type: 'POST',
            dataType: "json",
            timeout: 45000, //ajax请求超时时间:ms
            delay: 2000, //消息提醒后延迟跳转:ms
            events: 'click',
            selector: '[data-hound]',
            loadingText: 'Loading...'
        },
        /**
         * 设置默认配置
         * @param _default
         */
        setDefault: function (_default) {
            $.extend(hound.default, _default);
        },
        /**
         * 设置操作方法
          * @param _handles
         */
        setHandle: function (_handles) {
            $.extend(handles, _handles);
        },
        /**
         * 判断是否为空值
         * @param obj
         * @return {boolean}
         */
        isBlank: function (obj) {
            return (!obj || $.trim(obj) === "");
        },
        /**
         * 获取QueryString
         * @param url
         */
        getRequest: function(url) {
            var request = {};
            url = url || location.search;

            $.each(url.substr(url.indexOf('?') + 1).split("&"), function (i, n) {
                var pair = n.split('=');
                if (pair.length === 2) {
                    pair[0] = decodeURIComponent(pair[0]);
                    pair[1] = decodeURIComponent(pair[1]);
                    // If first entry with this name
                    if (typeof request[pair[0]] === "undefined") {
                        request[pair[0]] = pair[1];
                        // If second entry with this name
                    } else if (typeof request[pair[0]] === "string") {
                        request[pair[0]] = [request[pair[0]], pair[1]];
                        // If third or later entry with this name
                    } else {
                        request[pair[0]].push(pair[1]);
                    }
                }
            });

            return request;
        },
        /**
         * 通知功能
         * @param title
         * @param icon
         */
        toast: function(title, icon) {
            return Toast.fire({
                icon: icon,
                title: title
            });
        },
        /**
         * 简单SweetAlert
         * @param configuration
         */
        swal: function(configuration) {
            return Swal.fire($.extend({
                confirmButtonText: '确定'
            }, configuration));
        },
        /**
         * SweetAlert警告提示
         * @param title
         * @param text
         * @param timer
         */
        alert: function(title, text, timer) {
            return hound.swal({
                icon: 'warning',
                title: title,
                text: text,
                timer: timer
            });
        },
        /**
         * SweetAlert成功提示
         * @param title
         * @param text
         * @param timer
         */
        success: function(title, text, timer) {
            return hound.swal({
                icon: 'success',
                title: title,
                text: text,
                timer: timer
            });
        },
        /**
         * SweetAlert错误提示
         * @param title
         * @param text
         * @param timer
         */
        error: function(title, text, timer) {
            return hound.swal({
                icon: 'error',
                title: title,
                text: text,
                timer: timer
            });
        },
        /**
         * SweetAlert信息提示
         * @param title
         * @param text
         * @param timer
         */
        info: function(title, text, timer) {
            return hound.swal({
                icon: 'info',
                title: title,
                text: text,
                timer: timer
            });
        },
        /**
         * SweetAlert确认操作
         * @param title
         * @param text
         * @param confirm
         */
        confirm: function(title, text, confirm) {
            return Confirm.fire({
                title: title,
                text: text
            }).then(function(result) {
                if (result.value) {
                    if ($.isFunction(confirm)) {
                        confirm();
                    }
                }
            });
        },
        /**
         * SweetAlert输入框确认操作
         * @param title
         * @param placeholder
         * @param confirm
         */
        reason: function(title, placeholder, confirm) {
            return Confirm.fire({
                title: title,
                input: "text",
                inputPlaceholder: placeholder,
                inputAttributes: {
                    required: true,
                    maxlength: 50
                },
                inputValidator: function (value) {
                    if (!value) {
                        return placeholder;
                    }
                }
            }).then(function (result) {
                if (result.value) {
                    if ($.isFunction(confirm)) {
                        confirm(result.value);
                    }
                }
            });
        },
        /**
         * 显示Swal.loading
         * @returns {Promise<SweetAlertResult>}
         */
        showLoading: function() {
            return Timer.fire({
                title: hound.default.loadingText,
                timer: hound.default.timeout,
                onBeforeOpen: function () {
                    Swal.showLoading();
                }
            });
        },
        /**
         * 隐藏Swal.loading
         */
        hideLoading: function() {
            Swal.close();
        },
        /**
         * 重定向
         * @param url
         * @param message
         */
        redirect: function(url, message) {
            if (!hound.isBlank(url)) {
                if (message) {
                    Timer.fire({
                        text: message,
                        icon: 'info'
                    }).then(function () {
                        redirect(url);
                    });
                } else {
                    redirect(url);
                }
            }
        },
        /**
         * 自定义AJAX请求
         * @param settings
         * @param handle
         * @param isLoading
         */
        ajax: function (settings, handle, isLoading) {
            settings = $.extend({
                type: 'GET',
                cache: false,
                dataType: hound.default.dataType
            }, settings);

            if (isLoading) {
                hound.showLoading();
            }

            return $.ajax(settings).done(function (json) {
                if (isLoading) {
                    hound.hideLoading();
                }

                // 请求成功统一处理函数
                handles.success(json, handle);
            }).fail(function (xhr, err) {
                if (xhr.statusText === 'OK') {
                    hound.error(err);
                    throw new Error(err);
                } else {
                    hound.error(xhr.statusText);
                    throw new Error(xhr.statusText);
                }
            });
        },
        /**
         * 自定义POST请求
         * @param url
         * @param data
         * @param handle
         * @param isLoading
         */
        post: function (url, data, handle, isLoading) {
            return hound.ajax({
                type: 'POST',
                url: url,
                data: data
            }, handle, isLoading);
        },
        /**
         * 自定义GET请求
         * @param url
         * @param data
         * @param handle
         * @param isLoading
         */
        get: function (url, data, handle, isLoading) {
            return hound.ajax({
                type: 'GET',
                url: url,
                data: data
            }, handle, isLoading);
        },
        /**
         * 获取HTML页面
         * @param url
         * @param data
         * @param handle
         * @param isLoading
         */
        getHtml: function (url, data, handle, isLoading) {
            return hound.ajax({
                type: 'GET',
                url: url,
                data: data,
                dataType: 'html'
            }, handle, isLoading);
        },
        /**
         * set storage value.
         * @param name
         * @return {any}
         */
        getStorage: function (name) {
            return JSON.parse(localStorage.getItem(name));
        },
        /**
         * get storage value.
         * @param name
         * @param val
         */
        setStorage: function (name, val) {
            localStorage.setItem(name, JSON.stringify(val));
        }
    };


    /**
     * Hound jQuery 方法
     * @param events
     * @param selector
     * @param handleName
     * @return {jQuery}
     */
    $.fn.hound = function (events, selector, handleName) {
        if (hound.isBlank(handleName)) {
            if (hound.isBlank(events)) {
                events = hound.default.events;
            }
            if (selector === undefined) {
                selector = hound.default.selector;
            }

            this.on(events, selector, function (e) {
                var $this = $(this);
                this.handle = handles[$this.data('hound')];

                if ($.isFunction(this.handle)) {
                    this.handle();
                } else {
                    throw $this.data('hound') + ' undefined';
                }

                if ($this.data('prevent')) {
                    e.preventDefault();
                }
            });
        } else {
            if (events === 'submit' && $(this).is('form')) {
                // jQuery.form.ajaxForm()
                var handleOptions = $.extend({}, handles.formOptions, handles[handleName], {
                    success: function (response) { //response, statusText, xhr, $form
                        hound.hideLoading();

                        // 请求成功统一处理函数
                        handles.success(response, handles[handleName].success);
                    }
                });

                this.ajaxForm(handleOptions);
            } else {
                this.on(events, selector, handles[handleName] || function () {throw handleName + ' undefined';});
            }
        }

        return this;
    };


    // hound handles
    var handles = {
        /**
         * AJAX请求成功状态分析函数，设置后对数据进行统一处理。
         * @param data
         * @param callback
         */
        success: function (data, callback) {
            if ($.isFunction(callback)) {
                callback(data);
            }
        },
        formOptions: {
            type: hound.default.type,
            dataType: hound.default.dataType,
            timeout: hound.default.timeout,
            beforeSubmit: function (arr, $form) { //arr, $form, options
                var isValid = $form.hasClass('needs-validation') ? $form.valid() : true;

                if (isValid) {
                    hound.showLoading();
                }

                return isValid;
            },
            error: function (xhr, err) {
                if (xhr.statusText === 'OK') {
                    hound.error(err);
                    throw new Error(err);
                } else {
                    hound.error(xhr.statusText);
                    throw new Error(xhr.statusText);
                }
            }
        }
    };


    // jQuery Validate Settings
    if ($.validator !== undefined) {
        $.validator.setDefaults({
            debug: $.hound.debug,
            ignore: ".ignore",
            errorClass : 'is-invalid',
            validClass: 'is-valid',
            errorPlacement: function ($error, $input) {
                var $errorDiv = $input.next('.invalid-tooltip');
                if ($errorDiv.length === 0) {
                    $errorDiv = $('<div class="invalid-tooltip"></div>').html($error.html());
                    $input.after($errorDiv);
                } else {
                    $errorDiv.html($error.html());
                }
            }
        });
        // rule-mobile
        $.validator.addMethod("mobile", function (value, element) {
            return this.optional(element) || /^1[3-9]\d{9}$/.test(value);
        }, '请输入一个有效的手机号码');
        $.validator.addMethod("telephone", function (value, element) {
            return this.optional(element) || /^(0\d{2,3}\-)?([2-9]\d{6,7})+(\-\d{1,6})?$/.test(value);
        }, '请输入一个有效的固话号码');
        $.validator.addMethod("phone", function (value, element) {
            return this.optional(element) || /^(1[3-9]\d{9}|(0\d{2,3}\-)?([2-9]\d{6,7})+(\-\d{1,6})?)$/.test(value);
        }, '请输入一个有效的电话号码');
        $.validator.addMethod("code", function (value, element) {
            return this.optional(element) || /^\w{6}$/.test(value);
        }, '请输入6位验证码');
        /*
         * Translated default messages for the jQuery validation plugin.
         * Locale: ZH (Chinese, 中文 (Zhōngwén), 汉语, 漢語)
         */
        $.extend($.validator.messages, {
            required: "这是必填字段",
            remote: "请修正此字段",
            email: "请输入有效的电子邮件地址",
            url: "请输入有效的网址",
            date: "请输入有效的日期",
            dateISO: "请输入有效的日期 (YYYY-MM-DD)",
            number: "请输入有效的数字",
            digits: "只能输入数字",
            creditcard: "请输入有效的信用卡号码",
            equalTo: "你的输入不相同",
            extension: "请输入有效的后缀",
            maxlength: $.validator.format( "最多可以输入 {0} 个字符" ),
            minlength: $.validator.format( "最少要输入 {0} 个字符" ),
            rangelength: $.validator.format( "请输入长度在 {0} 到 {1} 之间的字符串" ),
            range: $.validator.format( "请输入范围在 {0} 到 {1} 之间的数值" ),
            step: $.validator.format( "请输入 {0} 的整数倍值" ),
            max: $.validator.format( "请输入不大于 {0} 的数值" ),
            min: $.validator.format( "请输入不小于 {0} 的数值" )
        });
    }

}));
