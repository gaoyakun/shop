import * as $ from 'jquery';
import { md5 } from '../../../common/md5';

export function login_setup() {
    function checkConfig () {
        let ok = true;
        const account = $.trim(String($('#account').val()));
        if (!account) {
            $('#err_msg_account').html('账号不正确');
            ok = false;
        } else {
            $('#err_msg_account').html('');
        }
        const password = $('#password').val();
        if (!password) {
            $('#err_msg_password').html('密码不正确');
            ok = false;
        } else {
            $('#err_msg_password').html('');
        }
        return ok;
    }
    $('input').on ('input', function () {
        checkConfig ();
    });
    $('#btn-register').on ('click', function() {
        window.location.href = '/register';
    });
    $('#btn-login').on ('click', function(){
        if (checkConfig ()) {
            $.ajax({
                url: '/api/login',
                type: 'post',
                data: {
                    account: $('#account').val(),
                    md5password: md5(String($('#password').val())),
                    remember: $('#remember-checkbox').prop('checked') ? 1 : 0
                },
                dataType: 'json',
                success: function(result) {
                    if (!result.err) {
                        window.location.href = '/';
                    } else {
                        $('#account').val('');
                        $('#password').val('');
                        checkConfig ();
                    }
                }
            });
        }
    });
};
