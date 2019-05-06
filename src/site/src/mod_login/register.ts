import * as $ from 'jquery';
import { md5 } from '../../../common/md5';

export function register_setup() {
    function checkConfig () {
        let ok = true;
        const account = $.trim(String($('#account').val()));
        if (!account) {
            $('#err_msg_account').html('账号不正确');
            ok = false;
        } else {
            $('#err_msg_account').html('');
        }
        const email = $.trim(String($('#email').val()));
        if (!email) {
            $('#err_msg_email').html('邮箱不正确');
            ok = false;
        } else {
            $('#err_msg_email').html('');
        }
        const password = $('#password').val();
        if (!password) {
            $('#err_msg_password').html('密码不正确');
            ok = false;
        } else {
            $('#err_msg_password').html('');
        }
        const password2 = $('#password2').val();
        if (password2 !== password) {
            $('#err_msg_password2').html('密码不匹配');
            ok = false;
        } else {
            $('#err_msg_password2').html('');
        }
        return ok;
    }
    $('input').on ('input', function () {
        checkConfig ();
    });
    $('#btn-register').on ('click', function(){
        if (checkConfig ()) {
            $.ajax({
                url: '/api/register',
                type: 'post',
                data: {
                    account: $('#account').val(),
                    email: $('#email').val(),
                    md5password: md5(String($('#password').val()))
                },
                dataType: 'json',
                success: function(result) {
                    if (!result.err) {
                        window.location.href = '/';
                    } else {
                        $('#account').val('');
                        $('#email').val('');
                        $('#password').val('');
                        $('#password2').val('');
                        checkConfig ();
                    }
                }
            });
        }
    });
};
