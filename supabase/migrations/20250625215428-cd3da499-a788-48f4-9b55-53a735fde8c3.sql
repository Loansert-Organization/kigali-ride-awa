
-- Create comprehensive analytics views for admin dashboards and reporting

-- 1. Admin Dashboard Stats View - Core KPIs
CREATE OR REPLACE VIEW admin_dashboard_stats_view AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_new_users,
  (SELECT COUNT(*) FROM trips) as total_trips,
  (SELECT COUNT(*) FROM trips WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_trips,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_bookings,
  (SELECT COUNT(*) FROM user_referrals) as total_referrals,
  (SELECT COUNT(*) FROM user_referrals WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_referrals,
  (SELECT COUNT(*) FROM driver_profiles) as total_drivers,
  (SELECT COUNT(*) FROM driver_profiles WHERE is_online = true) as online_drivers,
  (SELECT COALESCE(SUM(points), 0) FROM user_rewards WHERE reward_issued = true) as total_rewards_issued;

-- 2. Weekly Rewards Leaderboard View
CREATE OR REPLACE VIEW weekly_rewards_leaderboard_view AS
SELECT 
  u.id,
  u.promo_code,
  u.role,
  COALESCE(SUM(ur.points), 0) as total_points,
  COUNT(ref.id) as referrals_made,
  DATE_TRUNC('week', ur.created_at) as week_start,
  RANK() OVER (PARTITION BY DATE_TRUNC('week', ur.created_at) ORDER BY COALESCE(SUM(ur.points), 0) DESC) as weekly_rank
FROM users u
LEFT JOIN user_rewards ur ON u.id = ur.user_id AND ur.reward_issued = true
LEFT JOIN user_referrals ref ON u.id = ref.referrer_id
WHERE ur.created_at >= CURRENT_DATE - INTERVAL '4 weeks' OR ur.created_at IS NULL
GROUP BY u.id, u.promo_code, u.role, DATE_TRUNC('week', ur.created_at)
ORDER BY total_points DESC, weekly_rank ASC;

-- 3. Driver Booking Success View - Conversion metrics
CREATE OR REPLACE VIEW driver_booking_success_view AS
SELECT 
  u.id as driver_id,
  u.promo_code,
  dp.vehicle_type,
  COUNT(t.id) as trips_posted,
  COUNT(b.id) as bookings_received,
  COUNT(CASE WHEN b.confirmed = true THEN 1 END) as bookings_confirmed,
  CASE 
    WHEN COUNT(t.id) > 0 THEN 
      ROUND((COUNT(b.id)::decimal / COUNT(t.id) * 100), 2)
    ELSE 0 
  END as booking_rate_percent,
  CASE 
    WHEN COUNT(b.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN b.confirmed = true THEN 1 END)::decimal / COUNT(b.id) * 100), 2)
    ELSE 0 
  END as confirmation_rate_percent
FROM users u
JOIN driver_profiles dp ON u.id = dp.user_id
LEFT JOIN trips t ON u.id = t.user_id AND t.role = 'driver'
LEFT JOIN bookings b ON t.id = b.driver_trip_id
WHERE u.role = 'driver'
GROUP BY u.id, u.promo_code, dp.vehicle_type
ORDER BY booking_rate_percent DESC;

-- 4. Daily Activity Snapshot View - 30-day trend
CREATE OR REPLACE VIEW daily_activity_snapshot_view AS
SELECT 
  date_series.date,
  COALESCE(trip_counts.trips_created, 0) as trips_created,
  COALESCE(booking_counts.bookings_created, 0) as bookings_created,
  COALESCE(user_counts.users_joined, 0) as users_joined,
  COALESCE(driver_counts.drivers_joined, 0) as drivers_joined
FROM (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    '1 day'::interval
  )::date as date
) date_series
LEFT JOIN (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as trips_created
  FROM trips 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) trip_counts ON date_series.date = trip_counts.date
LEFT JOIN (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as bookings_created
  FROM bookings 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) booking_counts ON date_series.date = booking_counts.date
LEFT JOIN (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as users_joined
  FROM users 
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
) user_counts ON date_series.date = user_counts.date
LEFT JOIN (
  SELECT 
    DATE(dp.created_at) as date,
    COUNT(*) as drivers_joined
  FROM driver_profiles dp
  WHERE dp.created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(dp.created_at)
) driver_counts ON date_series.date = driver_counts.date
ORDER BY date_series.date DESC;

-- 5. Enhanced Heatmap View (already exists, but let's ensure it's optimized)
DROP MATERIALIZED VIEW IF EXISTS heatmap_aggregated_view;
CREATE MATERIALIZED VIEW heatmap_aggregated_view AS
SELECT 
  ROUND(lat::numeric, 3) as lat_rounded,
  ROUND(lng::numeric, 3) as lng_rounded,
  role,
  COUNT(*) as trip_count,
  DATE_TRUNC('hour', created_at) as hour_bucket,
  AVG(CASE WHEN trip_id IS NOT NULL THEN 1 ELSE 0 END) as completion_rate
FROM trip_heatmap_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY lat_rounded, lng_rounded, role, hour_bucket;

-- Create unique index for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_heatmap_agg_unique 
ON heatmap_aggregated_view (lat_rounded, lng_rounded, role, hour_bucket);

-- Create agent_logs table for comprehensive error tracking
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  event_type text NOT NULL, -- 'error', 'booking_created', 'trip_matched', etc.
  component text, -- 'BookingModal', 'TripCard', 'WhatsAppLauncher'
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  created_at timestamptz DEFAULT now()
);

-- Add RLS policy for agent_logs
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_logs_own_or_admin" ON agent_logs 
FOR SELECT USING (is_owner(user_id) OR is_admin());

CREATE POLICY "agent_logs_insert_own" ON agent_logs 
FOR INSERT WITH CHECK (is_owner(user_id) OR user_id IS NULL);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON agent_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_event_type ON agent_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_severity ON agent_logs (severity);

-- Grant permissions for views to be accessible by admin users
GRANT SELECT ON admin_dashboard_stats_view TO authenticated;
GRANT SELECT ON weekly_rewards_leaderboard_view TO authenticated;
GRANT SELECT ON driver_booking_success_view TO authenticated;
GRANT SELECT ON daily_activity_snapshot_view TO authenticated;
GRANT SELECT ON heatmap_aggregated_view TO authenticated;
