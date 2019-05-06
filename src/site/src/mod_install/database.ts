import * as $ from 'jquery';

export function init_database_setup() {
    function checkConfig () {
        let ok = true;
        const host = $.trim(String($('#host').val()));
        if (!host) {
            $('#err_msg_host').html('数据库服务器地址不正确');
            ok = false;
        } else {
            $('#err_msg_host').html('');
        }
        const port = $('#port').val();
        if (!port || isNaN(parseInt(String(port), 10))) {
            $('#err_msg_port').html('数据库端口不正确');
            ok = false;
        } else {
            $('#err_msg_port').html('');
        }
        const user = $.trim(String($('#username').val()));
        if (!user) {
            $('#err_msg_user').html('用户名不正确');
            ok = false;
        } else {
            $('#err_msg_user').html('');
        }
        const password = $('#password').val();
        if (!password) {
            $('#err_msg_password').html('密码不正确');
            ok = false;
        } else {
            $('#err_msg_password').html('');
        }
        const name = $.trim(String($('#name').val()));
        if (!name) {
            $('#err_msg_name').html('数据库名不正确');
            ok = false;
        } else {
            $('#err_msg_name').html('');
        }

        return ok ? {
            host: host,
            port: port,
            user: user,
            password: password,
            name: name
        } : null;
    }
    
    $('input').on ('input', function () {
        checkConfig ();
    });

    $('#ok').on ('click', function(e: Event){
        e.preventDefault();
        if (checkConfig ()) {
            $('#setup-database-form').submit ();
        }
    });
};
