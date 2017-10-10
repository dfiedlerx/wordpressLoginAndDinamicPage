<?php

function td_first_install_setup() {
    $td_isFirstInstall = td_util::get_option('firstInstall');
    if (empty($td_isFirstInstall)) {
    	td_options::update('firstInstall', 'themeInstalled');
        //td_util::update_option('firstInstall', 'themeInstalled');

        wp_insert_term('Featured', 'category', array(
            'description' => 'Featured posts',
            'slug' => 'featured',
            'parent' => 0
        ));

        // bulk enable all the theme thumbs!
        $td_theme_thumbs = td_api_thumb::get_all();
        foreach ($td_theme_thumbs as $td_theme_thumb_id => $td_theme_thumb_params) {
        	td_options::update('tds_thumb_' . $td_theme_thumb_id, 'yes');
            //td_global::$td_options['tds_thumb_' . $td_theme_thumb_id] = 'yes';
        }
        //update_option(TD_THEME_OPTIONS_NAME, td_global::$td_options); // force an update of the options ()

    }
}
td_first_install_setup();



function td_after_theme_is_activated() {
    global $pagenow;
    if ( is_admin() && 'themes.php' == $pagenow && isset( $_GET['activated'] ) ) {
        wp_redirect(admin_url('admin.php?page=td_theme_welcome'));
        exit;
    }
}
td_after_theme_is_activated();





/*
 * 'td_timestamp_install_plugins' possible values:
 * 1. (empty string) : td_auto_install_plugins will do plugin installation
 * 2. timestamp: td_auto_install_plugins will try a new plugin installation over 180 seconds (it will try to do this 3 times)
 * 3. 'install': td_auto_install_plugins will do nothing next time
 */
function td_check_install_plugins() {

	// Temporary available only for 'ionMag' or 'Newspaper'
	if ( TD_DEPLOY_MODE == 'dev' || TD_DEPLOY_MODE == 'demo') {
		return;
	}

	$td_db_version = td_util::get_option('td_version');

	if ($td_db_version != TD_THEME_VERSION) {

		$install_attempt = 0;

		// Reset 'td_timestamp_install_plugins' flag to the current time (we wait 180 seconds till to the next retry)
		// 'td_timestamp_install_plugins' possible values:
	    //      1. '' (empty string): td_auto_install_plugins will do plugin installation
	    //      2. timestamp-index: td_auto_install_plugins will try a new plugin installation over 180 seconds (it will try to do this 3 times)
	    //      3. 'install': td_auto_install_plugins will do nothing next time
		td_util::update_option('td_timestamp_install_plugins', time() . '-' .  $install_attempt );

		// Install plugins - add action to 'tgmpa_register' with 11 priority, to be sure the plugins have been registered
		add_action('tgmpa_register', 'td_auto_install_plugins', 11);

	} else {

		$td_timestamp_install_plugins = td_util::get_option('td_timestamp_install_plugins');

		if ('installed' !== $td_timestamp_install_plugins ) {

			$install_attempt = 0;

			$settings = explode( '-', $td_timestamp_install_plugins );

			if ( ! empty( $td_timestamp_install_plugins ) ) {
				if ( count( $settings ) !== 2 ) {
					// Bail out, some strange value has been set.
					return;
				}
				$install_attempt = intval( $settings[1] ) + 1;
			}

			$timestamp = $settings[0];


			if ( time() < intval( $timestamp ) + 3 * MINUTE_IN_SECONDS ) {
				// 180 seconds not elapsed
				return;
			}

			if ( $install_attempt > 3 ) {
				// at least 3 attempts have been done

				td_util::update_option( 'td_timestamp_install_plugins', 'installed' );

				return;
			}

			// Reset 'td_timestamp_install_plugins' flag to the current time (we wait 180 seconds till to the next retry)
			// 'td_timestamp_install_plugins' possible values:
			//      1. '' (empty string): td_auto_install_plugins will do plugin installation
			//      2. timestamp-index: td_auto_install_plugins will try a new plugin installation over 180 seconds (it will try to do this 3 times)
			//      3. 'install': td_auto_install_plugins will do nothing next time
			td_util::update_option( 'td_timestamp_install_plugins', time() . '-' . $install_attempt );

			// Install plugins - add action to 'tgmpa_register' with 11 priority, to be sure the plugins have been registered
			add_action( 'tgmpa_register', 'td_auto_install_plugins', 11 );
		}
	}
}
td_check_install_plugins();


function td_auto_install_plugins() {

	if ( ! current_user_can('install_plugins')) {
		return;
	}

	global $wp_filesystem;

	require_once(ABSPATH . 'wp-admin/includes/file.php');
	require_once(ABSPATH . 'wp-admin/includes/plugin-install.php');
	require_once(ABSPATH . 'wp-admin/includes/class-wp-upgrader.php');
	require_once(ABSPATH . 'wp-admin/includes/plugin.php');


	$instance = call_user_func(array(get_class( $GLOBALS['tgmpa']), 'get_instance'));

	// Add props like 'file_path' to registered plugins
	$instance->populate_file_path();



//		echo 'GET_PLUGINS';
//		var_dump(get_plugins());
//		echo 'INSTANCE_PLUGINS';
//		var_dump($instance->plugins);
//      die;



	WP_Filesystem();

	$skin = new Automatic_Upgrader_Skin();
	$upgrader = new WP_Upgrader($skin);

	foreach ($instance->plugins as $plugin) {

		if (!isset($plugin['td_install']) || !$plugin['td_install']) {
			continue;
		}


		// Delete existing plugin

		$existing_plugin_dir_path = $wp_filesystem->find_folder(WP_PLUGIN_DIR . '/' . $plugin['slug']);
		$removed = $upgrader->clear_destination($existing_plugin_dir_path);

		if (is_wp_error($removed)) {
			// $removed->get_error_message();
			// error message must be registered somewhere
			continue;
		}


		// Install plugin

		$download = $upgrader->download_package($plugin['source']);
		if (is_wp_error($download)) {
			// error message must be registered somewhere
			continue;
		}

		// Don't accidentally delete a local file.
        $delete_package = ($download !== $plugin['source']);

		$working_dir = $upgrader->unpack_package($download, $delete_package);

		if (is_wp_error($working_dir)) {
			// $working_dir->get_error_message();
			// error message must be registered somewhere
			continue;
		}

		$install_result = $upgrader->install_package(array(
			'source'                      => $working_dir,
			'destination'                 => WP_PLUGIN_DIR,
			'clear_destination'           => false,
			'abort_if_destination_exists' => false,
			'clear_working'               => true,
			'hook_extra'                  => array(
				'type'   => 'plugin',
				'action' => 'install',
			),
		) );

		if (is_wp_error($install_result)) {
			// $install_result->get_error_message();
			// error message must be registered somewhere
			continue;
		}
	}

	// Force refresh of plugin update information
	wp_clean_plugins_cache();

	//var_dump(get_plugins());

	foreach ($instance->plugins as $plugin) {

		// Activate plugin

		if (isset($plugin['td_activate']) && $plugin['td_activate']) {

			// Important! For the new installed plugins the 'file_path' is just the plugin name, but for the already existing plugins the 'file_path' is something like "PLUGIN NAME / PLUGIN NAME . PHP"
			$plugin_file_path = $plugin['file_path'];
			if ( ! strpos( $plugin_file_path, '.php') ) {
				$plugin_file_path = $plugin['file_path'] . '/' . $plugin['file_path'] . '.php';
			}

			$activate_result = activate_plugin( $plugin_file_path , '', false, true );

			if (is_wp_error($activate_result)) {
				//echo $activate_result->get_error_message();
				// error message must be registered somewhere
				continue;
			}
		}
	}

	// 'td_timestamp_install_plugins' possible values:
    //      1. (empty string) : td_auto_install_plugins will do plugin installation
    //      2. timestamp: td_auto_install_plugins will try a new plugin installation over 180 seconds (it will try to do this 3 times)
    //      3. 'install': td_auto_install_plugins will do nothing next time
	td_util::update_option('td_timestamp_install_plugins', 'installed');
}


function td_theme_migration() {
	$td_db_version = td_util::get_option('td_version');


    // empty -> any version
	if (empty($td_db_version)) {

		// wp_parse_args format
		$args = array(
			'post_type' => array('page', 'post'),
			'numberposts' => '200',
			'orderby' => 'post_date',
			'order' => 'DESC',

			'meta_query' => array(
				'relation' => 'OR',
				array('key' => 'td_homepage_loop_filter'),
				array('key' => 'td_unique_articles'),
				array('key' => 'td_smart_list'),
				array('key' => 'td_review')
			),
			'update_post_term_cache' => false,
		);

		$recent_posts = wp_get_recent_posts($args);

		foreach ($recent_posts as $recent_post) {

			// page settings
			$update_td_homepage_loop = false;
			$td_homepage_loop = td_util::get_post_meta_array($recent_post['ID'], 'td_homepage_loop');
			$td_page = td_util::get_post_meta_array($recent_post['ID'], 'td_page');
			$td_homepage_loop_filter = td_util::get_post_meta_array($recent_post['ID'], 'td_homepage_loop_filter');
			$td_unique_articles = td_util::get_post_meta_array($recent_post['ID'], 'td_unique_articles');

			if (!empty($td_homepage_loop_filter) and is_array($td_homepage_loop_filter) and (count($td_homepage_loop_filter) > 0)) {
				foreach ($td_homepage_loop_filter[0] as $filter_key => $filter_value) {
					$td_homepage_loop[0][$filter_key] = $filter_value;
				}
				$update_td_homepage_loop = true;
			}

			if (!empty($td_unique_articles) and is_array($td_unique_articles) and (count($td_unique_articles) > 0)) {
				foreach ($td_unique_articles[0] as $filter_key => $filter_value) {
					$td_homepage_loop[0][$filter_key] = $filter_value;
					$td_page[0][$filter_key] = $filter_value;
				}
				$update_td_homepage_loop = true;
			}

			if ($update_td_homepage_loop === true) {
				update_post_meta($recent_post['ID'], 'td_homepage_loop', $td_homepage_loop[0]);
				update_post_meta($recent_post['ID'], 'td_page', $td_page[0]);
			}





			// post settings
			$update_td_post_theme_settings = false;
			$td_post_theme_settings = td_util::get_post_meta_array($recent_post['ID'], 'td_post_theme_settings');
			$td_smart_list = td_util::get_post_meta_array($recent_post['ID'], 'td_smart_list');
			$td_review = td_util::get_post_meta_array($recent_post['ID'], 'td_review');

			if (!empty($td_review) and is_array($td_review) and (count($td_review) > 0)) {
				foreach ($td_review[0] as $filter_key => $filter_value) {
					$td_post_theme_settings[0][$filter_key] = $filter_value;
				}
				$update_td_post_theme_settings = true;
			}

			if (!empty($td_smart_list) and is_array($td_smart_list) and (count($td_smart_list) > 0)) {
				foreach ($td_smart_list[0] as $filter_key => $filter_value) {
					$td_post_theme_settings[0][$filter_key] = $filter_value;
				}
				$update_td_post_theme_settings = true;
			}

			if ($update_td_post_theme_settings === true) {
				update_post_meta($recent_post['ID'], 'td_post_theme_settings', $td_post_theme_settings[0]);
			}

			//delete_post_meta($recent_post['ID'], 'td_homepage_loop_filter');
			//delete_post_meta($recent_post['ID'], 'td_unique_articles');
			//delete_post_meta($recent_post['ID'], 'td_smart_list');
			//delete_post_meta($recent_post['ID'], 'td_review');
		}

		// the following delete operations must be done
		//delete_post_meta_by_key('td_homepage_loop_filter');
		//delete_post_meta_by_key('td_unique_articles');
		//delete_post_meta_by_key('td_smart_list');
		//delete_post_meta_by_key('td_review');
	}


	// update the database version
    if ($td_db_version != TD_THEME_VERSION) {
        td_util::update_option('td_version', TD_THEME_VERSION);
    }
}
td_theme_migration();
