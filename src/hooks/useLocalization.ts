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