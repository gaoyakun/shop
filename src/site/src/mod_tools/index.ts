import * as $ from 'jquery';

const ajaxRequest = async function (options: any) {
    return new Promise ((resolve, reject) => {
        const opt:JQueryAjaxSettings = $.extend (false, {}, options);
        opt.success = function (response) {
            resolve (response);
        };
        opt.error = function (xhr, msg, err) {
            reject (msg);
        };
        $.ajax (opt);
    });
};

const uploadBlobAjax = async function (blob: Blob, name: string, url: string) {
    return new Promise ((resolve, reject) => {
        if (blob) {
            const formData = new FormData();
            formData.append (name, blob);
            $.ajax ({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    resolve (response);
                },
                error: function (xhr, msg, err) {
                    reject (msg);
                }
            });
        } else {
            reject ('No Data to upload');
        }
    });
}

const uploadFileAjax = async function (el: HTMLInputElement, name: string, url: string) {
    if (el.files) {
        await uploadBlobAjax (el.files[0], name, url);
    }
    /*
    return new Promise ((resolve, reject) => {
        if (el.files && el.files.length === 1) {
            const formData = new FormData();
            formData.append (name, el.files[0]);
            $.ajax ({
                url: url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    resolve (response);
                },
                error: function (xhr, msg, err) {
                    reject (msg);
                }
            });
        } else {
            reject ('No file to upload');
        }
    });
    */
}

const convertDataURLToBlob = function(dataURL: string): Blob {
    const groups = dataURL.split(',');
    const type = groups[0].split(';')[0].split(':')[1];
    const bytes = window.atob (groups[1]);
    const ab = new ArrayBuffer(bytes.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], {type: type});
}

export { uploadFileAjax, ajaxRequest, convertDataURLToBlob };