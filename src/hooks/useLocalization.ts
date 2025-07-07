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
    // Complete localization
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
    'create_trip': 'Create Trip',
    'vehicle_info': 'Vehicle Information',
    'plate_number': 'Plate Number',
    'enter_plate': 'Enter plate number',
    'seats': 'Seats',
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
    'enter_destination': 'Enter destination',
    'choose_vehicle_type': 'Choose Vehicle Type',
    'select_date': 'Select date',
    'select_time': 'Select time',
    'enter_promo_code': 'Enter promo code',
    'search_country': 'Search for your country...',
    
    // Trip creation
    'confirm_trip': 'Confirm Trip',
    'failed_create_trip': 'Failed to Create Trip',
    'complete_route': 'Complete Route',
    'complete_details': 'Complete Details',
    'select_pickup_destination': 'Please select both pickup and destination locations',
    'fill_required_details': 'Please fill in all required trip details',
    'login_required': 'Please log in to create a trip',
    'fill_required_fields': 'Please fill in all required fields',
    'complete_required_fields': 'Please complete all required fields',
    'ensure_logged_in': 'Please ensure you\'re logged in',
    'check_internet': 'Please check your internet connection.',
    'add_vehicle_first': 'Please add a vehicle first to post trips.',
    'missing_locations': 'Missing Locations',
    'invalid_fare': 'Invalid Fare',
    'enter_valid_fare': 'Please enter a valid fare per seat',
    
    // General messages
    'permissions_skipped': 'Permissions Skipped',
    'select_country_manually': 'Please select your country manually',
    'failed_save_role': 'Failed to save role. Please try again.',
    'failed_accept_draft': 'Failed to accept draft. Please try again.',
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