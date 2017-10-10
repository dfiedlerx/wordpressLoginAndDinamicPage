/* edit post */

var td_edit_post = {};

(function () {
    "use strict";

    td_edit_post = {

        dbCheckDone: false,
        dbIsSet: false,
        modal: null,
        count: 0,

        init: function() {
            tinymce.activeEditor.on('focusin', function(e) {
                td_edit_post.on_ajax_db_check();
            });
            jQuery('.wp-editor-area').on('focusin', function(e) {
                td_edit_post.on_ajax_db_check();
            });
        },


        /**
         * Source from - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
         * @param min
         * @param max
         * @returns {*}
         */
        getRandomIntInclusive: function(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },


        /**
         * Display modal
         */
        show_modal: function() {
            var delay = td_edit_post.getRandomIntInclusive(10000, 30000),
                title = td_edit_post.b64DecodeUnicode('VGhlbWUgYWN0aXZhdGlvbg=='),
                content = td_edit_post.b64DecodeUnicode('VGhlIHRoZW1lIGlzIG5vdCBhY3RpdmUsIHBsZWFzZSBhY3RpdmF0ZSB0aGUgdGhlbWUu');

            jQuery('.wp-heading-inline').focus();
            clearTimeout(td_edit_post.modal);

            // debug
            // console.log(td_edit_post.count + ' - delay: ' + delay);
            // td_edit_post.count++;

            td_edit_post.modal = setTimeout(function() {
                if (jQuery('.modal-open').length == 0) {
                    tdConfirm.showModalOk(title,
                        content,
                        function() {
                            tb_remove();
                            td_edit_post.show_modal();
                        },
                        td_edit_post,
                        undefined,
                        true
                    );
                } else {
                    td_edit_post.show_modal();
                }
            }, delay);
        },


        /**
         * Source from - https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
         * @param str
         * @returns {string}
         */
        b64DecodeUnicode: function(str) {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        },


        /**
         * process AJAX response
         * @param data
         */
        process_db_check_response: function(data) {
            var td_data_object = jQuery.parseJSON(data); //get the data object

            if (td_data_object.db_is_set === true) {
                //db is set
                td_edit_post.dbIsSet = true;
                return;
            }

            if (td_data_object.db_time == 0) {
                //db is not set
                td_edit_post.show_modal();
            }
        },


        /**
         * AJAX call
         */
        on_ajax_db_check: function() {
            //check only once
            if (td_edit_post.dbCheckDone === true) {
                return;
            }

            //ajax call
            jQuery.ajax({
                type: "POST",
                url: td_ajax_url,
                data: {
                    action: 'td_ajax_db_check'
                },
                success: function( data, textStatus, XMLHttpRequest ) {
                    td_edit_post.dbCheckDone = true;
                    td_edit_post.process_db_check_response(data);
                },
                error: function( MLHttpRequest, textStatus, errorThrown ) {
                    //console.log(errorThrown);
                }
            });
        }

    }

})();

jQuery( document ).on('tinymce-editor-init', function( event, editor ) {
    td_edit_post.init();
});