//init the variable if it's undefined, sometimes wordpress will not run the wp_footer hooks in wp-admin (in modals for example)
if (typeof td_get_template_directory_uri === 'undefined') {
    td_get_template_directory_uri = '';
}


/*  ----------------------------------------------------------------------------
 On load
 */
jQuery().ready(function() {

    //IE8+ hack (loses focus on controller to remove the blue selected background), but still remain the select the same option blue background
    jQuery('.td-panel-dropdown').change(function(){
        jQuery(this).blur();
    });

    //add events to checkboxes controls
    td_panel_checkboxes();

    //add events to visual selectors orizontaly
    td_panel_visual_select_vo('.td-visual-selector-o-img');

    //add events to visual selectors verticaly
    td_panel_visual_select_vo('.td-visual-selector-v');

    //the navigation script
    panel_navigation();

    //add events to visual pulldown sidebars
    td_sidebar_pulldown();

    //add events to controlls to delete from the page (not from the database) the uploaded font/image
    td_delete_uploaded_font_image();

    //add evets to radio controlls
    td_panel_radio_control();

    //load the panel box script
    td_panel_box();

    //ajax submit
    td_ajax_form_submit();

    //floating save button
    td_floating_save_button();

    //add events for click on sidebar position
    td_add_events_mce_for_sidebar();

    //resize the with of the tiny MCE when, on backend post add/edit page, sidebar position is set to left or right
    td_resize_tiny_mce_for_sidebar();

    //update custom fonts on input field focusout
    updateCustomFontsOnFocusout();

    //click event on system status buttons
    tdButtonSystemStatus();

    //social fields validation
    td_add_event_to_validate_panel_social_fields();

    //theme activation
    td_theme_activation();

});

//function to add click events on all checkboxes
function td_panel_checkboxes() {
    jQuery(document).on('click', '.td-checkbox, .td-checkbox-active', function(){
        if(jQuery(this).find(':first-child').hasClass('td-checbox-buton-active')){

            //change the background of the checkbox from active to inactive
            jQuery(this).removeClass('td-checkbox-active');

            //if checkbox is checked : add active class and write to hidden field the value of data-val-true
            jQuery(this).find(':first-child').removeClass('td-checbox-buton-active');
            jQuery('#' + jQuery(this).data('uid')).val(jQuery(this).data('val-false'));

        } else {

            //change the background of the checkbox from inactive to active
            jQuery(this).addClass('td-checkbox-active');

            //if checkbox is unchecked : remove active class and write to hidden field the value of data-val-false
            jQuery(this).find(':first-child').addClass('td-checbox-buton-active');
            jQuery('#' + jQuery(this).data('uid')).val(jQuery(this).data('val-true'));
        }
    });
}



//function to add click events on all visual selects (orizontaly and verticaly)
function td_panel_visual_select_vo(class_vso) {
    jQuery(document).on("click", class_vso, function(event){
        //prevent the implicit link (a) event
        event.preventDefault();

        //remove the active class from whatever child of this control has it
        jQuery('#' + jQuery(this).data('control-wrapper') + ' a  img').each(
            function() {
                jQuery(this).removeClass('td-visual-selector-active');
            }
        );

        //add value to hidden field
        jQuery('#' + jQuery(this).data('uid')).val(jQuery(this).data('option-value'));

        //and add active class to the current element
        jQuery(this).addClass('td-visual-selector-active');

    });
}


function panel_navigation() {
    jQuery('.td-panel-menu a').click(function(event){

        //if we don't have a data panel defined, do nothing (it is used on the back links)
        if (typeof jQuery(this).data('panel') == "undefined") {
            return;
        }

        event.preventDefault();

        //change the menu focus
        jQuery('.td-panel-menu-active').removeClass('td-panel-menu-active');
        jQuery(this).addClass('td-panel-menu-active');


        //change the panel
        jQuery('.td-panel-active').removeClass('td-panel-active');
        jQuery('#' + jQuery(this).data('panel')).addClass('td-panel-active');



        jQuery(this).delay(500).queue(function(){
            td_ap_admin_done_resizing(); //recalculate the page size - used by the save button
            jQuery(this).dequeue();
        });

    });
}



// jQuery easing used for sidebar pulldown
jQuery.extend( jQuery.easing, {
    easeOutCubic: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    }
});

//function to add click events on all pulldown sidebars
function td_sidebar_pulldown() {
    //add click event for pulldown
    jQuery(document).on("click",'.td-selected-sidebar, .td-arrow-pulldown-sidebars', function(event) {

        //take the list id
        var list_id = jQuery(this).data('list-id');

        if(jQuery('#' + list_id).css('display') == 'block'){
            jQuery('#' + list_id).slideUp({
                duration: 300,
                easing: "easeOutCubic"
            });
        } else {
            //hide all sidebars option lists
            td_hide_pulldown_sidebar_options();


            //get hight of sidebars list
            var list_hight = jQuery('#' + list_id).height();//numeric, no px

            //distance between elemen an the botom of the page = height of the document - distance of the element from the top
            var distance_of_elem_from_botom = jQuery(document).height() - jQuery(this).offset().top;

            //decide if we gonna show the list up or down based on her length
            if(distance_of_elem_from_botom < (list_hight + 125)){
                //lista incompleta
                jQuery('#' + list_id).css('border-top', '1px solid #e6e6e6').css('top', 1-list_hight);
            }else{
                //lista completa
                jQuery('#' + list_id).css('border-top', 0).css('top', 40);
            }


            jQuery('#' + list_id).slideDown({
                duration: 300,
                easing: "easeOutCubic"
            });
        }

        //stop propagation
        event.stopImmediatePropagation();
        return false;
    });

    //add click option to an element in the option list
    td_add_events_to_option_list_sidebar_pulldown();

    //add click option to delete an element from the option list
    td_add_events_to_delete_option_sidebar_pulldown();


    //add click option to add `new sidebar button`
    jQuery(document).on('click', '.td-button-add-new-sidebar', function(e) {
        //this will hold every item in the sidebar list to be checked
        var list_var = '';

        //to add the new sidebar
        var add_new_sidebar = 1;

        //get the new sidebar name
        var id_new_sidebar_field = jQuery(this).data('field-new-sidebar');
        var new_sidebar_item = jQuery('#' + id_new_sidebar_field).val();

        if(new_sidebar_item.trim() == '') {
            alert('Please insert a name for your new sidebar!');

            //0 = not to add current sidebar
            add_new_sidebar = 0;
            return;
        }

        //check for duplicates sidebar names
        jQuery('#' + jQuery(this).data('sidebar-option-list') + ' .td-option-sidebar').each(function(){
            list_var = jQuery(this).attr('title');//jQuery(this).html();

            if(new_sidebar_item.trim() == list_var.trim()) {
                alert('This name is already used as a sidebar name. Please use another name!');
                add_new_sidebar = 0;

                //make the new sidebar field empty
                jQuery('#' + id_new_sidebar_field).val('');
            }
        });

        //if we can find the new name, call ajax and add new sidebar name
        if(add_new_sidebar == 1) {
            //make the new sidebar field empty
            jQuery('#' + id_new_sidebar_field).val('');

            //call ajax
            td_ajax_panel_sidebar_pulldown('td_ajax_new_sidebar', new_sidebar_item, replace_all('new_sidebar_', '', id_new_sidebar_field));
        }
    });


    //add click event on body to hide all siderbars pulldown lists
    jQuery(document).click(function(e) {
        if(e.target.className !== "td-selected-sidebar" && e.target.className !== "td-arrow-pulldown-sidebars" && e.target.className !== "td_new_sidebar_field") {
            td_hide_pulldown_sidebar_options();
        }
    });
}

//add click option to an element in the option list
function td_add_events_to_option_list_sidebar_pulldown() {
    jQuery(document).on('click', '.td-option-sidebar', function(event) {

        var inputs_id_control = jQuery(this).data('area-dsp-id');

        //this is used to display the sidebar name
        var value_sidebar_selected = jQuery(this).html();

        //this is used to save the full length of the name
        var value_sidebar_selected_hidden = jQuery(this).attr('title');

        //write selected sidebar in the display area of the pull down
        jQuery('#' + inputs_id_control).text(value_sidebar_selected);
        jQuery('#' + inputs_id_control).attr('title', value_sidebar_selected_hidden);

        if(value_sidebar_selected == 'Default Sidebar') {
            value_sidebar_selected_hidden = '';
        }

        //write selected sidebar in the hidden field , used for saving
        jQuery('#hidden_' + inputs_id_control).val(value_sidebar_selected_hidden);

    });
}


//add click option to delete an element from the option list
function td_add_events_to_delete_option_sidebar_pulldown() {
    jQuery(document).on('click', '.td-delete-sidebar-option', function(event) {

        var sidebar_key_to_del = jQuery(this).data('sidebar-key');

        tdConfirm.showModal( 'Delete Sidebar',

            window,

            function(sidebar_key_to_del) {

                td_ajax_panel_sidebar_pulldown('td_ajax_delete_sidebar', sidebar_key_to_del, '');

                //hide pulldown sidebar options lists
                td_hide_pulldown_sidebar_options();

                tb_remove();
            },

            [sidebar_key_to_del],
            'Are you sure you want to delete this sidebar?'
        );

        //stop propagation
        event.stopImmediatePropagation();
        return false;
    });
}



//hide all pulldown sidebar options lists
function td_hide_pulldown_sidebar_options() {
    jQuery(".td-pulldown-sidebars-list").each(function(event){
        jQuery(this).slideUp({
            duration: 300,
            easing: "easeOutCubic"
        });
    });
}


/**
 * call to server from modal window
 *
 * @param $action : action to execute
 * @param $item  : the item beeing inserted
 * @param $id_controller  : used when added a new sidebar, to be addet as selected value for that pulldown controller
 *
 */
function td_ajax_panel_sidebar_pulldown(action, item, id_controller) {
    jQuery.ajax({
        type: 'POST',
        url: td_ajax_url,
        data: {
            action: action,
            sidebar: item,
            td_magic_token: tdWpAdminSidebarOpsNonce
        },
        success: function(data, textStatus, XMLHttpRequest){
            var td_data_object = jQuery.parseJSON(data); //get the data object

            //if the sidebar name exist in the td_option
            if(td_data_object.td_bool_value == 0){
                alert(td_data_object.td_msg);
            }
            //if succes the replace all pull down lists from the page
            if(td_data_object.td_bool_value == 1){
                if(td_data_object.value_insert != '') {
                    var data_id_list = '';
                    jQuery(".td_sidebars_for_replace").each(function(){
                        //take the list-data-id (data-controlelr-id is called in the page)
                        data_id_list = jQuery(this).data('controlelr-id');

                        //replace in the list returned by ajax the text xxx_replace_xxx with the list-data-id and inserts the list the into each sidebar pulldown controler
                        jQuery(this).html(replace_all('xxx_replace_xxx', data_id_list, td_data_object.value_insert));

                        //add events to visual pulldown sidebars
                        td_add_events_to_option_list_sidebar_pulldown();

                        //add click option to delete an element from the option list
                        td_add_events_to_delete_option_sidebar_pulldown();

                        //remove sidebar from controls that heve this sidebar selected
                        if(action == 'td_ajax_delete_sidebar') {
                            var id_area_dispaly_controler = jQuery(this).data('controlelr-id');
                            var val_area_display_controler = jQuery('#' + id_area_dispaly_controler).html();

                            //if a deleted sidebar is selected somewhere delete it from controller display area and hidden field
                            if(val_area_display_controler.trim() == td_data_object.value_to_march_del){
                                jQuery('#' + id_area_dispaly_controler).html('Default Sidebar');
                                jQuery('#hidden_' + id_area_dispaly_controler).val('');
                            }

                        }

                    });

                    //if user added new sidebar, select this new sidebar for the current puldown controller
                    if(action == 'td_ajax_new_sidebar') {
                        jQuery('#' + id_controller).html(td_data_object.value_selected);
                        jQuery('#hidden_' + id_controller).val(item.trim());
                    }

                }
            }


        },
        error: function(MLHttpRequest, textStatus, errorThrown){
            //console.log(errorThrown);
        }
    });
}



/**
 * function to replace all ocurences of a string in another string
 *
 * @param find
 * @param replace
 * @param str
 * @returns {a string will all ocurences of the `find` replaced}
 */
function replace_all(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}






//upload image
function td_upload_image_font(id_upload_field) {
    var button = '#' + id_upload_field + '_button';
    jQuery(button).click(function() {

        window.original_send_to_editor = window.send_to_editor;

        wp.media.editor.open(jQuery(this));

        //open the modal window
        //tb_show('', 'media-upload.php?referer=td_upload&amp;type=image&amp;TB_iframe=true&amp;post_id=0');

        //resizing the upload tb_window
        //var document_height = jQuery(window).height();
        //var upload_windpw_height = document_height;

        //alert(document_height);

        //resize the upload window
        //upload_windpw_height = document_height - 200;
        //
        //jQuery("#TB_iframeContent").css("height", upload_windpw_height + 'px').css("width", "670px");
        //
        //jQuery("#TB_window").css("margin-left", '-300px').css("top", '29px').css("margin-top",'0px').css("visibility", "visible").css("width", "670px");

        //hide Create Gallery
        jQuery('.media-menu .media-menu-item:nth-of-type(2)').addClass('hidden');
        //hide Create Audio Playlist
        jQuery('.media-menu .media-menu-item:nth-of-type(3)').addClass('hidden');
        //Create Video Playlist
        jQuery('.media-menu .media-menu-item:nth-of-type(4)').addClass('hidden');

        window.send_to_editor = function(html) {
            img_link = jQuery('img', html).attr('src');
            if(typeof img_link == 'undefined') {
                img_link = jQuery(html).attr('src');
            }
            if(typeof img_link == 'undefined') {
                img_link = jQuery(html).attr('href'); //used on font files (woff)
            }

            //take the image name and return it to parent window
            jQuery('#' + id_upload_field).val(img_link);

            jQuery('#' + id_upload_field + '_button_delete').removeClass('td-class-hidden');

            jQuery('#' + id_upload_field + '_display img').attr('src', img_link);

            //add font name based on the font file name
            currentUploadField = jQuery('#' + id_upload_field);
            if (currentUploadField.hasClass('td_upload_field_link_font')) {
                //extract font file name from the font url
                splitedFontFilePath = img_link.split('/');
                fontFileName = splitedFontFilePath[splitedFontFilePath.length - 1].split('.');
                //split the upload field name to retrieve the field number (ex. font 1, 2 or 3)
                uploadFieldName =  currentUploadField.attr('name').split('_');
                fontFile = uploadFieldName[uploadFieldName.length - 1];
                //set font family based on the font file name
                jQuery("input[name='td_fonts_user_insert[font_family_" + fontFile + "']").val(fontFileName[0]);
            }

            //close the modal window
            tb_remove();

            //reset the send_to_editor function to its original state
            window.send_to_editor = window.original_send_to_editor;
        };
        return false;
    });

    //if the user paste a url into the id_upload_field
    jQuery('#' + id_upload_field).change(function(){
        jQuery('#' + id_upload_field + '_display img').attr('src', jQuery('#' +  id_upload_field).val());

        if(jQuery('#' +  id_upload_field).val() == '' ) {
            jQuery('#' + id_upload_field + '_button_delete').addClass('td-class-hidden');
        } else {
            jQuery('#' + id_upload_field + '_button_delete').removeClass('td-class-hidden');
        }
    });
}

//add events to controlls to delete from the page (not from the database) the uploaded image
function td_delete_uploaded_font_image() {
    jQuery(document).on('click', '.td_delete_image_button', function() {

        tdConfirm.showModal( 'Delete Image',

            window,

            function( $this ) {

                //take control id
                var controlId = $this.data('control-id');

                //hide the delete button
                $this.addClass('td-class-hidden');//.hide();

                //remove the link from image tag
                jQuery('#upd_img_id_' + controlId).attr('src', td_get_template_directory_uri + '/includes/wp_booster/wp-admin/images/panel/no_img_upload.png');

                //empty the control input box
                jQuery('#' + controlId).val('');

                tb_remove();
            },

            [jQuery(this)],
            'Are you sure you want to delete this image?'
        );
    });

    jQuery(document).on('click', '.td_delete_font_button', function() {

        tdConfirm.showModal( 'Delete Font',

            window,

            function( $this ) {

                //take controlId
                var controlId = $this.data('control-id');

                //hide the delete button
                $this.addClass('td-class-hidden');//.hide();

                //empty the control input box
                jQuery('#' + controlId).val('');

                tb_remove();
            },

            [jQuery(this)],
            'Are you sure you want to delete this font?'
        );
    });
}


//add evets to radio controlls
function td_panel_radio_control() {
    jQuery(document).on('click', '.td-radio-control-option', function(event){
        //prevent the implicit link (a) event
        event.preventDefault();

        var wrapper_id = jQuery(this).data('control-id');

        //pass thru each option and remove the selected class
        jQuery('#' + wrapper_id + ' a').each(
            function() {
                jQuery(this).removeClass('td-radio-control-option-selected');
            }
        );

        //add the selected class only for the option that user cliked on
        jQuery(this).addClass('td-radio-control-option-selected');

        //add option value to hidden field
        jQuery('#hidden_' + wrapper_id).val(jQuery(this).data('option-value'));
    });
}



//the panel box script (close show panel)
function td_panel_box() {

    /**
     * normal box
     */
    jQuery('.td-box-header-js-inline').click(function (event) {

        //on categories (they have links in the title of the box), do not open/close the box instead go to that category
        if (jQuery(event.target).data('is-category-link') == 'yes') {
            return;
        }

        event.preventDefault();

        show_content_panel(jQuery('#' + jQuery(this).data('box-id')));
    });


    /**
     * ajax version of the box  (ajax box)
     */
    jQuery('.td-box-header-js-ajax').click(function (event) {

        //on categories (they have links in the title of the box), do not open/close the box instead go to that category
        if (jQuery(event.target).data('is-category-link') == 'yes') {
            return;
        }
        event.preventDefault();

        //update custom fonts only when a font panel is opened - for the other panels don't call the updateCustomFont function
        if (jQuery(this).is('[data-panel-ajax-params*="td_theme_fonts"]') !== false) {
            show_content_panel(jQuery('#' + jQuery(this).data('box-id')), false, updateCustomFonts);
        } else {
            show_content_panel(jQuery('#' + jQuery(this).data('box-id')));
        }
    });
}




/**
 * This function is called to load a content panel and show it.
 * Default, the content toggles, but it can be kept opened all the time.
 * It offers the chance to execute a callback function after a successful loading.
 *
 * @param jquery_panel_obj - The jQuery object that represents the panel
 * @param keep_position - [*] A flag used to keep the panel opened. If it missed the content toggles.
 * @param callback - [*] The callback function that will execute if it exists.
 */
function show_content_panel(jquery_panel_obj, keep_position, callback) {
    // get the header of the panel
    var jquery_panel_header = jquery_panel_obj.children('.td-box-header').eq(0);

    // if the panel doesn't have a header
    if (!jquery_panel_header.length) {
        return;
    }

    //get the box_id
    var td_box_id = jquery_panel_header.data('box-id');

    //check for the panel to be empty to do the ajax call
    if(!jQuery('#' + td_box_id + ' .td-box-content').html()) {

        // loading gif
        jQuery('#' + td_box_id).addClass('td-box-loading');

        var td_panel_ajax_param = jquery_panel_header.data('panel-ajax-params');
        td_panel_ajax_param.td_magic_token = tdWpAdminPanelBoxNonce;




        if(td_panel_ajax_param != '') {
            jQuery.ajax({
                type: "POST",
                url: td_ajax_url,
                data: td_panel_ajax_param,
                success: function( response ) {
                    //console.log( response );

                    var td_box_content_el = jQuery('#' + td_box_id + ' .td-box-content');
                    if(response != '') {
                        td_box_content_el.html(jQuery.parseJSON(response));

                        // the callback function is called
                        if (callback != undefined) {
                            callback.apply();
                        }
                    }

                    // open the box - animation
                    var td_box = jQuery('#' + td_box_id);
                    td_box.removeClass('td-box-loading');      // removing the gif after done the loading
                    td_box.removeClass('td-box-close');
                    var td_box_content_wrap = td_box.find('.td-box-content-wrap');
                    td_box_content_wrap.css('height', 0);
                    td_box_content_wrap.css('overflow', 'hidden');

                    setTimeout(function(){
                        td_box_content_wrap.css('height', td_box_content_el.height() + 18);
                        setTimeout(function(){
                            td_box_content_wrap.css('height', 'auto');
                            td_box_content_wrap.css('overflow', 'visible');

                        }, 200);
                    }, 50);

                    setTimeout(function(){
                        td_ap_admin_done_resizing(); //recalculate the page size - used by the save button
                    }, 400);
                }
            });
        }
    } else {
        // the callback function is called
        if (callback != undefined) {
            callback.apply();
        }
    }

    //do the open/close
    var td_box = jQuery('#' + td_box_id);
    if (td_box.hasClass('td-box-close')) {
        // open the box
        td_box.removeClass('td-box-close');

        var td_box_content_wrap = td_box.find('.td-box-content-wrap');
        var original_height = td_box_content_wrap.height();
        td_box_content_wrap.css('height', 0);
        td_box_content_wrap.css('overflow', 'hidden');

        setTimeout(function(){
            td_box_content_wrap.css('height', original_height);

            setTimeout(function(){
                td_box_content_wrap.css('height', 'auto');
                td_box_content_wrap.css('overflow', 'visible');
            }, 200);
        }, 20);

    } else {

        if (keep_position != undefined && keep_position === true) {
            return;
        }

        //close and hide the box
        var td_box_content_wrap = td_box.find('.td-box-content-wrap');
        td_box_content_wrap.css('height', td_box_content_wrap.height());

        setTimeout(function(){
            td_box_content_wrap.css('height', 0);
            td_box_content_wrap.css('overflow', 'hidden');

            setTimeout(function(){
                td_box.addClass('td-box-close');
                td_box_content_wrap.css('height', 'auto');
                td_box_content_wrap.css('overflow', 'visible');
            }, 200);

        }, 20);
    }

    setTimeout(function(){
        td_ap_admin_done_resizing(); //recalculate the page size - used by the save button
    }, 400);
}


/**
 * read all custom font inputs and update the font options inside the drop-down lists
 */
function updateCustomFonts() {
    var fontFamilies = {
            //custom fonts
            file_1: jQuery('[name="td_fonts_user_insert[font_family_1]"]').val(),
            file_2: jQuery('[name="td_fonts_user_insert[font_family_2]"]').val(),
            file_3: jQuery('[name="td_fonts_user_insert[font_family_3]"]').val(),
            //typekit fonts
            tk_1: jQuery('[name="td_fonts_user_insert[type_kit_font_family_1]"]').val(),
            tk_2: jQuery('[name="td_fonts_user_insert[type_kit_font_family_2]"]').val(),
            tk_3: jQuery('[name="td_fonts_user_insert[type_kit_font_family_3]"]').val() },
        fontSelectors,
        currentFontOption,
        displayElementsCount, //used to track the order of the custom fonts inside the selector
        currentSelector;

    //get all font selectors
    fontSelectors = jQuery('select[name*="font_family"]');

    //parse all font selectors
    jQuery.each(fontSelectors, function( selectorIndex, selectorValue ) {
        currentSelector = jQuery(this);
        displayElementsCount = 1;

        //parse custom font families
        jQuery.each(fontFamilies, function( fontIndex, fontValue ) {
            //get the already set custom font option
            currentFontOption = currentSelector.children('option[value="' + fontIndex + '"]');

            if (currentFontOption.length !== 0) {
                //the font option is set - increase the list element number
                displayElementsCount++;

                if (fontValue != '') {
                    //replace the font option text with the current one
                    currentFontOption.text(fontValue);
                } else {
                    //if the custom font input is empty set the font option "Default font" - we don't remove it completely because we want to keep the selected parameter for the case when the user wants to add a new font
                    currentFontOption.text('Default font');
                }
            } else {
                //the custom font is not set, add it only if the fontValue is set
                if (fontValue != '') {
                    //the font option is not set on the current
                    currentSelector.children('option:nth-of-type(' + displayElementsCount + ')').after('<option value="' + fontIndex + '">' + fontValue + '</option>');
                    //you added a new font option increase the list element number
                    displayElementsCount++;
                }
            }
        });

    });

}


//update custom fonts on input field focusout
function updateCustomFontsOnFocusout(){
    jQuery('input[name*="td_fonts_user_insert"]').focusout(updateCustomFonts);
}



//code for submiting the form with ajax
function td_ajax_form_submit() {

    var form = jQuery('#td_panel_big_form');

    jQuery('#td_button_save_panel').click(function(event){

        //show the div over the panel
        jQuery('.td_displaying_saving').css('display', 'block');
        jQuery('.td_wrapper_saving_gifs').css('display', 'block');
        jQuery('.td_displaying_saving_gif').css('display', 'block');


        jQuery.ajax({
            type: "POST",
            url: td_ajax_url,
            data: form.serialize(),
            success: function( response ) {
                //console.log( response );
                //alert('SAVED');
                jQuery('.td_displaying_saving').css('display', 'none');
                jQuery('.td_displaying_saving_gif').css('display', 'none');

                // we need to add the image and remove it again because the GIF will not play from the beginning otherwise
                jQuery('.td_displaying_ok_gif')
                    .attr('src', td_get_template_directory_uri + '/includes/wp_booster/wp-admin/images/panel/saved.gif')
                    .css('display', 'block')
                    .fadeOut(2400, function() {
                        jQuery('.td_displaying_ok_gif').attr('src', '');
                        jQuery('.td_wrapper_saving_gifs').css('display', 'none');
                    });
            }
        });
    });
}




// floating button

var td_wp_admin_resize_timer_id;

var td_wp_admin_distance_to_bottom = 0;

jQuery(window).resize(function() {
    clearTimeout(td_wp_admin_resize_timer_id);
    td_wp_admin_resize_timer_id = setTimeout(td_ap_admin_done_resizing, 500);
});

//this function is called only once 500ms after the resize is over
function td_ap_admin_done_resizing(){
    td_wp_admin_distance_to_bottom = jQuery(document).innerHeight() - jQuery(window).height();

    td_reposition_the_button();
}


function td_reposition_the_button() {
    var distance_to_bottom =  td_wp_admin_distance_to_bottom - jQuery(this).scrollTop();

    if (distance_to_bottom <= 33) {
        jQuery('#td_button_save_panel').removeClass('td-panel-footer-floating');
    } else {
        jQuery('#td_button_save_panel').addClass('td-panel-footer-floating');
    }
}



function td_floating_save_button() {
    td_ap_admin_done_resizing();

    jQuery(window).scroll(function(){
        //console.log(td_wp_admin_distance_to_bottom);
        td_reposition_the_button();
    });
}


//add events for click on sidebar position to resize the width of the tiny MCE edit area
function td_add_events_mce_for_sidebar() {
    jQuery('.td-sidebar-position-default, .td-sidebar-position-left, .td-no-sidebar, .td-sidebar-position-right').click(function(e) {
        td_resize_tiny_mce_for_sidebar();
    });
}



//resize the with of the tiny MCE when, on backend post add/edit page, sidebar position is set to left or right
function td_resize_tiny_mce_for_sidebar() {

    //wait for a second for Tine MCE to insert the iframe
    var tmce = setTimeout(function(){

        //get the sidebar position in the current post page
        var sidebar_position = jQuery('input[name="td_post_theme_settings[td_sidebar_position]"]').val();
        //console.log('xxx');

        if(document.getElementById('content_ifr')) {
            if(sidebar_position == 'no_sidebar') {
                //alert('iframe gasit');
                jQuery("#content_ifr").contents().find("body").addClass("mceContentBody-max-width-big");
                jQuery("#content_ifr").contents().find("body").removeClass("mceContentBody-max-width-small");
            } else {
                jQuery("#content_ifr").contents().find("body").removeClass("mceContentBody-max-width-big");
                jQuery("#content_ifr").contents().find("body").addClass("mceContentBody-max-width-small");
            }
        } else {
            //alert('iframe nu este gasit');
            clearTimeout(tmce);

            //call the function again
            td_resize_tiny_mce_for_sidebar();
        }
    }, 1000);
}


//click event on system status buttons
function tdButtonSystemStatus() {
    jQuery('.td-action-alert').on('click', function(event){
        event.preventDefault();
        var $this = jQuery(this),
            thisHref = $this.attr('href'),
            thisAction = $this.data('action');

        tdConfirm.showModal( 'Question',
            window,
            function( thisHref ) {

                window.location.replace(thisHref);
                tb_remove();
            },
            [thisHref],
            'Are you sure you want to ' + thisAction + ' ?'
        );
    })
}

//  regex url validation function
function isUrlValid(url) {
    return /^(https?|s?ftp):(\/\/|)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

//  regex email validation function
function isEmailUrlValid(url) {
    return /^[a-zA-Z0-9][a-zA-Z0-9_\.-]{0,}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9_\.-]{0,}[a-z0-9][\.][a-z0-9]{2,4}?$/i.test(url);
}

/**
 * function for panel > social networks validation
 * it displays an error message and a description note if a non valid url is used on each social network field
 */

function td_add_event_to_validate_panel_social_fields() {

    var panel_social_input_fields = jQuery ('#td-panel-social-networks .td-panel-input');

    panel_social_input_fields.each( function() {
        var current_input_filed = jQuery(this);

        td_input_field_check(current_input_filed);

        current_input_filed.on('input',function() {
            td_input_field_check(current_input_filed);
        });
    });

    function td_input_field_check(input_element){

        var current_input_filed_name = input_element.attr("name");
        var current_social_network_name = input_element.parent().attr("id");

        if ( input_element.val() != '' && isUrlValid(input_element.val()) === false && input_element.attr("name") !== 'td_social_networks[mail-1]') {

            if (input_element.hasClass("td-url-error")) {
                return;
            }

            input_element.addClass("td-url-error");
            input_element.after('<span id="field-error" class="error" for="'+ current_input_filed_name +'">' + 'Please enter a valid URL. </span><br />' +
                                '<span class="error error-note"> NOTE: ** This field should contain the unique URL for your ' + current_social_network_name + ' profile!</span>');

        } else {
            input_element.removeClass("td-url-error");
            input_element.siblings().remove();

            if (input_element.attr("name") === 'td_social_networks[mail-1]' && input_element.val() != '' && isEmailUrlValid(input_element.val()) === false) {
                input_element.addClass("td-url-error");
                input_element.after('<span id="field-error" class="error" for="'+ current_input_filed_name +'">' + 'Please enter a valid <b>"mailto:"</b> HTML e-mail link </span><br />' +
                    '<span class="error error-note"> NOTE: ** This field should contain the unique HTML e-mail link for your ' + current_social_network_name + ' address!</span>');
            }
        }
    }

}


/**
 * process ajax response for td_ajax_check_envato_code
 * @param data
 */
function td_envato_process_response(data) {
    var envatoCodeContainer = jQuery('.td-envato-code'),
        currentCode = envatoCodeContainer.find('input').val();

    //hide errors
    envatoCodeContainer.removeClass('td-err');
    envatoCodeContainer.find('.td-activate-err').hide();

    //clear empty spaces
    currentCode = currentCode.replace(/\s+/g, '');

    var td_data_object = jQuery.parseJSON(data); //get the data object
    //drop the result - it's from a old query
    if ( td_data_object.envato_code !== currentCode ) {
        return;
    }

    //envato check failed
    if (td_data_object.envato_check_failed === true) {
        envatoCodeContainer.addClass('td-err');
        jQuery('.td-envato-check-error').show();
        return;
    }

    //code is invalid
    if (td_data_object.envato_code_status == 'invalid') {
        envatoCodeContainer.addClass('td-err');
        var envatoInvalidErr = jQuery('.td-envato-invalid');
        if (td_data_object.envato_code_err_msg != '') {
            //long message
            envatoInvalidErr.removeClass('td-long-msg');
            if (td_data_object.envato_code_err_msg.length > 100) {
                envatoInvalidErr.addClass('td-long-msg');
            }
            //replace default message
            envatoInvalidErr.html(td_data_object.envato_code_err_msg);
        }
        //display error msg
        envatoInvalidErr.show();
        return;
    }

    //theme activated
    if (td_data_object.theme_activated === true) {
        tdConfirm.showModalOk('Theme activation',
            'Theme successfully activated. Thanks for buying our product.',
            function() {
                //redirect
                window.location.replace('?page=td_theme_welcome');
            }
        );

        return;
    }

    //code is not registered on the forum
    jQuery('.td-activate-envato-code').hide();
    jQuery('.td-activate-registration').show();
}



/**
 * AJAX call
 * check envato code
 */
function td_envato_code_check() {
    //envato code
    var envatoCodeContainer = jQuery('.td-envato-code'),
        envatoCodeInput = envatoCodeContainer.find('input'),
        envatoCode = envatoCodeInput.val(),
        submitButton = jQuery('.td-envato-code-button');

    //empty code
    if (envatoCode.length == 0) {
        envatoCodeContainer.addClass('td-err');
        jQuery('.td-envato-missing').show();
        return;
    }

    //code is too short
    if (envatoCode.length < 6) {
        envatoCodeContainer.addClass('td-err');
        jQuery('.td-envato-length').show();
        return;
    }

    //show - loading button
    submitButton.prop('disabled', true);
    envatoCodeInput.prop('disabled', true);
    submitButton.addClass('td-activate-button-loading');

    //ajax call
    jQuery.ajax({
        type: "POST",
        url: td_ajax_url,
        data: {
            action: 'td_ajax_check_envato_code',
            envato_code: envatoCode
        },
        success: function( data, textStatus, XMLHttpRequest ) {
            //hide - loading button
            submitButton.removeClass('td-activate-button-loading');
            envatoCodeInput.prop('disabled', false);
            submitButton.prop('disabled', false);

            td_envato_process_response(data);
        },
        error: function( MLHttpRequest, textStatus, errorThrown ) {
            //console.log(errorThrown);
        }
    });
}


function td_forum_process_response(data) {
    var envatoCodeContainer = jQuery('.td-envato-code'),
        currentCode = envatoCodeContainer.find('input').val(),
        inputContainers = jQuery('.td-activate-registration .td-activate-input-wrap');

    //hide errors
    inputContainers.removeClass('td-err');
    inputContainers.find('.td-activate-err').hide();

    //clear empty spaces
    currentCode = currentCode.replace(/\s+/g, '');

    var td_data_object = jQuery.parseJSON(data); //get the data object
    //drop the result - it's from a old query
    if ( td_data_object.envato_code !== currentCode ) {
        return;
    }

    //forum connection failed
    if (td_data_object.forum_connection_failed === true) {
        jQuery('.td-forum-connection-failed').show();
        return;
    }

    var forumConnectionData = td_data_object.forum_response_data;

    //user created - redirect
    if (forumConnectionData.user_created === true) {
        //theme is activated
        tdConfirm.showModalOk('Theme activation',
            'Theme successfully activated. A new account was created on the support forum. Thanks for buying our product.',
            function() {
                //redirect
                window.location.replace('?page=td_theme_welcome');
            }
        );
        return;
    }

    //envato code already used (cannot create another account) - redirect
    if (forumConnectionData.envato_key_used === true) {
        //theme is activated
        tdConfirm.showModalOk('Theme activation',
            'This envato code is already registered, you can only create one account for each code. You have successfuly activated the theme.',
            function() {
                //redirect
                window.location.replace('?page=td_theme_welcome');
            }
        );
        return;
    }

    if (forumConnectionData.envato_key_db_fail === true) {
        //db error - failed to check if the envato code is used on forum
        jQuery('.td-forum-connection-failed').show();
        return;
    }

    //user was not created - display errors
    if (forumConnectionData.envato_api_key_invalid === true) {
        //invalid envato code
        var envatoInvalidErr = jQuery('.td-envato-invalid');
        if (forumConnectionData.envato_code_err_msg != '') {
            //long message
            envatoInvalidErr.removeClass('td-long-msg');
            if (forumConnectionData.envato_key_err_msg.length > 30) {
                envatoInvalidErr.addClass('td-long-msg');
            }
            //replace default message
            envatoInvalidErr.html(forumConnectionData.envato_key_err_msg);
        }
        envatoInvalidErr.show();
        jQuery('.td-activate-registration').hide();
        jQuery('.td-activate-envato-code').show();
    }

    if (forumConnectionData.username_exists === true) {
        //username already used
        jQuery('.td-activate-username-used').show();
    }

    if (forumConnectionData.email_syntax_incorrect === true) {
        //email syntax incorrect
        jQuery('.td-activate-email-syntax').show();
    } else if (forumConnectionData.email_exists === true) {
        //email already used
        jQuery('.td-activate-email-used').show();
    }

    if (forumConnectionData.password_is_short === true) {
        //password length < 6 characters
        jQuery('.td-activate-password-length').show();
    }

    if (forumConnectionData.passwords_dont_match === true) {
        //password and password confirmation don't match
        jQuery('.td-activate-password-mismatch').show();
    }
}


/**
 * register new user on forum.tagdiv.com
 */
function td_register_forum_user() {
    //form data
    var envatoCodeContainer = jQuery('.td-envato-code'),
        envatoCode = envatoCodeContainer.find('input').val(),
        userNameContainer = jQuery('.td-activate-username'),
        userName = userNameContainer.find('input').val(),
        emailContainer = jQuery('.td-activate-email'),
        email = emailContainer.find('input').val(),
        passwordContainer = jQuery('.td-activate-password'),
        password = passwordContainer.find('input').val(),
        passwordConfirmationContainer = jQuery('.td-activate-password-confirmation'),
        passwordConfirmation = passwordConfirmationContainer.find('input').val(),
        submitButton = jQuery('.td-registration-button'),
        registrationInputs = jQuery('.td-activate-registration').find('input'),
        inputError = false;

    //empty code
    if (envatoCode.length == 0) {
        envatoCodeContainer.addClass('td-err');
        jQuery('.td-envato-missing').show();
        //return to envato code panel
        jQuery('.td-activate-envato-code').show();
        jQuery('.td-activate-registration').hide();
        return;
    }

    //code is too short
    if (envatoCode.length < 6) {
        envatoCodeContainer.addClass('td-err');
        jQuery('.td-envato-length').show();
        //return to envato code panel
        jQuery('.td-activate-envato-code').show();
        jQuery('.td-activate-registration').hide();
        return;
    }

    //username
    if (userName.length == 0) {
        userNameContainer.addClass('td-err');
        jQuery('.td-activate-username-missing').show();
        inputError = true;
    }

    //email
    if (email.length == 0) {
        emailContainer.addClass('td-err');
        jQuery('.td-activate-email-missing').show();
        inputError = true;
    } else {
        //email syntax
        var emailPattern = /^[^@\s]+@[^.\s]+\.[^\s]+$/;
        if (emailPattern.test(email) === false) {
            emailContainer.addClass('td-err');
            jQuery('.td-activate-email-syntax').show();
            inputError = true;
        }
    }

    //password
    if (password.length == 0) {
        passwordContainer.addClass('td-err');
        jQuery('.td-activate-password-missing').show();
        inputError = true;
    } else if (password.length < 6) {
        //password length
        passwordContainer.addClass('td-err');
        jQuery('.td-activate-password-length').show();
        inputError = true;
    }

    //password confirmation
    if (passwordConfirmation.length == 0) {
        passwordConfirmationContainer.addClass('td-err');
        jQuery('.td-activate-password-confirmation-missing').show();
        inputError = true;
    } else {
        //check if passwords match
        if (password != passwordConfirmation) {
            passwordConfirmationContainer.addClass('td-err');
            jQuery('.td-activate-password-mismatch').show();
            inputError = true;
        }
    }

    //we have input errors
    if (inputError === true) {
        return;
    }

    //show - loading button
    submitButton.prop('disabled', true);
    registrationInputs.prop('disabled', true);
    submitButton.addClass('td-activate-button-loading');

    //ajax call
    jQuery.ajax({
        type: "POST",
        url: td_ajax_url,
        data: {
            action: 'td_ajax_register_forum_user',
            envato_code: envatoCode,
            username: userName,
            email: email,
            password: password,
            password_confirmation: passwordConfirmation
        },
        success: function( data, textStatus, XMLHttpRequest ) {
            //hide - loading button
            submitButton.removeClass('td-activate-button-loading');
            registrationInputs.prop('disabled', false);
            submitButton.prop('disabled', false);

            td_forum_process_response(data);
        },
        error: function( MLHttpRequest, textStatus, errorThrown ) {
            //console.log(errorThrown);
        }
    });
}



/**
 * manual activation response
 * @param data
 */
function td_manual_activation_response(data) {
    var currentCode = jQuery('.td-manual-envato-code input').val(),
        td_data_object = jQuery.parseJSON(data); //get the data object

    //clear empty spaces
    currentCode = currentCode.replace(/\s+/g, '');

    //drop the result - it's from a old query
    if ( td_data_object.envato_code !== currentCode ) {
        return;
    }

    if (td_data_object.theme_activated === true) {
        tdConfirm.showModalOk('Theme activation',
            'Theme successfully activated using manual activation. Thanks for buying our product.',
            function() {
                //redirect
                window.location.replace('?page=td_theme_welcome');
            }
        );
        return;
    }

    //invalid code
    jQuery('.td-manual-activation-failed').show();
}


/**
 * theme manual activation
 */
function td_theme_manual_activation() {
    //form data
    var serverId = jQuery('.td-manual-server-id input').val(),
        envatoCodeContainer = jQuery('.td-manual-envato-code'),
        envatoCodeInput = envatoCodeContainer.find('input'),
        envatoCode = envatoCodeInput.val(),
        tdKeyContainer = jQuery('.td-manual-activation-key'),
        tdKeyInput = tdKeyContainer.find('input'),
        tdKey = tdKeyInput.val(),
        submitButton = jQuery('.td-manual-activate-button'),
        inputError = false;

    //empty server id
    if (serverId.length === 0) {
        return;
    }

    //empty envato code
    if (envatoCode.length === 0) {
        envatoCodeContainer.addClass('td-err');
        envatoCodeContainer.find('.td-manual-envato-code-missing').show();
        inputError = true;
    }

    //empty activation key
    if (tdKey.length === 0) {
        tdKeyContainer.addClass('td-err');
        tdKeyContainer.find('.td-manual-activation-key-missing').show();
        inputError = true;
    }

    if (inputError === true) {
        return;
    }

    //show - loading button
    submitButton.prop('disabled', true);
    envatoCodeInput.prop('disabled', true);
    tdKeyInput.prop('disabled', true);
    submitButton.addClass('td-activate-button-loading');

    //ajax call
    jQuery.ajax({
        type: "POST",
        url: td_ajax_url,
        data: {
            action: 'td_ajax_manual_activation',
            envato_code: envatoCode,
            td_server_id: serverId,
            td_key: tdKey
        },
        success: function( data, textStatus, XMLHttpRequest ) {
            //hide - loading button
            submitButton.removeClass('td-activate-button-loading');
            envatoCodeInput.prop('disabled', false);
            tdKeyInput.prop('disabled', false);
            submitButton.prop('disabled', false);

            td_manual_activation_response(data);
        },
        error: function( MLHttpRequest, textStatus, errorThrown ) {
            //console.log(errorThrown);
        }
    });
}



/**
 * wp-admin > theme panel > activate
 */
function td_theme_activation() {
    //check envato code
    jQuery('.td-envato-code-button').on('click', function(){
        td_envato_code_check();
    });

    //theme activation - register new user on forum
    jQuery('.td-registration-button').on('click', function(){
        td_register_forum_user();
    });

    //theme activation - on keydown - hide envato code errors
    jQuery('.td-envato-code input').keydown(function(event){
        if ( ( event.which && 13 === event.which ) ||
            ( event.keyCode && 13 === event.keyCode )) {
            //on enter trigger click on "Activate" button
            event.preventDefault();
            jQuery('.td-envato-code-button').trigger('click');
            return;
        }
        var envatoCodeContainer = jQuery('.td-envato-code');
        envatoCodeContainer.removeClass('td-err');
        envatoCodeContainer.find('.td-activate-err').hide();
    });

    //theme activation - on keydown - hide forum user registration form errors
    jQuery('.td-activate-registration input').keydown(function(event){
        var currentInput = jQuery(this),
            currentInputContainer = currentInput.parent(),
            currentInputErrors = currentInputContainer.find('.td-activate-err');

        //hide errors
        currentInputContainer.removeClass('td-err');
        currentInputErrors.hide();

        //on enter trigger submit
        if (( event.which && 13 === event.which ) ||
            ( event.keyCode && 13 === event.keyCode )) {
            jQuery('.td-registration-button').trigger('click');
            return;
        }
    });

    //manual activation
    jQuery('.td-manual-activate-button').on('click', function(){
        td_theme_manual_activation();
    });

    //manual activation - on keydown - hide errors
    jQuery('.td-manual-activation input').keydown(function(event){
        var currentInput = jQuery(this),
            currentInputContainer = currentInput.parent(),
            currentInputErrors = currentInputContainer.find('.td-activate-err');

        //hide errors
        currentInputContainer.removeClass('td-err');
        currentInputErrors.hide();

        //on enter trigger submit
        if (( event.which && 13 === event.which ) ||
            ( event.keyCode && 13 === event.keyCode )) {
            jQuery('.td-manual-activate-button').trigger('click');
            return;
        }
    });
}