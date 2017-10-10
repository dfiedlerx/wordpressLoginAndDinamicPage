<?php

/**
 *
 * Class td_block_big_grid_fl_10
 */
class td_block_big_grid_fl_10 extends td_block {

    const POST_LIMIT = 5;

    function render($atts, $content = null){

        // for big grids, extract the td_grid_style
        extract(shortcode_atts(
            array(
                'td_grid_style' => 'td-grid-style-1'
            ), $atts));


        $atts['limit'] = self::POST_LIMIT;

        parent::render($atts); // sets the live atts, $this->atts, $this->block_uid, $this->td_query (it runs the query)


        $buffy = '';

        $buffy .= '<div class="' . $this->get_block_classes(array($td_grid_style, 'td-hover-1 td-big-grids-fl td-big-grids-scroll td-big-grids-margin')) . '" ' . $this->get_block_html_atts() . '>';
            //get the block css
            $buffy .= $this->get_block_css();

            $buffy .= '<div id=' . $this->block_uid . ' class="td_block_inner">';
                $buffy .= $this->inner($this->td_query->posts, $this->get_att('td_column_number')); //inner content of the block
            $buffy .= '</div>';
        $buffy .= '</div> <!-- ./block -->';
        return $buffy;
    }

    function inner($posts, $td_column_number = '') {

        $buffy = '';


        $td_block_layout = new td_block_layout();

        if (!empty($posts)) {

            if ($td_column_number==1 || $td_column_number==2) {
                $buffy .= td_util::get_block_error('Big grid full 10', 'Please move this shortcode on a full row in order for it to work.');
            } else {

                $td_count_posts = count($posts); // post count number

                $buffy .= '<div class="td-big-grid-wrapper td-posts-' . $td_count_posts . '">';

                $post_count = 0;

                // when 3 posts make post scroll full
                $td_scroll_posts = '';
                if (count($posts) == 3) {
                    $td_scroll_posts = ' td-scroll-full';
                }

                foreach ($posts as $post) {

                    if ($post_count == 0) {
                        $buffy .= '<span class="td-big-grid-column">';
                    }

                    if ($post_count < 2) {
                        $td_module_mx25 = new td_module_mx25($post);
                        $buffy .= $td_module_mx25->render($post_count);

                        $post_count++;
                        continue;
                    }

                    if ($post_count == 2) {
                        $buffy .= '<div class="clearfix"></div>';
                        $buffy .= '</span>';
                        $buffy .= '<div class="td-big-grid-scroll' . $td_scroll_posts . '">';
                    }

                    if ($post_count == 2) {
                        $td_module_mx19 = new td_module_mx19($post);
                        $buffy .= $td_module_mx19->render($post_count);
                        $post_count++;
                        continue;
                    }

                    if ($post_count == 3) {
                        $td_module_mx25 = new td_module_mx25($post);
                        $buffy .= $td_module_mx25->render($post_count);

                        $post_count++;
                        continue;
                    }

                    if ($post_count == 4) {
                        $td_module_mx25 = new td_module_mx25($post);
                        $buffy .= $td_module_mx25->render($post_count);

                        $post_count++;
                        continue;
                    }

                    $post_count++;
                }

                if ($post_count < self::POST_LIMIT) {

                    for ($i = $post_count; $i < self::POST_LIMIT; $i++) {

                        if ($post_count == 0) {
                            $buffy .= '<span>';
                        }

                        if ($post_count < 2) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx25');

                            $post_count++;
                            continue;
                        }

                        if ($post_count == 2) {
                            $buffy .= '<div class="clearfix"></div>';
                            $buffy .= '</span>';
                            $buffy .= '<div class="td-big-grid-scroll' . $td_scroll_posts . '">';
                        }

                        if ($post_count == 2) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx19');
                            $post_count++;
                            continue;
                        }

                        if ($post_count == 3) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx25');

                            $post_count++;
                            continue;
                        }

                        if ($post_count == 4) {
                            $td_module_mx_empty = new td_module_mx_empty();
                            $buffy .= $td_module_mx_empty->render($i, 'td_module_mx25');

                            $post_count++;
                            continue;
                        }

                        $post_count++;
                    }
                }

                $buffy .= '</div>';  // close td-big-grid-scroll
                $buffy .= '<div class="clearfix"></div>';
                $buffy .= '</div>'; // close td-big-grid-wrapper
            }
        }

        $buffy .= $td_block_layout->close_all_tags();
        return $buffy;
    }
}