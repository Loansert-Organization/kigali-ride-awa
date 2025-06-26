
// Screen and Modal Audit for Kigali Ride Platform
export interface ScreenAuditResult {
  present: string[];
  missing: string[];
  partiallyImplemented: string[];
}

export const REQUIRED_SCREENS = {
  universal: [
    'LandingPage', // ✓ Present as Index.tsx
    'LanguageSelectorModal', // ✓ Present
    'LocationPermissionModal', // ❌ Missing
    'OnboardingWizard', // ❌ Missing (only WelcomeLanding exists)
    'PromoCodeReferralModal', // ❌ Missing
    'TermsAndPrivacyModal', // ❌ Missing
    'WhatsAppPermissionModal', // ❌ Missing
    'FeedbackIncidentModal', // ❌ Missing
  ],
  passenger: [
    'PassengerHomePage', // ✓ Present
    'BookRidePage', // ✓ Present
    'RideMatchingResultsPage', // ✓ Present as RideMatches
    'RideConfirmationModal', // ❌ Missing
    'FavoritesManagerPage', // ❌ Missing
    'PastUpcomingRidesPage', // ✓ Partial as PastTrips
    'LeaderboardRewardsPage', // ✓ Present as Leaderboard
    'PassengerProfilePage', // ✓ Present as Profile
    'NotificationSettingsPage', // ❌ Missing
  ],
  driver: [
    'DriverHomePage', // ✓ Present
    'VehicleSetupPage', // ✓ Present
    'CreateTripPage', // ✓ Present
    'PassengerRequestsViewerPage', // ❌ Missing
    'MyTripsCalendarPage', // ✓ Partial as DriverTrips
    'DriverPromoCodeModal', // ❌ Missing
    'DriverProfilePage', // ❌ Missing (uses generic Profile)
    'DriverRewardsProgressPage', // ❌ Missing
  ],
  admin: [
    'AdminRewardsDashboardPage', // ❌ Missing
    'LeaderboardAdminPanelPage', // ❌ Missing
    'TripHeatmapDashboardPage', // ❌ Missing
    'AILogsFeedbackPage', // ❌ Missing
    'DeviceFingerprintingTrackerPage', // ❌ Missing
  ],
  modals: [
    'MapPickerModal', // ❌ Missing
    'LanguageSwitcherModal', // ✓ Present
    'PromoCodeCopyModal', // ❌ Missing
    'LocationErrorHandlerModal', // ❌ Missing
    'ConfettiSuccessModal', // ❌ Missing
    'WhatsAppQuickLaunchModal', // ❌ Missing
    'EditFavoriteLocationModal', // ❌ Missing
  ],
  wizards: [
    'InitialOnboardingWizard', // ❌ Missing
    'DriverTripCreationWizard', // ✓ Present in CreateTrip
    'PassengerRideBookingWizard', // ✓ Present in BookRide
    'ReferralRewardsExplainerWizard', // ❌ Missing
  ]
};

export function auditScreenPresence(): ScreenAuditResult {
  // This would be called to generate the audit report
  return {
    present: [
      'Index (LandingPage)',
      'LanguageSelector',
      'PassengerHome',
      'BookRide',
      'RideMatches',
      'Leaderboard',
      'Profile',
      'DriverHome',
      'VehicleSetup',
      'CreateTrip',
      'DriverTrips'
    ],
    missing: [
      'LocationPermissionModal',
      'OnboardingWizard',
      'PromoCodeReferralModal',
      'TermsAndPrivacyModal',
      'WhatsAppPermissionModal',
      'FeedbackIncidentModal',
      'RideConfirmationModal',
      'FavoritesManagerPage',
      'NotificationSettingsPage',
      'PassengerRequestsViewerPage',
      'DriverPromoCodeModal',
      'DriverProfilePage',
      'DriverRewardsProgressPage',
      'All Admin Pages',
      'MapPickerModal',
      'PromoCodeCopyModal',
      'LocationErrorHandlerModal',
      'ConfettiSuccessModal',
      'WhatsAppQuickLaunchModal',
      'EditFavoriteLocationModal',
      'InitialOnboardingWizard',
      'ReferralRewardsExplainerWizard'
    ],
    partiallyImplemented: [
      'PastTrips (needs upcoming trips)',
      'Generic Profile (needs role-specific versions)'
    ]
  };
}
