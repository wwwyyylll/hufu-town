define("consts", function() {
    return {
        host: '@@HOST',
        apiBase: "@@API",
        viewBase: '@@HOST@@VIEW',
        param: {
            linkUserName:'hufuConsole',
            linkPassword:'hufuds@!#$erff2324fdscs@3!@#$%@!w@^%',
            signature:'7c5e8184e35e3bf4dd49190bb250411e'
        },
        status:{
            ordinary:{
                '1':'<span style="color:green">有效</span>',
                '2':'<span style="color:red">无效</span>'
            },
            admin:{
                '1':'<span style="color:green">启用</span>',
                '2':'<span style="color:red">禁用</span>'
            },
            user:{
                '1':'<span style="color:green">允许登录</span>',
                '2':'<span style="color:red">禁止登录</span>'
            },
            userType:{
                '1':'<span style="color:orange">用户</span>',
                '2':'<span style="color:green">管理员</span>'
            },
            orderStatus:{
                '1':'<span style="color:deeppink">待处理</span>',
                '2':'<span style="color:orange">处理中</span>',
                '3':'<span style="color:green">已完成</span>',
                '4':'<span style="color:red">已退款</span>'
            }
        }
    }
});