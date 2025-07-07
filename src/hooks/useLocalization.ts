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