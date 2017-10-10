<?php

/**
 *
 * Class td_block_big_grid_8
 */
class td_block_big_grid_8 extends td_block {

    const POST_LIMIT = 7;

    function render($atts, $content = null){

        // for big grids, extract the td_grid_style
        extract(shortcode_atts(
            array(
                'td_grid_style' => 'td-grid-style-1'
            ), $atts));


        $atts['limit'] = self::POST_LIMIT;

        parent::render($atts); // sets the live atts, $this->atts, $this->block_uid, $this->td_query (it runs the query)


        $buffy = '';

        $buffy .= '<div class="' . $this->get_block_classes(array($td_grid_style, 'td-hover-1 td-big-grids')) . '" ' . $this->get_block_html_atts() . '>';

		    //get the block css
		    $buffy .= $this->get_block_css();

            $buffy .= '<div id=' . $this->block_uid . ' class="td_block_inner">';
                $buffy .= $this->inner($this->td_query->posts, $this->get_att('td_column_number')); //inner content of the block
                $buffy .= '<div class="clearfix"></div>';
            $buffy .= '</div>';
        $buffy .= '</div> <!-- ./block -->';
        return $buffy;
    }

    function inner($posts, $td_column_number = '') {

        $buffy = '';

        if (!empty($posts)) {

            if ($td_column_number==1 || $td_column_number==2) {
                $buffy .= td_util::get_block_error('Big grid 8', 'Please move this shortcode on a full row in order for it to work.');
            } else {

                $buffy .= '<div class="td-big-grid-wrapper">';

                $post_count = 0;

                // when 2 posts make post scroll full
                $td_scroll_posts = '';
                if (count($posts) == 3) {
                    $td_scroll_posts = ' td-scroll-full';
                }

                foreach ($posts as $post) {

                    // group 1
                    if ($post_count == 0) {
                        $buffy .= '<div class="td-grid-columns td-grid-group-1">';
                        $td_module_mx14 = new td_module_mx14($post);
                        $buffy .= $td_module_mx14->render($post_count);
                        $post_count++;
                        continue;
                    }
                    if ($post_count == 1) {
                        $td_module_mx12 = new td_module_mx12($post);
                        $buffy .= $td_module_mx12->render($post_count);
                        $post_count++;
                        continue;
                    }


                    // group 2
                    if ($post_count == 2) {
                        $buffy .= '</div>';
                        $buffy .= '<div class="td-big-grid-scroll' . $td_scroll_posts . '">';
                        $buffy .= '<div class="td-grid-columns td-grid-group-2">';
                    }
                    if ($post_count >= 2 && $post_count <= 4) {
                        $td_module_mx12 = new td_module_mx12($post);
                        $buffy .= $td_module_mx12->render($post_count);
                        $post_count++;
                        continue;
                    }


                    // group 3
                    if ($post_count == 5) {
                        $buffy .= '</div>';
                        $buffy .= '<div class="td-grid-columns td-grid-group-3">';
                        $td_module_mx12 = new td_module_mx12($post);
                        $buffy .= $td_module_mx12->render($post_count);
                        $post_count++;
                        continue;
                    }
                    if ($post_count == 6) {
                        $td_module_mx14 = new td_module_mx14($post);
                        $buffy .= $td_module_mx14->render($post_count);
                        $buffy .= '</div>';
                        $post_count++;
                        continue;
                    }
                }

                if ($post_count < self::POST_LIMIT) {

                    for ($i = $post_count; $i < self::POST_LIMIT; $i++) {

                        // group 1
                        if ( $post_count == 0 ) {
                            $buffy .= '<div class="td-grid-columns td-grid-group-1">';
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx14');
                            $post_count ++;
                        }
                        if ( $post_count == 1 ) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx12');
                            $post_count ++;;
                        }


                        // group 2
                        if ( $post_count == 2 ) {
                            $buffy .= '</div>';
                            $buffy .= '<div class="td-big-grid-scroll' . $td_scroll_posts . '">';
                            $buffy .= '<div class="td-grid-columns td-grid-group-2">';
                        }
                        if ( $post_count >= 2 && $post_count <= 4 ) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx12');
                            $post_count ++;
                        }


                        // group 3
                        if ( $post_count == 5 ) {
                            $buffy .= '</div>';
                            $buffy .= '<div class="td-grid-columns td-grid-group-3">';
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx12');
                            $post_count ++;
                        }
                        if ( $post_count == 6 ) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i,'$td_module_mx14');
                            $post_count ++;
                            $buffy .= '</div>';
                        }
                    }
                }

                    $buffy .= '</div>';  // close td-big-grid-scroll
                $buffy .= '</div>'; // close td-big-grid-wrapper
            }
        }

        return $buffy;
    }
}