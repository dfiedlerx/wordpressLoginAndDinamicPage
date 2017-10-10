<?php
/**
 * Created by PhpStorm.
 * User: tagdiv
 * Date: 11.05.2017
 * Time: 10:04
 */

class td_block_title extends td_block {

	/**
	 * Disable loop block features. This block does not use a loop and it dosn't need to run a query.
	 */
	function __construct() {
		parent::disable_loop_block_features();
	}


    function render($atts, $content = null) {

	    if ( empty( $atts[ 'custom_title' ] ) ) {
			$atts['custom_title'] = 'Block title';
		}

        parent::render($atts); // sets the live atts, $this->atts, $this->block_uid, $this->td_query (it runs the query


		$buffy = '';
        $buffy .= '<div class="' . $this->get_block_classes() . '" ' . $this->get_block_html_atts() . '>';

		    //get the block js
		    $buffy .= $this->get_block_css();

            $buffy .= $this->get_block_title();
	        $buffy .= $this->get_pull_down_filter(); //get the sub category filter for this block

            $buffy .= '<div class="td_mod_wrap">';

	    $buffy .= '</div>';
        $buffy .= '</div>';

        return $buffy;
    }
}