<?php
/**
 * Created by PhpStorm.
 * User: lucian
 * Date: 2/21/2017
 * Time: 2:18 PM
 */
class td_block_pinterest extends td_block {

    /**
     * Disable loop block features. This block does not use a loop and it dosn't need to run a query.
     */
    function __construct() {
        parent::disable_loop_block_features();
    }


    function render($atts, $content = null) {

        parent::render($atts); // sets the live atts, $this->atts, $this->block_uid, $this->td_query (it runs the query)

        if (empty($td_column_number)) {
            $td_column_number = td_global::vc_get_column_number(); // get the column width of the block from the page builder API
        }

        $buffy = ''; //output buffer
        $buffy .= '<div class="' . $this->get_block_classes() . '" ' . $this->get_block_html_atts() . '>';

        //get the block js
        $buffy .= $this->get_block_css();

        // block title wrap
        $buffy .= '<div class="td-block-title-wrap">';
            $buffy .= $this->get_block_title();
            $buffy .= $this->get_pull_down_filter(); //get the sub category filter for this block
        $buffy .= '</div>';
	    
        $buffy .= '<div id=' . $this->block_uid . ' class="td-pinterest-wrap td_block_inner td-column-' . $td_column_number . '">';
        $buffy.= td_pinterest::render_generic($atts);
        $buffy .= '</div>';
        $buffy .= '</div> <!-- ./block -->';
        return $buffy;
    }
}