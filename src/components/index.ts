/**
 * Barrel exports for commonly used components
 * This improves import organization and makes refactoring easier
 */

// UI Components
export * from './ui/button';
export * from './ui/card';
export * from './ui/input';
export * from './ui/label';
export * from './ui/toast';
export * from './ui/dialog';
export * from './ui/select';
export * from './ui/switch';
export * from './ui/badge';
export * from './ui/tabs';
export * from './ui/tooltip';
export * from './ui/alert';
export * from './ui/alert-dialog';

// Auth Components
export { default as GoogleSignInButton } from './auth/GoogleSignInButton';
export { default as OTPAuthFlow } from './auth/OTPAuthFlow';
export { default as PhoneInputOTP } from './auth/PhoneInputOTP';
export { default as UnifiedWhatsAppOTP } from './auth/UnifiedWhatsAppOTP';
export { default as WhatsAppLoginModal } from './auth/WhatsAppLoginModal';

// Common Components
export { default as LanguageSelector } from './common/LanguageSelector';
export { default as RoleSelector } from './common/RoleSelector';

// Navigation
export { default as BottomNavigation } from './navigation/BottomNavigation';

// Error Handling
export { default as GlobalErrorBoundary } from './GlobalErrorBoundary';

// Map Components
export { default as LocationPicker } from './maps/LocationPicker';
export { default as LiveDriversMap } from './maps/LiveDriversMap';
export { default as NearbyTripsMap } from './passenger/NearbyTripsMap';

// Booking Components
export { default as BookingModal } from './booking/BookingModal';
export { default as BookingSummary } from './booking/BookingSummary';
export { default as GooglePlacesInput } from './booking/GooglePlacesInput';
export { default as LocationInputBlock } from './booking/LocationInputBlock';
export { default as VehicleSelectBlock } from './booking/VehicleSelectBlock';

// Driver Components
export { default as DriverHeader } from './driver/DriverHeader';
export { default as DriverStatusSummary } from './driver/DriverStatusSummary';
export { default as OnlineToggleBlock } from './driver/OnlineToggleBlock';
export { default as PassengerRequestCard } from './driver/PassengerRequestCard';
export { default as PassengerRequestModal } from './driver/PassengerRequestModal';

// Trip Components
export { default as CreateTripProgressIndicator } from './trip/CreateTripProgressIndicator';
export { default as DateTimeBlock } from './trip/DateTimeBlock';
export { default as FareInputBlock } from './trip/FareInputBlock';
export { default as RouteInputBlock } from './trip/RouteInputBlock';
export { default as TripConfirmationBlock } from './trip/TripConfirmationBlock';
export { default as VehicleDetailsBlock } from './trip/VehicleDetailsBlock';

// Profile Components
export { default as AppResetButtonBlock } from './profile/AppResetButtonBlock';
export { default as DriverSettingsBlock } from './profile/DriverSettingsBlock';
export { default as LanguageSelectorBlock } from './profile/LanguageSelectorBlock';
export { default as NotificationSettingsBlock } from './profile/NotificationSettingsBlock';
export { default as ProfileHeaderBlock } from './profile/ProfileHeaderBlock';
export { default as ReferralCodeBlock } from './profile/ReferralCodeBlock';

// Admin Components
export { default as AdminHeader } from './admin/AdminHeader';
export { default as GlobalAdminSearch } from './admin/GlobalAdminSearch';
export { default as KPIStatsCards } from './admin/KPIStatsCards';
export { default as ProductionDashboard } from './admin/ProductionDashboard';
export { default as SchemaAuditReport } from './admin/SchemaAuditReport';
export { default as TripsTableBlock } from './admin/TripsTableBlock';
export { default as UsersTableBlock } from './admin/UsersTableBlock'; 