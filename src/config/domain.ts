/**
 * Domain Configuration for Hostinger Deployment
 * 
 * This file centralizes all domain-related configuration for the app.
 * Update SERVER_IP when deploying to Hostinger or any other hosting provider.
 */

// The IP address of your Hostinger server
// Find this in hPanel → Hosting → Details → Server IP
export const SERVER_IP = '153.92.0.0'; // TODO: Replace with your actual Hostinger server IP

// Main domain where the dashboard/admin is hosted
export const MAIN_DOMAIN = import.meta.env.VITE_MAIN_DOMAIN || 'links.dalvi.cloud';

// App name for branding in TXT records
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'linkbio';

// TXT record prefix for domain verification
export const TXT_RECORD_NAME = `_${APP_NAME}`;

// TXT record value prefix
export const TXT_VERIFY_PREFIX = `${APP_NAME}_verify`;

// Generate verification token format
export function generateVerificationToken(profileId: string): string {
  const randomPart = crypto.randomUUID().slice(0, 8);
  return `${randomPart}_${profileId.slice(0, 6)}`;
}

// Format the complete TXT record value
export function formatTxtRecordValue(token: string): string {
  return `${TXT_VERIFY_PREFIX}=${token}`;
}

// Domain status types for Hostinger deployment
export type DomainStatus = 
  | 'pending_dns'       // User just added domain, DNS not configured yet
  | 'verified_dns'      // DNS verified, waiting for admin activation
  | 'pending_activation' // Alias for verified_dns (clearer for users)
  | 'active_manual'     // Admin manually activated (domain working)
  | 'active'            // Alias for active_manual (backward compat)
  | 'rejected'          // Admin rejected the domain
  | 'failed';           // DNS verification failed

// Map old statuses to new ones for backward compatibility
export function normalizeStatus(status: string): DomainStatus {
  switch (status) {
    case 'pending':
    case 'pending_dns':
      return 'pending_dns';
    case 'verifying':
    case 'verified_dns':
    case 'pending_activation':
      return 'verified_dns';
    case 'active':
    case 'active_manual':
      return 'active_manual';
    case 'rejected':
      return 'rejected';
    case 'failed':
    default:
      return 'failed';
  }
}

// Check if status allows the domain to be used
export function isDomainActive(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized === 'active_manual';
}

// Human-readable status labels
export function getStatusLabel(status: string): string {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'pending_dns':
      return 'Pending DNS Setup';
    case 'verified_dns':
      return 'Waiting for Activation';
    case 'active_manual':
      return 'Active';
    case 'rejected':
      return 'Rejected';
    case 'failed':
      return 'DNS Failed';
    default:
      return status;
  }
}

// Status descriptions for users
export function getStatusDescription(status: string): string {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'pending_dns':
      return 'Configure DNS records at your domain registrar';
    case 'verified_dns':
      return 'DNS verified! Admin will activate your domain shortly';
    case 'active_manual':
      return 'Your domain is live and working';
    case 'rejected':
      return 'Domain was not approved. Contact support for details';
    case 'failed':
      return 'DNS verification failed. Check your DNS settings';
    default:
      return '';
  }
}
