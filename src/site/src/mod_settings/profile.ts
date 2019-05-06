import * as $ from 'jquery';
import * as UI from '../ui';
import { uploadFileAjax, ajaxRequest } from '../mod_tools';
import { json } from 'body-parser';

let temporalFileInput = $('<input/>').attr({
    type: 'file',
}).on('change', async function(this: HTMLInputElement){
    if (this.files && this.files.length === 1) {
        const filePath:string = $(this).val() as string;
        const fileFormat = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
        const fileObj = this.files[0];
        if (!fileFormat.match(/.jpg|.jpeg/)) {
            alert ('文件格式必须是：jpg/jpeg');
            $(this).val('');
            return;
        }
        if (fileObj.size > 200 * 1024) {
            alert ('文件大小不得超过200k');
            $(this).val('');
            return;
        }
        const imgBase64 = await toBase64 (fileObj);
        $('#avatar-image').attr('src', imgBase64);
    }
});

async function toBase64 (fileObj: File) {
    return new Promise<string> (resolve => {
        const r = new FileReader ();
        r.onload = function () {
            resolve (r.result as string);
        }
        r.readAsDataURL (fileObj);
    });
}
async function compress (fileObj: File) {
    return new Promise<string> ((resolve, reject) => {
        const r = new FileReader();
        r.onload = function (e: any) {
            const image:any = $('<img/>');
            image.attr('src', e.target.result);
            image.on('load', function (this:HTMLImageElement) {
                const square = 256;
                const canvas = document.createElement ('canvas');
                const context = canvas.getContext('2d') as CanvasRenderingContext2D;
                let imgWidth = 0;
                let imgHeight = 0;
                let offsetX = 0;
                let offsetY = 0;
                canvas.width = square;
                canvas.height = square;
                context.clearRect (0, 0, square, square);
                if (this.width > this.height) {
                    imgWidth = Math.round(square * this.width / this.height);
                    imgHeight = square;
                    offsetX = -Math.round((imgWidth - square) / 2);
                } else {
                    imgHeight = Math.round(square * this.height / this.width);
                    imgWidth = square;
                    offsetY = -Math.round((imgHeight - square) / 2);
                }
                context.imageSmoothingEnabled = true;
                (context as any).imageSmoothingQuality = 'high';
                context.drawImage (this, offsetX, offsetY, imgWidth, imgHeight);
                const data = canvas.toDataURL ('image/jpeg');
                resolve (data);
            });
        };
        r.readAsDataURL (fileObj);
    });
}
function checkConfig () {
    let ok = true;
    const name = $.trim(String($('#name').val()));
    if (!name) {
        $('#err_msg_profile_name').html('请填写名称');
        ok = false;
    } else {
        $('#err_msg_profile_name').html('');
    }
    const email = $.trim(String($('#email').val()));
    if (!email) {
        $('#err_msg_profile_email').html('请填写电子邮箱');
        ok = false;
    } else {
        $('#err_msg_profile_email').html('');
    }
    return ok;
}

export async function profile_setup(avatar: string) {
    $('#btn-upload-avatar').on('click', function(){
        temporalFileInput.trigger ('click');
    });
    $('#btn-update-userprofile').on('click', function(ev){
        ev.preventDefault ();
        ev.stopPropagation ();
        if (checkConfig ()) {
            const form = document.forms[0];
            const formData = new FormData(form);
            const el = temporalFileInput[0] as HTMLInputElement;
            if (el.files && el.files.length === 1) {
                formData.append ('avatar', el.files[0]);
            }
            $.ajax ({
                url: '/api/trust/profile',
                type: 'post',
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function (result) {
                    if (!result.err) {
                        window.location.reload ();
                    } else {
                        alert ('数据提交失败，请检查网络或稍后重试');
                    }
                }
            });
        }
    });
};
