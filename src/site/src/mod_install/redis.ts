import * as $ from 'jquery';

export function init_redis_setup() {
    function checkConfig () {
        const external = $('#external').prop('checked');
        let ok = true;
        $('#host').prop('disabled', !external);
        $('#port').prop('disabled', !external);
        if (external) {
            $('#type').val('web');
            const host = $.trim(String($('#host').val()));
            if (!host) {
                $('#err_msg_host').html('Redis服务器地址不正确');
                ok = false;
            } else {
                $('#err_msg_host').html('');
            }
            const port = $('#port').val();
            if (!port || isNaN(parseInt(String(port), 10))) {
                $('#err_msg_port').html('Redis服务器端口不正确');
                ok = false;
            } else {
                $('#err_msg_port').html('');
            }
        } else {
            $('#type').val('local');
            $('#err_msg_host').html('');
            $('#err_msg_port').html('');
        }
        return ok;
    }
    $('input').on ('input', function () {
        checkConfig ();
    });
    $('#ok').on ('click', function(e: Event){
        e.preventDefault ();
        if (checkConfig ()) {
            $('#setup-redis-form').submit ();
        }
    });
};
