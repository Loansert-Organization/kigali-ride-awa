import { useState, useEffect } from 'react';

// Simple translation keys for MVP
const translations = {
  en: {
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'save': 'Save',
    'delete': 'Delete',
    
    // Navigation
    'home': 'Home',
    'book': 'Book',
    'favorites': 'Favorites',
    'rewards': 'Rewards',
    'profile': 'Profile',
    'create_trip': 'Create Trip',
    'requests': 'Requests',
    
    // Trip related
    'from': 'From',
    'to': 'To',
    'departure_time': 'Departure Time',
    'vehicle_type': 'Vehicle Type',
    'seats_available': 'Seats Available',
    'fare': 'Fare',
    'book_ride': 'Book Ride',
    'post_trip': 'Post Trip',
    'find_matches': 'Find Matches',
    'contact_driver': 'Contact Driver',
    'whatsapp': 'WhatsApp',
    'payment_details': 'Payment Details',
    'route': 'Route',
    'driver': 'Driver',
    'total_amount': 'Total Amount',
    'connection_required': 'Connection required',
    'check_internet': 'Please check your internet connection',
    'missing_locations': 'Missing locations',
    'select_pickup_destination': 'Please select both pickup and destination locations',
    'trip_posted_local': 'Trip posted locally',
    'trip_saved_locally_desc': 'Your trip has been saved locally and will sync when online',
    'vehicle_required': 'Vehicle required',
    'add_vehicle_first_desc': 'Please add a vehicle first',
    'invalid_fare': 'Invalid fare',
    'enter_valid_fare': 'Please enter a valid fare amount',
    'trip_posted': 'Trip posted!',
    'trip_posted_description': 'Your trip has been posted and is now visible to passengers',
    'selected_location': 'Selected Location',
    'departure_location': 'Departure Location',
    'where_starting_from': 'Where are you starting from?',
    'destination': 'Destination',
    'where_are_you_going': 'Where are you going?',
    'when_plan_to_leave': 'When do you plan to leave?',
    'seats': 'Seats',
    'seat': 'seat',
    'seats_plural': 'seats',
    'fare_rwf': 'Fare (RWF)',
    'trip_summary': 'Trip Summary',
    'posting_trip': 'Posting trip...',
    'post_your_trip': 'Post Your Trip',
    'no_vehicles_found': 'No vehicles found',
    'need_add_vehicle': 'You need to add a vehicle before posting trips',
    'add_vehicle': 'Add Vehicle',
    'your_vehicle': 'Your Vehicle',
    'select_your_vehicle': 'Select your vehicle',
    
    // Vehicle types
    'moto': 'Motorcycle',
    'car': 'Car',
    'tuktuk': 'Tuk-Tuk',
    'minibus': 'Minibus',
    
    // Status
    'pending': 'Pending',
    'matched': 'Matched',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    
    // Messages
    'no_trips': 'No trips available',
    'trip_created': 'Trip created successfully',
    'booking_confirmed': 'Booking confirmed',
    'connection_error': 'Connection error. Please try again.',
    'offline_mode': 'Offline Mode',
    
    // Welcome & Onboarding
    'welcome': 'Welcome',
    'get_started': 'Get Started',
    'select_role': 'Select Your Role',
    'i_am_passenger': 'I\'m a Passenger',
    'i_am_driver': 'I\'m a Driver', 
    'passenger_desc': 'Book rides and travel with ease',
    'driver_desc': 'Offer rides and earn money',
    'continue': 'Continue',
    'skip': 'Skip',
    'enable_location': 'Enable Location',
    'location_desc': 'Help us find rides near you',
    'enable_notifications': 'Enable Notifications', 
    'notifications_desc': 'Get updates about your rides',
    'current_location': 'Current Location',
    'enter_pickup': 'Enter pickup location',
    'enter_destination': 'Enter destination',
    'when_travel': 'When do you want to travel?',
    'now': 'Now',
    'schedule': 'Schedule',
    'select_date': 'Select Date',
    'select_time': 'Select Time',
    'available_rides': 'Available Rides',
    'no_rides_available': 'No rides available',
    'book_now': 'Book Now',
    'contact': 'Contact',
    'trip_booked': 'Trip Booked!',
    'driver_details': 'Driver Details',
    'trip_details': 'Trip Details',
    'pickup_time': 'Pickup Time',
    'estimated_fare': 'Estimated Fare',
    'payment_cash': 'Payment: Cash/MoMo at pickup',
    'vehicle_info': 'Vehicle Information',
    'plate_number': 'Plate Number',
    'enter_plate': 'Enter plate number',
    'departure': 'Departure',
    'going_online': 'Going Online',
    'going_offline': 'Going Offline',
    'you_are_online': 'You are online and visible to passengers',
    'you_are_offline': 'You are offline and not visible to passengers',
    
    // Error handling
    'something_went_wrong': 'Something went wrong',
    'unexpected_error': 'The app encountered an unexpected error. You can try refreshing the page or going back.',
    'error_details': 'Error Details',
    'try_again': 'Try Again',
    'reload_page': 'Reload Page',
    'go_back': 'Go back',
    'go_to_home': 'Go to home',
    
    // Map and Location
    'map_error': 'Map Error',
    'location_error': 'Location Error',
    'location_detected': 'Location Detected',
    'location_selected': 'Location Selected',
    'search_error': 'Search Error',
    'search_location': 'Search for a location...',
    'confirm_location': 'Confirm Location',
    'loading_map': 'Loading map...',
    'failed_load_map': 'Failed to load map. Please check your internet connection.',
    'location_has_been_set': 'Location has been set from map',
    'failed_open_whatsapp': 'Failed to open WhatsApp. Please try again.',
    
    // Form placeholders and labels
    'enter_pickup_location': 'Enter pickup location',
    'enter_dropoff_location': 'Enter drop-off location',
    'choose_vehicle_type': 'Choose Vehicle Type',
    'enter_promo_code': 'Enter promo code',
    'search_country': 'Search for your country...',
    
    // Trip creation
    'confirm_trip': 'Confirm Trip',
    'failed_create_trip': 'Failed to Create Trip',
    'complete_route': 'Complete Route',
    'complete_details': 'Complete Details',
    'fill_required_details': 'Please fill in all required trip details',
    'login_required': 'Please log in to create a trip',
    'fill_required_fields': 'Please fill in all required fields',
    'complete_required_fields': 'Please complete all required fields',
    'ensure_logged_in': 'Please ensure you\'re logged in',
    'add_vehicle_first': 'Please add a vehicle first to post trips.',
    
    // General messages
    'permissions_skipped': 'Permissions Skipped',
    'select_country_manually': 'Please select your country manually',
    'failed_save_role': 'Failed to save role. Please try again.',
    'failed_accept_draft': 'Failed to accept draft. Please try again.',
    'country_detected': 'Country Detected',
    'auto_detection_failed': 'Auto-detection Failed',
    'detection_failed': 'Detection Failed',
    'we_detected_country': 'We detected you\'re in',
    'authentication_required': 'Authentication Required',
    'incomplete_trip': 'Incomplete Trip',
    'where_from': 'Where from?',
    'where_to': 'Where to?',  
    'youre_now_driver': 'You\'re now a driver!',
    'youre_now_passenger': 'You\'re now a passenger!',
    'detecting_location': 'Detecting Location...',
    'use_current_location': 'Use Current Location',
    'current_location_checkmark': 'Current Location ✓',
    'missing_departure_time': 'Missing Departure Time',
    'select_when_travel': 'Please select when you want to travel.',
    'request_created': 'Request Created!',
    'request_created_desc': 'Your ride request has been posted. Looking for matches...',
    'failed_create_request': 'Failed to create your ride request. Please try again.',
    'where_picked_up': 'Where do you want to be picked up?',
    
    // Welcome page
    'welcome_to_kigali_ride': 'Welcome to Kigali Ride',
    'connect_drivers_passengers': 'Connect drivers and passengers across Sub-Saharan Africa. Get started right away!',
    'allow_location_recommended': 'Allow Location (Recommended)',
    'for_better_matching': 'For better ride matching',
    'enable_notifications_optional': 'Enable Notifications (Optional)',
    'get_notified_matches': 'Get notified about ride matches',
    'permissions_granted': 'Permissions granted:',
    'continue_to_app': 'Continue to App →',
    'skip_permissions': 'Skip permissions and continue',
    'change_country': 'Change Country',
    'no_worries': 'No worries!',
    'use_app_manually': 'You can still use the app. Just enter locations manually when needed.',
    'country_set': 'Country Set!',
    'welcome_country_localized': 'Welcome to {country}! Pricing and features are now localized for you.',
    'user_session_not_found': 'User session not found. Please refresh the page.',
    'failed_save_role_desc': 'Failed to save role',
    'enable_later': 'You can always enable them later in your device settings.',
    
    // Settings page
    'settings': 'Settings',
    'language_settings': 'Language Settings',
    'select_language': 'Select Language',
    'language_updated': 'Language updated successfully',
    'failed_update_language': 'Failed to update language',
    'notification_settings': 'Notification Settings',
    'push_notifications': 'Push Notifications',
    'receive_trip_updates': 'Receive updates about your trips',
    'permission_denied': 'Permission denied',
    'enable_notifications_manually': 'Please enable notifications in your browser settings',
    'notifications_enabled_msg': 'Notifications enabled successfully',
    'notifications_disabled_msg': 'Notifications disabled',
    'privacy_settings': 'Privacy Settings',
    'location_sharing': 'Location Sharing',
    'share_location_for_rides': 'Share your location to find better rides',
    'location_sharing_enabled': 'Location sharing enabled',
    'location_sharing_disabled': 'Location sharing disabled',
    'whatsapp_integration': 'WhatsApp Integration',
    'whatsapp_status': 'WhatsApp Status',
    'whatsapp_connected': 'WhatsApp is connected and ready',
    'whatsapp_not_connected': 'WhatsApp is not connected',
    'manage_whatsapp': 'Manage WhatsApp',
    'connect_whatsapp': 'Connect WhatsApp',
    'account_settings': 'Account Settings',
    'edit_profile': 'Edit Profile',
    'notification_center': 'Notification Center',
    'delete_account': 'Delete Account',
    
    // Profile page
    'anonymous_user': 'Anonymous User',
    'trips': 'trips',
    'personal_information': 'Personal Information',
    'full_name': 'Full Name',
    'enter_full_name': 'Enter your full name',
    'phone_number': 'Phone Number',
    'enter_phone_number': 'Enter your phone number',
    'email_optional': 'Email (Optional)',
    'enter_email': 'Enter your email address',
    'address_optional': 'Address (Optional)',
    'enter_address': 'Enter your address',
    'statistics': 'Statistics',
    'total_trips': 'Total Trips',
    'completed_trips': 'Completed',
    'member_since': 'Member Since',
    'saving': 'Saving...',
    'save_changes': 'Save Changes',
    'profile_updated_successfully': 'Profile updated successfully',
    'failed_update_profile': 'Failed to update profile',
    
    // Notifications page
    'notifications': 'Notifications',
    'trip_matched': 'Trip Matched',
    'driver_found_for_trip': 'A driver has been found for your trip request',
    'payment_reminder': 'Payment Reminder',
    'complete_payment_for_trip': 'Please complete payment for your recent trip',
    'trip_completed': 'Trip Completed',
    'trip_completed_successfully': 'Your trip has been completed successfully',
    'welcome_message': 'Welcome Message',
    'failed_load_notifications': 'Failed to load notifications',
    'all_notifications_marked_read': 'All notifications marked as read',
    'notification_deleted': 'Notification deleted',
    'all_notifications_cleared': 'All notifications cleared',
    'no_notifications': 'No Notifications',
    'notifications_appear_here': 'Your notifications will appear here',
    'mark_all_read': 'Mark All Read',
    'clear_all': 'Clear All',
    'ago': 'ago',
    
    // WhatsApp Auth page
    'whatsapp_authentication': 'WhatsApp Authentication',
    'whatsapp_auth_description': 'We use WhatsApp to verify your phone number and keep you connected with drivers and passengers.',
    'invalid_phone': 'Invalid Phone Number',
    'enter_valid_rwanda_phone': 'Please enter a valid Rwanda phone number',
    'phone_already_registered': 'Phone Already Registered',
    'phone_exists_try_login': 'This phone number is already registered. Please try logging in instead.',
    'otp_sent': 'Code Sent',
    'check_whatsapp_for_code': 'Please check your WhatsApp messages for the verification code',
    'failed_send_otp': 'Failed to send verification code',
    'verify_code': 'Verify Code',
    'otp_sent_to': 'We sent a verification code to',
    'check_whatsapp_messages': 'Please check your WhatsApp messages',
    'verification_code': 'Verification Code',
    'invalid_otp': 'Invalid Code',
    'enter_6_digit_code': 'Please enter the 6-digit verification code',
    'verifying': 'Verifying...',
    'verify_connect': 'Verify & Connect',
    'whatsapp_connected_successfully': 'WhatsApp connected successfully',
    'invalid_otp_try_again': 'Invalid verification code. Please try again.',
    'otp_resent': 'Code Resent',
    'new_code_sent_whatsapp': 'A new verification code has been sent to your WhatsApp',
    'failed_resend_otp': 'Failed to resend verification code',
    'resend_code': 'Resend Code',
    'resend_in': 'Resend in',
    'change_phone_number': 'Change Phone Number',
    'whatsapp_connected': 'WhatsApp Connected!',
    'authentication_successful': 'Authentication was successful',
    'redirecting_automatically': 'You will be redirected automatically...',
    'rwanda_phone_format': 'Format: 0781234567 or +250781234567',
    'sending_code': 'Sending Code...',
    'send_whatsapp_code': 'Send WhatsApp Code',
    'secure_whatsapp_verification': 'Secure WhatsApp verification',
    
    // Trip History
    'trip_history': 'Trip History',
    'no_trips_yet': 'No trips yet',
    'start_creating_trips': 'Start creating trips to see them here',
    'view_details': 'View Details',
  },
  
  rw: {
    // Common
    'loading': 'Kuraguza...',
    'error': 'Ikosa',
    'success': 'Byagenze neza',
    'cancel': 'Kureka',
    'confirm': 'Kwemeza',
    'back': 'Subira',
    'next': 'Komeza',
    'save': 'Kubika',
    'delete': 'Gusiba',
    
    // Navigation
    'home': 'Ahabanza',
    'book': 'Gufata',
    'favorites': 'Byakunze',
    'rewards': 'Ibihembo',
    'profile': 'Umwirondoro',
    'create_trip': 'Gushyiraho Urugendo',
    'requests': 'Icyifuzo',
    
    // Trip related
    'from': 'Uhereye',
    'to': 'Ujya',
    'departure_time': 'Igihe cyo kugenda',
    'vehicle_type': 'Ubwoko bw\'ikinyabiziga',
    'seats_available': 'Intebe zihari',
    'fare': 'Ikiguzi',
    'book_ride': 'Gufata Urugendo',
    'post_trip': 'Gushyiraho Urugendo',
    'find_matches': 'Gushakisha',
    'contact_driver': 'Kuvugana n\'umushoferi',
    'whatsapp': 'WhatsApp',
    
    // Vehicle types
    'moto': 'Pikipiki',
    'car': 'Imodoka',
    'tuktuk': 'Tuktuk',
    'minibus': 'Minibusi',
    
    // Status
    'pending': 'Gutegereza',
    'matched': 'Byahuye',
    'completed': 'Byarangiye',
    'cancelled': 'Byahagaritswe',
    
    // Messages
    'no_trips': 'Nta ngendo zihari',
    'trip_created': 'Urugendo rwashyizweho neza',
    'booking_confirmed': 'Igifuzo cyemejwe',
    'connection_error': 'Ikibazo cy\'ukwihuza. Gerageza undi mukanya.',
    'offline_mode': 'Ntamurongo',
    // Complete localization
    'welcome': 'Murakaza neza',
    'get_started': 'Tangira',
    'select_role': 'Hitamo uruhare rwawe',
    'i_am_passenger': 'Ndi umugenzi',
    'i_am_driver': 'Ndi umushoferi',
    'passenger_desc': 'Fata ingendo kandi uguruke byoroshye',
    'driver_desc': 'Tanga ingendo kandi ubone amafaranga',
    'continue': 'Komeza',
    'skip': 'Simbuka',
    'enable_location': 'Emera aho uri',
    'location_desc': 'Dufashe gushaka ingendo hafi yawe',
    'enable_notifications': 'Emera amakuru',
    'notifications_desc': 'Habona amakuru kubyerekeye ingendo zawe',
    'current_location': 'Aho uri ubu',
    'enter_pickup': 'Andika aho uzatorwa',
    'enter_destination': 'Andika aho ugiye',
    'when_travel': 'Ni ryari ushaka kugenda?',
    'now': 'Ubu',
    'schedule': 'Gena igihe',
    'select_date': 'Hitamo itariki',
    'select_time': 'Hitamo igihe',
    'available_rides': 'Ingendo zihari',
    'no_rides_available': 'Nta ngendo zihari',
    'book_now': 'Fata ubu',
    'contact': 'Vugana',
    'trip_booked': 'Urugendo rwafashwe!',
    'driver_details': 'Amakuru y\'umushoferi',
    'trip_details': 'Amakuru y\'urugendo',
    'pickup_time': 'Igihe cyo kugutwara',
    'estimated_fare': 'Ikiguzi giteganijwe',
    'payment_cash': 'Kwishyura: Amafaranga/MoMo mugihe ugutorwamo',
    'create_trip': 'Kora urugendo',
    'vehicle_info': 'Amakuru y\'ikinyabiziga',
    'plate_number': 'Nimero y\'ubwato',
    'enter_plate': 'Andika nimero y\'ubwato',
    'seats': 'Intebe',
    'departure': 'Kugenda',
    'going_online': 'Gufungura serivisi',
    'going_offline': 'Gufunga serivisi',
    'you_are_online': 'Uri kumurongo kandi abagenji barakubona',
    'you_are_offline': 'Ntidukurikuriwe kandi abagenji ntibakubona',
    
    // Error handling
    'something_went_wrong': 'Hari ikibazo',
    'unexpected_error': 'Porogaramu yahuye n\'ikibazo kitunguranye. Ushobora kugerageza gusohora ukindi urupapuro cyangwa gusubira inyuma.',
    'error_details': 'Amakuru y\'ikibazo',
    'try_again': 'Ongera ugerageze',
    'reload_page': 'Ongera ufungure urupapuro',
    'go_back': 'Subira inyuma',
    'go_to_home': 'Jya ku rukiko',
    
    // Map and Location
    'map_error': 'Ikibazo cy\'ikarita',
    'location_error': 'Ikibazo cy\'aho uri',
    'location_detected': 'Aho uri hamenye',
    'location_selected': 'Aho uri hahitanwe',
    'search_error': 'Ikibazo cyo gushakisha',
    'search_location': 'Shakisha aho uri...',
    'confirm_location': 'Emeza aho uri',
    'loading_map': 'Kuraguza ikarita...',
    'failed_load_map': 'Ntabwo ikarita yashyitsemo. Reba niba internet ikora.',
    'location_has_been_set': 'Ahantu hashyizweho ku karita',
    'failed_open_whatsapp': 'Ntabwo WhatsApp yafunguye. Ongera ugerageze.',
    
    // Form placeholders and labels
    'enter_pickup_location': 'Andika aho uzatorwa',
    'enter_dropoff_location': 'Andika aho ugiye',
    'enter_destination': 'Andika aho ugiye',
    'choose_vehicle_type': 'Hitamo ubwoko bw\'ikinyabiziga',
    'select_date': 'Hitamo itariki',
    'select_time': 'Hitamo igihe',
    'enter_promo_code': 'Andika kode ya promo',
    'search_country': 'Shakisha igihugu cyawe...',
    
    // Trip creation
    'confirm_trip': 'Emeza urugendo',
    'failed_create_trip': 'Ntibyakunze gukora urugendo',
    'complete_route': 'Rangiza inzira',
    'complete_details': 'Rangiza amakuru',
    'select_pickup_destination': 'Hitamo aho uzatorwa n\'aho ugiye',
    'fill_required_details': 'Uzuza amakuru akenewe',
    'login_required': 'Injira mbere yo gukora urugendo',
    'fill_required_fields': 'Uzuza ibisabwa byose',
    'complete_required_fields': 'Rangiza ibisabwa byose',
    'ensure_logged_in': 'Menya neza ko wainjiye',
    'check_internet': 'Reba niba internet ikora.',
    'add_vehicle_first': 'Ongeraho ikinyabiziga mbere yo gushyiraho urugendo.',
    'missing_locations': 'Ahantu habuze',
    'invalid_fare': 'Ikiguzi kitari cyo',
    'enter_valid_fare': 'Andika ikiguzi nyacyo ku ntebe',
    
    // General messages
    'permissions_skipped': 'Uruhushya rwasimbukwe',
    'select_country_manually': 'Hitamo igihugu cyawe wenyine',
    'failed_save_role': 'Ntibyakunze kubika uruhare. Ongera ugerageze.',
    'failed_accept_draft': 'Ntibyakunze kwemeza icyanditswe. Ongera ugerageze.',
    
    // Additional hardcoded strings
    'country_detected': 'Igihugu cyamenywe',
    'auto_detection_failed': 'Gumenya byihariye byanze',
    'detection_failed': 'Gumenya byanze',
    'we_detected_country': 'Twamenye ko uri muri',
    'authentication_required': 'Injira bisabwa',
    'incomplete_trip': 'Urugendo rute',
    'where_from': 'Uhereye he?',
    'where_to': 'Ujya he?',
    'success': 'Byagenze neza',
    'youre_now_driver': 'Ubu uri umushoferi!',
    'youre_now_passenger': 'Ubu uri umugenzi!',
    'detecting_location': 'Turashakisha aho uri...',
    'use_current_location': 'Koresha aho uri ubu',
    'current_location_checkmark': 'Aho uri ubu ✓',
    
    // Trip creation forms  
    'post_trip': 'Gushyiraho Urugendo',
    'post_your_trip': 'Shyiraho Urugendo Rwawe',
    'posting_trip': 'Turashyiraho urugendo...',
    'trip_posted': 'Urugendo Rwashyizweho!',
    'trip_posted_description': 'Urugendo rwawe rwashyizweho. Abagenji bashobora gutorwa.',
    'connection_required': 'Ukwihuza Bisabwa',
    'vehicle_required': 'Ikinyabiziga Gisabwa',
    'add_vehicle_first_desc': 'Ongeraho ikinyabiziga mbere yo gushyiraho urugendo.',
    'missing_departure_time': 'Igihe cyo Kugenda Kibuze',
    'select_when_travel': 'Hitamo igihe ushaka kugenda.',
    'request_created': 'Icyifuzo Cyakozwe!',
    'request_created_desc': 'Icyifuzo cyawe cyo kugenda cyashyizweho. Turashakisha ibihuza...',
    'failed_create_request': 'Ntibyakunze gukora icyifuzo cyawe. Ongera ugerageze.',
    'your_vehicle': 'Ikinyabiziga Cyawe',
    'select_your_vehicle': 'Hitamo ikinyabiziga cyawe',
    'departure_location': 'Aho Ugenda',
    'where_starting_from': 'Ni hehe watangira?',
    'destination': 'Icyerekezo',
    'where_are_you_going': 'Ni hehe ugiye?',
    'when_plan_to_leave': 'Ni ryari ushaka kugenda?',
    'seats': 'Intebe',
    'seat': 'intebe',
    'seats_plural': 'intebe',
    'fare_rwf': 'Ikiguzi (RWF)',
    'trip_summary': 'Incamake y\'Urugendo',
    'no_vehicles_found': 'Nta binyabiziga Biboneka',
    'need_add_vehicle': 'Ukeneye kongeraho ikinyabiziga mbere yo gushyiraho urugendo.',
    'add_vehicle': 'Ongeraho Ikinyabiziga',
    'where_picked_up': 'Ni hehe ushaka gutorwa?',
    'selected_location': 'Aho Wahitanye',
    'trip_posted_local': 'Urugendo Rwashyizweho! (Hafi)',
    'trip_saved_locally_desc': 'Urugendo rwawe rwabitswe hafi. Ibi ni icyegeranyo kandi ntibizagaragara kubandi bakoresha.',
    'when_plan_to_leave': 'Ni ryari ushaka kugenda?',
    's_seats': 'Intebe',
    'seat_count': 'intebe',
    'seat_count_plural': 'intebe',
    'fare_rwf_label': 'Ikiguzi (RWF)',
    'trip_summary_header': 'Incamake y\'Urugendo',
    'posting_trip_loading': 'Turashyiraho urugendo...',
    'post_your_trip_button': 'Shyiraho Urugendo Rwawe',
    
    // Welcome page
    'welcome_to_kigali_ride': 'Murakaza neza kuri Kigali Ride',
    'connect_drivers_passengers': 'Huza abashoferi n\'abagenji mu Burasirazuba bwa Afurika. Tangira ako kanya!',
    'allow_location_recommended': 'Emera Aho Uri (Birasabwa)',
    'for_better_matching': 'Kugira ngo tubone neza urugendo',
    'enable_notifications_optional': 'Emera Amakuru (Ntabwo Ari Ngombwa)',
    'get_notified_matches': 'Habona amakuru ku rugendo ruhuye',
    'permissions_granted': 'Uruhushya rwemerewe:',
    'continue_to_app': 'Komeza ku Porogaramu →',
    'skip_permissions': 'Simbuka uruhushya kandi ukomeze',
    'get_started': 'Tangira',
    'change_country': 'Hindura Igihugu',
    'no_worries': 'Nta kibazo!',
    'use_app_manually': 'Ushobora gukoresha porogaramu. Andika aho ugiye wenyine.',
    'country_set': 'Igihugu Cyashyizweho!',
    'welcome_country_localized': 'Murakaza neza muri {country}! Ibiciro n\'ibindi byashyizweho kuri we.',
    'user_session_not_found': 'Ibisabwa by\'ukoresha ntibiboneka. Ongera ufungure urupapuro.',
    'failed_save_role_desc': 'Ntibyakunze kubika uruhare',
    'enable_later': 'Ushobora kubikora nyuma mu bushakashatsi bw\'igikoresho cyawe.',
  },
  
  fr: {
    // Common
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'cancel': 'Annuler',
    'confirm': 'Confirmer',
    'back': 'Retour',
    'next': 'Suivant',
    'save': 'Enregistrer',
    'delete': 'Supprimer',
    
    // Navigation
    'home': 'Accueil',
    'book': 'Réserver',
    'favorites': 'Favoris',
    'rewards': 'Récompenses',
    'profile': 'Profil',
    'create_trip': 'Créer Voyage',
    'requests': 'Demandes',
    
    // Trip related
    'from': 'De',
    'to': 'À',
    'departure_time': 'Heure de départ',
    'vehicle_type': 'Type de véhicule',
    'seats_available': 'Sièges disponibles',
    'fare': 'Tarif',
    'book_ride': 'Réserver Voyage',
    'post_trip': 'Publier Voyage',
    'find_matches': 'Trouver Correspondances',
    'contact_driver': 'Contacter Chauffeur',
    'whatsapp': 'WhatsApp',
    
    // Vehicle types
    'moto': 'Moto',
    'car': 'Voiture',
    'tuktuk': 'Tuk-Tuk',
    'minibus': 'Minibus',
    
    // Status
    'pending': 'En attente',
    'matched': 'Jumelé',
    'completed': 'Terminé',
    'cancelled': 'Annulé',
    
    // Messages
    'no_trips': 'Aucun voyage disponible',
    'trip_created': 'Voyage créé avec succès',
    'booking_confirmed': 'Réservation confirmée',
    'connection_error': 'Erreur de connexion. Veuillez réessayer.',
    'offline_mode': 'Mode Hors Ligne',
    // Complete localization
    'welcome': 'Bienvenue',
    'get_started': 'Commencer',
    'select_role': 'Sélectionnez votre rôle',
    'i_am_passenger': 'Je suis passager',
    'i_am_driver': 'Je suis conducteur',
    'passenger_desc': 'Réservez des trajets et voyagez facilement',
    'driver_desc': 'Offrez des trajets et gagnez de l\'argent',
    'continue': 'Continuer',
    'skip': 'Passer',
    'enable_location': 'Activer la localisation',
    'location_desc': 'Aidez-nous à trouver des trajets près de vous',
    'enable_notifications': 'Activer les notifications',
    'notifications_desc': 'Recevez des mises à jour sur vos trajets',
    'current_location': 'Position actuelle',
    'enter_pickup': 'Entrez le lieu de prise en charge',
    'enter_destination': 'Entrez la destination',
    'when_travel': 'Quand voulez-vous voyager?',
    'now': 'Maintenant',
    'schedule': 'Programmer',
    'select_date': 'Sélectionner la date',
    'select_time': 'Sélectionner l\'heure',
    'available_rides': 'Trajets disponibles',
    'no_rides_available': 'Aucun trajet disponible',
    'book_now': 'Réserver maintenant',
    'contact': 'Contacter',
    'trip_booked': 'Trajet réservé!',
    'driver_details': 'Détails du conducteur',
    'trip_details': 'Détails du trajet',
    'pickup_time': 'Heure de prise en charge',
    'estimated_fare': 'Tarif estimé',
    'payment_cash': 'Paiement: Espèces/MoMo à la prise en charge',
    'create_trip': 'Créer un trajet',
    'vehicle_info': 'Informations du véhicule',
    'plate_number': 'Numéro de plaque',
    'enter_plate': 'Entrez le numéro de plaque',
    'seats': 'Sièges',
    'departure': 'Départ',
    'going_online': 'Mise en ligne',
    'going_offline': 'Mise hors ligne',
    'you_are_online': 'Vous êtes en ligne et visible aux passagers',
    'you_are_offline': 'Vous êtes hors ligne et non visible aux passagers',
    
    // Error handling
    'something_went_wrong': 'Quelque chose s\'est mal passé',
    'unexpected_error': 'L\'application a rencontré une erreur inattendue. Vous pouvez essayer de rafraîchir la page ou de revenir en arrière.',
    'error_details': 'Détails de l\'erreur',
    'try_again': 'Réessayer',
    'reload_page': 'Recharger la page',
    'go_back': 'Retourner',
    'go_to_home': 'Aller à l\'accueil',
    
    // Map and Location
    'map_error': 'Erreur de carte',
    'location_error': 'Erreur de localisation',
    'location_detected': 'Localisation détectée',
    'location_selected': 'Localisation sélectionnée',
    'search_error': 'Erreur de recherche',
    'search_location': 'Rechercher un lieu...',
    'confirm_location': 'Confirmer la localisation',
    'loading_map': 'Chargement de la carte...',
    'failed_load_map': 'Échec du chargement de la carte. Vérifiez votre connexion internet.',
    'location_has_been_set': 'La localisation a été définie sur la carte',
    'failed_open_whatsapp': 'Échec de l\'ouverture de WhatsApp. Veuillez réessayer.',
    
    // Form placeholders and labels
    'enter_pickup_location': 'Entrez le lieu de prise en charge',
    'enter_dropoff_location': 'Entrez le lieu de dépôt',
    'enter_destination': 'Entrez la destination',
    'choose_vehicle_type': 'Choisissez le type de véhicule',
    'select_date': 'Sélectionner la date',
    'select_time': 'Sélectionner l\'heure',
    'enter_promo_code': 'Entrez le code promo',
    'search_country': 'Recherchez votre pays...',
    
    // Trip creation
    'confirm_trip': 'Confirmer le trajet',
    'failed_create_trip': 'Échec de création du trajet',
    'complete_route': 'Compléter l\'itinéraire',
    'complete_details': 'Compléter les détails',
    'select_pickup_destination': 'Veuillez sélectionner les lieux de prise en charge et de destination',
    'fill_required_details': 'Veuillez remplir tous les détails requis du trajet',
    'login_required': 'Veuillez vous connecter pour créer un trajet',
    'fill_required_fields': 'Veuillez remplir tous les champs requis',
    'complete_required_fields': 'Veuillez compléter tous les champs requis',
    'ensure_logged_in': 'Veuillez vous assurer d\'être connecté',
    'check_internet': 'Veuillez vérifier votre connexion internet.',
    'add_vehicle_first': 'Veuillez d\'abord ajouter un véhicule pour publier des trajets.',
    'missing_locations': 'Lieux manquants',
    'invalid_fare': 'Tarif invalide',
    'enter_valid_fare': 'Veuillez entrer un tarif valide par siège',
    
    // General messages
    'permissions_skipped': 'Permissions ignorées',
    'select_country_manually': 'Veuillez sélectionner votre pays manuellement',
    'failed_save_role': 'Échec de la sauvegarde du rôle. Veuillez réessayer.',
    'failed_accept_draft': 'Échec de l\'acceptation du brouillon. Veuillez réessayer.',
    
    // Additional hardcoded strings
    'country_detected': 'Pays détecté',
    'auto_detection_failed': 'Détection automatique échouée',
    'detection_failed': 'Détection échouée',
    'we_detected_country': 'Nous avons détecté que vous êtes en',
    'authentication_required': 'Authentification requise',
    'incomplete_trip': 'Voyage incomplet',
    'where_from': 'D\'où?',
    'where_to': 'Vers où?',
    'success': 'Succès',
    'youre_now_driver': 'Vous êtes maintenant conducteur!',
    'youre_now_passenger': 'Vous êtes maintenant passager!',
    'detecting_location': 'Détection de localisation...',
    'use_current_location': 'Utiliser la position actuelle',
    'current_location_checkmark': 'Position actuelle ✓',
    
    // Trip creation forms
    'post_trip': 'Publier un Voyage',
    'post_your_trip': 'Publier Votre Voyage',
    'posting_trip': 'Publication du voyage...',
    'trip_posted': 'Voyage Publié!',
    'trip_posted_description': 'Votre voyage a été publié. Les passagers peuvent maintenant réserver des places.',
    'connection_required': 'Connexion Requise',
    'vehicle_required': 'Véhicule Requis',
    'add_vehicle_first_desc': 'Veuillez d\'abord ajouter un véhicule pour publier des voyages.',
    'missing_departure_time': 'Heure de Départ Manquante',
    'select_when_travel': 'Veuillez sélectionner quand vous voulez voyager.',
    'request_created': 'Demande Créée!',
    'request_created_desc': 'Votre demande de trajet a été publiée. Recherche de correspondances...',
    'failed_create_request': 'Échec de création de votre demande de trajet. Veuillez réessayer.',
    'your_vehicle': 'Votre Véhicule',
    'select_your_vehicle': 'Sélectionnez votre véhicule',
    'departure_location': 'Lieu de Départ',
    'where_starting_from': 'D\'où partez-vous?',
    'destination': 'Destination',
    'where_are_you_going': 'Où allez-vous?',
    'when_plan_to_leave': 'Quand prévoyez-vous de partir?',
    'seats': 'Sièges',
    'seat': 'siège',
    'seats_plural': 'sièges',
    'fare_rwf': 'Tarif (RWF)',
    'trip_summary': 'Résumé du Voyage',
    'no_vehicles_found': 'Aucun Véhicule Trouvé',
    'need_add_vehicle': 'Vous devez ajouter un véhicule avant de pouvoir publier des voyages.',
    'add_vehicle': 'Ajouter un Véhicule',
    'where_picked_up': 'Où voulez-vous être pris en charge?',
    'selected_location': 'Lieu Sélectionné',
    'trip_posted_local': 'Voyage Publié! (Local)',
    'trip_saved_locally_desc': 'Votre voyage a été sauvegardé localement. Ceci est un aperçu et ne sera pas visible aux autres utilisateurs.',
    'when_plan_to_leave': 'Quand prévoyez-vous de partir?',
    's_seats': 'Sièges',
    'seat_count': 'siège',
    'seat_count_plural': 'sièges',
    'fare_rwf_label': 'Tarif (RWF)',
    'trip_summary_header': 'Résumé du Voyage',
    'posting_trip_loading': 'Publication du voyage...',
    'post_your_trip_button': 'Publier Votre Voyage',
    
    // Welcome page
    'welcome_to_kigali_ride': 'Bienvenue sur Kigali Ride',
    'connect_drivers_passengers': 'Connectez conducteurs et passagers à travers l\'Afrique subsaharienne. Commencez dès maintenant!',
    'allow_location_recommended': 'Autoriser la Localisation (Recommandé)',
    'for_better_matching': 'Pour un meilleur appariement de trajets',
    'enable_notifications_optional': 'Activer les Notifications (Optionnel)',
    'get_notified_matches': 'Soyez notifié des correspondances de trajet',
    'permissions_granted': 'Permissions accordées:',
    'continue_to_app': 'Continuer vers l\'App →',
    'skip_permissions': 'Ignorer les permissions et continuer',
    'get_started': 'Commencer',
    'change_country': 'Changer de Pays',
    'no_worries': 'Pas de souci!',
    'use_app_manually': 'Vous pouvez toujours utiliser l\'app. Entrez simplement les lieux manuellement.',
    'country_set': 'Pays Défini!',
    'welcome_country_localized': 'Bienvenue en {country}! Les prix et fonctionnalités sont maintenant localisés pour vous.',
    'user_session_not_found': 'Session utilisateur introuvable. Veuillez actualiser la page.',
    'failed_save_role_desc': 'Échec de la sauvegarde du rôle',
    'enable_later': 'Vous pouvez toujours les activer plus tard dans les paramètres de votre appareil.',
  }
};

export type Language = 'en' | 'rw' | 'fr';
type TranslationKey = keyof typeof translations.en;

export const useLocalization = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    t,
    changeLanguage,
    availableLanguages: [
      { code: 'en', name: 'English' },
      { code: 'rw', name: 'Kinyarwanda' },
      { code: 'fr', name: 'Français' }
    ] as const
  };
};