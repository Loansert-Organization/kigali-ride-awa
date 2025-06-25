
import { supabase } from "@/integrations/supabase/client";

export interface SchemaAuditResult {
  table: string;
  field?: string;
  status: '✅' | '⚠️' | '❌';
  issue?: string;
  fix?: string;
}

type DatabaseTable = 'users' | 'driver_profiles' | 'trips' | 'bookings' | 'favorites' | 'user_referrals' | 'user_rewards' | 'incidents' | 'trip_heatmap_logs' | 'admin_trip_flags';

export class SchemaAuditService {
  static async performFullAudit(): Promise<{
    results: SchemaAuditResult[];
    summary: {
      total: number;
      passed: number;
      warnings: number;
      failed: number;
    };
  }> {
    const results: SchemaAuditResult[] = [];
    
    // Check each table exists and has correct structure
    const tableChecks = await this.checkTables();
    results.push(...tableChecks);
    
    // Check RLS policies
    const rlsChecks = await this.checkRLSPolicies();
    results.push(...rlsChecks);
    
    // Check foreign key relationships
    const relationshipChecks = await this.checkRelationships();
    results.push(...relationshipChecks);
    
    // Check data integrity
    const dataChecks = await this.checkDataIntegrity();
    results.push(...dataChecks);
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === '✅').length,
      warnings: results.filter(r => r.status === '⚠️').length,
      failed: results.filter(r => r.status === '❌').length
    };
    
    return { results, summary };
  }

  private static async checkTables(): Promise<SchemaAuditResult[]> {
    const results: SchemaAuditResult[] = [];
    
    try {
      // Check users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, auth_user_id, role, language, promo_code')
        .limit(1);
      
      if (usersError) {
        results.push({
          table: 'users',
          status: '❌',
          issue: `Users table error: ${usersError.message}`,
          fix: 'Ensure users table exists with correct schema'
        });
      } else {
        results.push({
          table: 'users',
          status: '✅',
          issue: 'Users table accessible and has required fields'
        });
      }

      // Check driver_profiles table
      const { data: drivers, error: driversError } = await supabase
        .from('driver_profiles')
        .select('user_id, vehicle_type, plate_number, is_online')
        .limit(1);
      
      if (driversError) {
        results.push({
          table: 'driver_profiles',
          status: '❌',
          issue: `Driver profiles error: ${driversError.message}`,
          fix: 'Ensure driver_profiles table exists with correct schema'
        });
      } else {
        results.push({
          table: 'driver_profiles',
          status: '✅',
          issue: 'Driver profiles table accessible'
        });
      }

      // Check trips table
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('id, user_id, role, from_location, to_location, status')
        .limit(1);
      
      if (tripsError) {
        results.push({
          table: 'trips',
          status: '❌',
          issue: `Trips table error: ${tripsError.message}`,
          fix: 'Ensure trips table exists with correct schema'
        });
      } else {
        results.push({
          table: 'trips',
          status: '✅',
          issue: 'Trips table accessible'
        });
      }

      // Check bookings table
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, passenger_trip_id, driver_trip_id, confirmed')
        .limit(1);
      
      if (bookingsError) {
        results.push({
          table: 'bookings',
          status: '❌',
          issue: `Bookings table error: ${bookingsError.message}`,
          fix: 'Ensure bookings table exists with correct schema'
        });
      } else {
        results.push({
          table: 'bookings',
          status: '✅',
          issue: 'Bookings table accessible'
        });
      }

      // Check other tables with proper typing
      const tablesToCheck: DatabaseTable[] = ['favorites', 'user_referrals', 'user_rewards', 'incidents', 'trip_heatmap_logs'];
      
      for (const table of tablesToCheck) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          
          if (error) {
            results.push({
              table,
              status: '❌',
              issue: `${table} table error: ${error.message}`,
              fix: `Ensure ${table} table exists with correct schema`
            });
          } else {
            results.push({
              table,
              status: '✅',
              issue: `${table} table accessible`
            });
          }
        } catch (err) {
          results.push({
            table,
            status: '❌',
            issue: `${table} table not accessible`,
            fix: `Create ${table} table with required schema`
          });
        }
      }

    } catch (error) {
      results.push({
        table: 'general',
        status: '❌',
        issue: `General database connection error: ${error}`,
        fix: 'Check Supabase connection and authentication'
      });
    }
    
    return results;
  }

  private static async checkRLSPolicies(): Promise<SchemaAuditResult[]> {
    const results: SchemaAuditResult[] = [];
    
    // This would normally query pg_policies table to verify RLS policies exist
    // For now, we'll document expected vs actual state
    
    const expectedPolicies = [
      { table: 'users', policy: 'select_my_user' },
      { table: 'users', policy: 'update_my_user' },
      { table: 'driver_profiles', policy: 'select_my_vehicle_or_admin' },
      { table: 'trips', policy: 'select_trip_owner_or_public_view' },
      { table: 'bookings', policy: 'select_involved_booking' },
      { table: 'favorites', policy: 'select_my_favorites' },
      { table: 'user_referrals', policy: 'select_related_referrals' },
      { table: 'user_rewards', policy: 'select_my_rewards_or_admin' },
      { table: 'incidents', policy: 'select_my_incidents_or_admin' }
    ];
    
    expectedPolicies.forEach(({ table, policy }) => {
      results.push({
        table,
        field: `RLS Policy: ${policy}`,
        status: '⚠️',
        issue: 'RLS policies need to be verified manually in Supabase',
        fix: 'Run RLS policy SQL scripts in Supabase SQL editor'
      });
    });
    
    return results;
  }

  private static async checkRelationships(): Promise<SchemaAuditResult[]> {
    const results: SchemaAuditResult[] = [];
    
    // Check foreign key relationships work
    try {
      // Test join between users and driver_profiles
      const { error: joinError } = await supabase
        .from('users')
        .select(`
          id,
          driver_profiles(vehicle_type, is_online)
        `)
        .limit(1);
      
      if (joinError) {
        results.push({
          table: 'relationships',
          field: 'users -> driver_profiles',
          status: '❌',
          issue: `Join error: ${joinError.message}`,
          fix: 'Fix foreign key relationship between users and driver_profiles'
        });
      } else {
        results.push({
          table: 'relationships',
          field: 'users -> driver_profiles',
          status: '✅',
          issue: 'Foreign key relationship working'
        });
      }
      
      // Test trips -> users relationship
      const { error: tripsJoinError } = await supabase
        .from('trips')
        .select(`
          id,
          users(promo_code)
        `)
        .limit(1);
      
      if (tripsJoinError) {
        results.push({
          table: 'relationships',
          field: 'trips -> users',
          status: '❌',
          issue: `Join error: ${tripsJoinError.message}`,
          fix: 'Fix foreign key relationship between trips and users'
        });
      } else {
        results.push({
          table: 'relationships',
          field: 'trips -> users',
          status: '✅',
          issue: 'Foreign key relationship working'
        });
      }
      
    } catch (error) {
      results.push({
        table: 'relationships',
        status: '❌',
        issue: `Relationship check failed: ${error}`,
        fix: 'Review and fix database foreign key constraints'
      });
    }
    
    return results;
  }

  private static async checkDataIntegrity(): Promise<SchemaAuditResult[]> {
    const results: SchemaAuditResult[] = [];
    
    try {
      // Check for orphaned records
      const { data: orphanedTrips, error } = await supabase
        .from('trips')
        .select('id')
        .is('user_id', null);
      
      if (error) {
        results.push({
          table: 'data_integrity',
          field: 'orphaned_trips',
          status: '⚠️',
          issue: `Cannot check for orphaned trips: ${error.message}`,
          fix: 'Review data integrity constraints'
        });
      } else if (orphanedTrips && orphanedTrips.length > 0) {
        results.push({
          table: 'data_integrity',
          field: 'orphaned_trips',
          status: '❌',
          issue: `Found ${orphanedTrips.length} trips without user_id`,
          fix: 'Clean up orphaned trip records'
        });
      } else {
        results.push({
          table: 'data_integrity',
          field: 'orphaned_trips',
          status: '✅',
          issue: 'No orphaned trip records found'
        });
      }
      
      // Check promo_code uniqueness
      const { data: duplicatePromos, error: promoError } = await supabase
        .from('users')
        .select('promo_code')
        .not('promo_code', 'is', null);
      
      if (promoError) {
        results.push({
          table: 'data_integrity',
          field: 'promo_code_uniqueness',
          status: '⚠️',
          issue: `Cannot check promo code uniqueness: ${promoError.message}`,
          fix: 'Review promo code constraints'
        });
      } else {
        const promoCodes = duplicatePromos?.map(u => u.promo_code) || [];
        const uniquePromoCodes = new Set(promoCodes);
        
        if (promoCodes.length !== uniquePromoCodes.size) {
          results.push({
            table: 'data_integrity',
            field: 'promo_code_uniqueness',
            status: '❌',
            issue: 'Duplicate promo codes found',
            fix: 'Ensure promo_code field has unique constraint'
          });
        } else {
          results.push({
            table: 'data_integrity',
            field: 'promo_code_uniqueness',
            status: '✅',
            issue: 'All promo codes are unique'
          });
        }
      }
      
    } catch (error) {
      results.push({
        table: 'data_integrity',
        status: '❌',
        issue: `Data integrity check failed: ${error}`,
        fix: 'Review database constraints and data quality'
      });
    }
    
    return results;
  }

  static async testRLSPolicies(): Promise<SchemaAuditResult[]> {
    const results: SchemaAuditResult[] = [];
    
    // Test basic access patterns
    try {
      // Test authenticated user can access their own data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, promo_code')
        .limit(1);
      
      if (userError) {
        results.push({
          table: 'rls_test',
          field: 'user_access',
          status: '❌',
          issue: `User access test failed: ${userError.message}`,
          fix: 'Check RLS policies for users table'
        });
      } else {
        results.push({
          table: 'rls_test',
          field: 'user_access',
          status: '✅',
          issue: 'User can access their own data'
        });
      }
      
      // Test trip visibility
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('id, role, status')
        .limit(5);
      
      if (tripError) {
        results.push({
          table: 'rls_test',
          field: 'trip_visibility',
          status: '❌',
          issue: `Trip visibility test failed: ${tripError.message}`,
          fix: 'Check RLS policies for trips table'
        });
      } else {
        results.push({
          table: 'rls_test',
          field: 'trip_visibility',
          status: '✅',
          issue: `Can see ${tripData?.length || 0} trips based on RLS rules`
        });
      }
      
    } catch (error) {
      results.push({
        table: 'rls_test',
        status: '❌',
        issue: `RLS test failed: ${error}`,
        fix: 'Review RLS configuration and authentication'
      });
    }
    
    return results;
  }
}
