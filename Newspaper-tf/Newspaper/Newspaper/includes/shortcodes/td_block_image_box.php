<?php
class td_block_image_box extends td_block {

	private $atts = array(); //the atts used for rendering the current block

	function render($atts, $content = null) {
		parent::render($atts);

		$this->atts = shortcode_atts(
			array(
				'height' => '',
				'gap' => '',
				'display' => '',
				'alignment' => '',
				'style' => '',


				'image_title_item0' => '',
				'custom_url_item0' => '#',
				'open_in_new_window_item0' => '',
				'image_item0' => '',

				'image_title_item1' => '',
				'custom_url_item1' => '#',
				'open_in_new_window_item1' => '',
				'image_item1' => '',

				'image_title_item2' => '',
				'custom_url_item2' => '#',
				'open_in_new_window_item2' => '',
				'image_item2' => '',

				'image_title_item3' => '',
				'custom_url_item3' => '#',
				'open_in_new_window_item3' => '',
				'image_item3' => '',

			), $atts);

		$items = array();
		for ($i = 0; $i < 4; $i++ ) {
			if ( ! empty( $this->atts['image_item' . $i] ) ) {
				$items[] = array(
					'image_title' => $this->atts['image_title_item' . $i],
					'custom_url' => $this->atts['custom_url_item' . $i],
					'open_in_new_window' => $this->atts['open_in_new_window_item' . $i],
					'image' => $this->atts['image_item' . $i],
				);
			}
		}



		// height
		$box_height = '';
		$height = $this->atts['height'];

		if( !empty($height) ) {
			//the user height value, verified for a 'px' matching
			if ( strpos($height, 'px') !== false ) {
				$box_height = ' height:  ' . $height;
			} else {
				$box_height = ' height: ' . $height . 'px';
			}
		}

		// gap
		$box_gap_padding = '';
		$box_gap_margin = '';

		if( !empty($this->atts['gap']) ) {

			$gap = $this->atts['gap'];

			//the user gap value, verified for a 'px' matching
			if ( strpos($gap, 'px') !== false ) {
				$box_gap_padding = 'padding-left: ' . $gap . '; padding-right: ' . $gap . ';';
				$box_gap_margin = 'margin-left: -' . $gap . '; margin-right: -' . $gap . ';';
			} else {
				$box_gap_padding = 'padding-left: ' . $gap . 'px; padding-right: ' . $gap . 'px;';
				$box_gap_margin = 'margin-left: -' . $gap . 'px; margin-right: -' . $gap . 'px;';
			}
		}

		// layout
		$box_space = '';

		// additional classes
		$additional_classes = array();

		if(!empty($this->atts['display'])) {
			$additional_classes [] = 'td-box-vertical';

			if(!empty($gap)) {
				if ( strpos($gap, 'px') !== false ) {
					$box_space = ' margin-bottom: ' . $gap . ';';
				} else {
					$box_space = ' margin-bottom: ' . $gap . 'px;';
				}
			}
		}

		// alignment
		if(!empty($this->atts['alignment'])) {
			$additional_classes[] = 'td-image-box-' . $this->atts['alignment'];
		}

		// style
		if(!empty($this->atts['style'])) {
			$additional_classes[] = 'td-image-box-' . $this->atts['style'];
		}

		$buffy = '';
		$buffy .= '<div class="' . $this->get_block_classes($additional_classes) . '" ' . $this->get_block_html_atts() . '>';

		//get the block css
		$buffy .= $this->get_block_css();

		// block title wrap
		$buffy .= '<div class="td-block-title-wrap">';
			$buffy .= $this->get_block_title();
			$buffy .= $this->get_pull_down_filter(); //get the sub category filter for this block
		$buffy .= '</div>';

		switch(count($items)) {
			case 1: $css_class = 'td-big-image'; break;
			case 2: $css_class = 'td-medium-image'; break;
			case 3: $css_class = 'td-small-image'; break;
			case 4: $css_class = 'td-tiny-image'; break;
		}

		if ( isset($css_class) ) {

			$buffy .= '<div class="td-image-box-row ' . $css_class . '" style="' . $box_gap_margin . '">';
				foreach($items as $item) {

					$buffy .= '<div class="td-image-box-span" style="' . $box_gap_padding .  $box_space . '">';

					$target = '';
					$no_custom_url = '';

					if ( '' !== $item[ 'open_in_new_window' ] ) {
						$target = ' target="_blank" ';
					}

					if ( '#' == $item[ 'custom_url' ] ) {
						$no_custom_url = ' td-no-img-custom-url';
					}

					$buffy .= '<div class="td-custom">';
						$buffy .= '<div class="td-custom-image' . $no_custom_url . '">';
						$buffy .= '<a style="background-image: url(\'' . wp_get_attachment_url($item[ 'image' ]) . '\');' . $box_height . '" href="' . $item[ 'custom_url' ] . '" ' . $target . ' rel="bookmark" title="' . $item[ 'image_title' ] . '"></a>';
						$buffy .= '</div>';
						$buffy .= '<div class="td-custom-title">';
						$buffy .= '<h3 class="entry-title"><a href="' . $item[ 'custom_url' ] . '">' . $item[ 'image_title' ] . '</a></h3>';
						$buffy .= '</div>';
					$buffy .= '</div>';

					$buffy .= '</div>';
				}
			$buffy .= '</div>';

		} else {

			$buffy .= '<div class="td-image-box-row td-small-image" style="' . $box_gap_margin . '">';

			$index = 0;
			while($index < 3) {
				$buffy .= '<div class="td-image-box-span" style="' . $box_gap_padding . $box_space . '">';
					$buffy .= '<div class="td-custom">';
						$buffy .= '<div class="td-custom-image td-no-img-custom-url">';
						$buffy .= '<a href="#" rel="bookmark" title="Custom title"></a>';
						$buffy .= '</div>';
						$buffy .= '<div class="td-custom-title">';
						$buffy .= '<h3 class="entry-title"><a href="#">Custom title</a></h3>';
						$buffy .= '</div>';
					$buffy .= '</div>';
				$buffy .= '</div>';

				$index++;
			}
			$buffy .= '</div>';
		}

		$buffy .= '</div>';


		return $buffy;
	}
}