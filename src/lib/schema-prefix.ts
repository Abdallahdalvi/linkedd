/**
 * Schema Prefix Helper
 * 
 * All app tables live in the `links` schema.
 * This helper prefixes table names for Supabase queries
 * while maintaining TypeScript compatibility.
 */

const SCHEMA = 'links';

/**
 * Prefix a table name with the links schema.
 * Usage: supabase.from(t('blocks')) → supabase.from('links.blocks')
 */
export function t<T extends string>(table: T): T {
  return `${SCHEMA}.${table}` as T;
}
