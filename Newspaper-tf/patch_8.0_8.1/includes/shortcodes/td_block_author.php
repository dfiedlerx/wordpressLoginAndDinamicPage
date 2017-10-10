<?php
class td_block_author extends td_block {


    function render($atts, $content = null) {
        parent::render($atts);

        extract(shortcode_atts(
            array(
                'author_id' => '1', // ID 1 for admin
                'author_url_text' => '',
                'author_url' => '',
                'open_in_new_window' => ''
            ), $atts));

        $td_target = '';
        if (!empty($open_in_new_window)) {
            $td_target = ' target="_blank"';
        }

        $td_author = get_user_by( 'id', $author_id );

	    if ( false === $td_author ) {
		    $buffy = '';
		    $buffy .= '<div class="' . $this->get_block_classes() . '" ' . $this->get_block_html_atts() . '>';
			    $buffy .= '<div class="td_author_wrap">';
				    $buffy .= '<a href="#">' . get_avatar('', '196') . '</a>';

				    $buffy .= '<div class="item-details">';
					    $buffy .= '<div class="td-author-name">';
				        $buffy .= '<a href="#">Author name</a>';
					    $buffy .= '</div>';
				    $buffy .= '</div>';
			    $buffy .= '</div>';
		    $buffy .= '</div>';
		    return $buffy;
	    }




        $buffy = '';
        $buffy .= '<div class="' . $this->get_block_classes() . '" ' . $this->get_block_html_atts() . '>';


        //get the block css
        $buffy .= $this->get_block_css();

        // block title wrap
        $buffy .= '<div class="td-block-title-wrap">';
            $buffy .= $this->get_block_title(); //get the block title
            $buffy .= $this->get_pull_down_filter();
        $buffy .= '</div>';


        $buffy .= '<div class="td_author_wrap">';
        $buffy .= '<a href="' . get_author_posts_url($td_author->ID) . '">' . get_avatar($td_author->user_email, '196') . '</a>';
        $buffy .= '<div class="item-details">';

        $buffy .= '<div class="td-author-name">';
        $buffy .= '<a href="' . get_author_posts_url($td_author->ID) . '">' . $td_author->display_name . '</a>';
        $buffy .= '</div>';

        $buffy .= '<div class="td-author-description">';
        $buffy .= $td_author->description;
        $buffy .= '</div>';

        if(!empty($author_url_text)) {
            $buffy .= '<div class="td-author-page">';
            $buffy .= '<a href="' . $author_url . '"' . $td_target . '>' . $author_url_text . '</a>';
            $buffy .= '</div>';
        }

        $buffy .= '</div>';

        $buffy .= '</div>';

        $buffy .= '</div>';


        return $buffy;

    }
}