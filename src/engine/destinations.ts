/**
 * HOLDPOINT Simulated Destination Systems
 * Every mock destination is a fully inspectable, stateful service
 * with real versions, transaction ledgers, failure injections, and snapshot states.
 */

import { DestinationId, RecoverySnapshot } from './types';

export interface PhotoItem {
  id: string;
  name: string;
  album: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  isOriginalProtected: boolean;
  sizeBytes: number;
  uploadedAt: string;
  deleted: boolean;
}

export interface CloudResource {
  id: string;
  name: string;
  type: 'rds_postgres' | 's3_bucket' | 'iam_key' | 'k8s_cluster';
  environment: 'production' | 'staging' | 'development';
  status: 'running' | 'deleting' | 'deleted' | 'restoring';
  version: number;
  deletionProtected: boolean;
  lastBackupId?: string;
  permissions: Record<string, string>;
  activeKeyFingerprint: string;
}

export interface CodeRepoState {
  repoName: string;
  currentBranch: string;
  defaultBranch: string;
  deployLock: boolean;
  productionReleaseVersion: string;
  commits: { id: string; message: string; author: string; timestamp: number }[];
  pullRequests: { id: number; title: string; status: 'open' | 'merged' | 'closed'; requiresApproval: boolean }[];
}

export interface PaymentTransaction {
  id: string;
  actorId: string;
  recipient: string;
  recipientAccount: string;
  amount: number;
  currency: string;
  timestamp: number;
  status: 'reserved' | 'settled' | 'refunded' | 'rejected';
  reconciled: boolean;
  idempotencyKey: string;
}

export interface EmailCustomerRecord {
  customerId: string;
  name: string;
  email: string;
  tier: 'free' | 'enterprise';
  refundTotalYtd: number;
  sentEmails: { id: string; subject: string; recipient: string; sentAt: number; attachments: string[] }[];
}

export interface UserSecurityState {
  userId: string;
  name: string;
  primaryEmail: string;
  recoveryEmail: string;
  recoveryPhone: string;
  recoveryLocked: boolean;
  trustedContacts: string[];
  pendingRecoveryAttempts: { id: string; requestedAt: number; requestedFromIp: string; approved: boolean }[];
  activeSessionsCount: number;
}

export class DestinationRegistry {
  private static instance: DestinationRegistry;

  // Real in-memory state stores
  public photos: PhotoItem[] = [];
  public cloudResources: CloudResource[] = [];
  public repo: CodeRepoState = {
    repoName: 'holdpoint-core-v2',
    currentBranch: 'main',
    defaultBranch: 'main',
    deployLock: false,
    productionReleaseVersion: 'v2.4.1',
    commits: [
      { id: 'c90f1a2', message: 'feat: add bounded approval tokens', author: 'priya@holdpoint.internal', timestamp: Date.now() - 3600000 * 24 },
      { id: 'b81e4d1', message: 'fix: fail-closed detector gap fallback', author: 'priya@holdpoint.internal', timestamp: Date.now() - 3600000 * 12 },
    ],
    pullRequests: [
      { id: 142, title: 'Release 2.5.0 Production Deployment', status: 'open', requiresApproval: true },
    ]
  };

  public bankBalance: number = 245000;
  public dailyBudgetUsed: number = 4200;
  public dailyBudgetCap: number = 25000;
  public payments: PaymentTransaction[] = [];
  public trustedBeneficiaries: { id: string; name: string; account: string; verified: boolean }[] = [
    { id: 'ben-01', name: 'Apex Infrastructure Ltd', account: 'US89283749219', verified: true },
    { id: 'ben-02', name: 'Global Payroll Operations', account: 'US99182371923', verified: true },
  ];

  public customers: Record<string, EmailCustomerRecord> = {
    'cust-101': {
      customerId: 'cust-101',
      name: 'Acme Logistics Inc',
      email: 'finance@acmelogistics.com',
      tier: 'enterprise',
      refundTotalYtd: 450,
      sentEmails: []
    },
    'cust-102': {
      customerId: 'cust-102',
      name: 'Dr. Sarah Lin',
      email: 's.lin@oceanresearch.edu',
      tier: 'free',
      refundTotalYtd: 0,
      sentEmails: []
    }
  };

  public userSecurity: Record<string, UserSecurityState> = {
    'dev-user': {
      userId: 'dev-user',
      name: 'Dev Sharma',
      primaryEmail: 'dev.sharma@gmail.com',
      recoveryEmail: 'dev.backup.secure@gmail.com',
      recoveryPhone: '+91 98765 43210',
      recoveryLocked: true, // Protection locked against scam attack
      trustedContacts: ['rohan.friend@university.edu'],
      pendingRecoveryAttempts: [],
      activeSessionsCount: 2
    },
    'rohan-user': {
      userId: 'rohan-user',
      name: 'Rohan Varma',
      primaryEmail: 'rohan@university.edu',
      recoveryEmail: 'rohan.personal@gmail.com',
      recoveryPhone: '+91 91234 56789',
      recoveryLocked: false,
      trustedContacts: ['meera.sister@family.org'],
      pendingRecoveryAttempts: [],
      activeSessionsCount: 1
    }
  };

  // Reversible snapshots
  public snapshots: Map<string, RecoverySnapshot> = new Map();

  // Known processed idempotency keys to prevent duplicates
  public processedIdempotencyKeys: Set<string> = new Set();

  constructor() {
    this.seedDefaults();
  }

  public static getInstance(): DestinationRegistry {
    if (!DestinationRegistry.instance) {
      DestinationRegistry.instance = new DestinationRegistry();
    }
    return DestinationRegistry.instance;
  }

  public seedDefaults(): void {
    this.processedIdempotencyKeys.clear();
    this.snapshots.clear();

    // 1. Photo Vault: 14,000 photos, 1,240 duplicates, original protected
    this.photos = [];
    // Seed sample representative photos
    for (let i = 1; i <= 20; i++) {
      this.photos.push({
        id: `photo-orig-${i}`,
        name: `Family_Trip_Summer_2024_${i}.raw`,
        album: 'Family Archive (Protected)',
        isDuplicate: false,
        isOriginalProtected: true,
        sizeBytes: 24500000,
        uploadedAt: '2024-07-12',
        deleted: false
      });
    }
    // Seed 15 representative duplicates
    for (let i = 1; i <= 15; i++) {
      this.photos.push({
        id: `photo-dup-${i}`,
        name: `Family_Trip_Summer_2024_${i}_copy.jpg`,
        album: 'Camera Roll Auto-Backup',
        isDuplicate: true,
        duplicateOf: `photo-orig-${i}`,
        isOriginalProtected: false,
        sizeBytes: 3200000,
        uploadedAt: '2024-07-14',
        deleted: false
      });
    }

    // 2. Cloud Infra: Production RDS database, buckets, keys
    this.cloudResources = [
      {
        id: 'res-rds-prod',
        name: 'prod-aurora-postgres-cluster',
        type: 'rds_postgres',
        environment: 'production',
        status: 'running',
        version: 14,
        deletionProtected: true,
        lastBackupId: 'snap-rds-daily-09',
        permissions: { 'admin-role': 'full', 'app-worker': 'read_write' },
        activeKeyFingerprint: 'sha256:7f81bc3919e102f9'
      },
      {
        id: 'res-s3-evidence',
        name: 'prod-audit-evidence-worm-vault',
        type: 's3_bucket',
        environment: 'production',
        status: 'running',
        version: 3,
        deletionProtected: true,
        lastBackupId: 'snap-s3-glacier-01',
        permissions: { 'ciso-auditor': 'read_only' },
        activeKeyFingerprint: 'sha256:1a99bb82837411bc'
      },
      {
        id: 'res-iam-karan',
        name: 'karan-admin-cloud-key',
        type: 'iam_key',
        environment: 'production',
        status: 'running',
        version: 1,
        deletionProtected: false,
        permissions: { 'karan': 'admin' },
        activeKeyFingerprint: 'sha256:88eeff1100aa22bb'
      }
    ];

    // Take initial independent recovery snapshots
    this.takeSnapshot('cloud_infra', 'res-rds-prod', 14, {
      id: 'res-rds-prod',
      name: 'prod-aurora-postgres-cluster',
      tables: ['users', 'audit_ledger', 'action_contracts', 'policy_store'],
      recordsCount: 1420500,
      activeKeyFingerprint: 'sha256:7f81bc3919e102f9',
      permissions: { 'admin-role': 'full', 'app-worker': 'read_write' }
    });

    // 3. Bank & Payments
    this.bankBalance = 245000;
    this.dailyBudgetUsed = 4200;
    this.dailyBudgetCap = 25000;
    this.payments = [
      {
        id: 'pay-tx-1001',
        actorId: 'neha@holdpoint.internal',
        recipient: 'Apex Infrastructure Ltd',
        recipientAccount: 'US89283749219',
        amount: 4200,
        currency: 'USD',
        timestamp: Date.now() - 7200000,
        status: 'settled',
        reconciled: true,
        idempotencyKey: 'idemp-seed-1'
      }
    ];
  }

  public takeSnapshot(destination: DestinationId, resourceId: string, version: number, data: any): string {
    const snapshotId = `snap-${destination}-${resourceId}-v${version}-${Date.now().toString(36)}`;
    const snapshot: RecoverySnapshot = {
      snapshotId,
      destination,
      resourceId,
      version,
      data: JSON.parse(JSON.stringify(data)),
      permissions: { owner: 'security_custodian', policy: 'independent_authority_hold' },
      encryptionKeyFingerprint: 'hsm-key-vault-sha256-verified-root',
      capturedAt: Date.now(),
      authority: 'independent_vault'
    };
    this.snapshots.set(snapshotId, snapshot);
    return snapshotId;
  }

  // Execution dispatch for destinations
  public executeAction(
    destination: DestinationId,
    actionType: string,
    resourceId: string,
    params: Record<string, any>,
    idempotencyKey: string
  ): { success: boolean; result: any; error?: string } {
    // Idempotency check: if processed already, reject duplicate delivery
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      return {
        success: false,
        error: `IDEMPOTENCY_REJECTED: Action with key ${idempotencyKey} has already been settled. Replay rejected.`,
        result: null
      };
    }

    if (destination === 'photo_vault') {
      if (actionType === 'delete_duplicates') {
        const deletedIds: string[] = [];
        this.photos.forEach(p => {
          if (p.isDuplicate && !p.isOriginalProtected) {
            p.deleted = true;
            deletedIds.push(p.id);
          }
        });
        this.processedIdempotencyKeys.add(idempotencyKey);
        return { success: true, result: { deletedCount: deletedIds.length, deletedIds } };
      }
      if (actionType === 'delete_originals_or_all') {
        // Attempting to delete protected originals!
        const protectedItem = this.photos.find(p => p.id === resourceId && p.isOriginalProtected);
        if (protectedItem) {
          return { success: false, error: 'PROTECTED_ASSET_VIOLATION: Cannot delete original protected photo archives.', result: null };
        }
      }
    }

    if (destination === 'cloud_infra') {
      if (actionType === 'drop_database' || actionType === 'delete_bucket') {
        const res = this.cloudResources.find(r => r.id === resourceId);
        if (!res) return { success: false, error: 'Resource not found', result: null };
        if (res.deletionProtected && !params.forceOverrideWithDualKey) {
          return { success: false, error: `DELETION_PROTECTED: ${res.name} has deletion protection enabled. Requires HSM dual approval.`, result: null };
        }
        res.status = 'deleted';
        res.version += 1;
        this.processedIdempotencyKeys.add(idempotencyKey);
        return { success: true, result: { resourceId: res.id, newStatus: 'deleted', version: res.version } };
      }
      if (actionType === 'rotate_iam_key') {
        const res = this.cloudResources.find(r => r.id === resourceId);
        if (res) {
          if (params.concurrentStaleWrite) {
            return {
              success: false,
              error: `STALE_VERSION_CONFLICT: Attempted commit with stale version 1 against current destination version ${res.version}.`,
              result: null
            };
          }
          res.activeKeyFingerprint = `sha256:${Math.random().toString(16).substring(2, 10)}`;
          res.version += 1;
          this.processedIdempotencyKeys.add(idempotencyKey);
          return { success: true, result: { resourceId: res.id, newKeyFingerprint: res.activeKeyFingerprint } };
        }
      }
    }

    if (destination === 'code_repo') {
      if (actionType === 'deploy_to_production') {
        if (this.repo.deployLock && !params.emergencyOverride) {
          return { success: false, error: 'DEPLOY_LOCKED: Production repository deployment window closed.', result: null };
        }
        this.repo.productionReleaseVersion = params.releaseTag || 'v2.5.0';
        this.repo.commits.unshift({
          id: `dep-${Math.random().toString(16).substring(2, 8)}`,
          message: `deploy: release ${this.repo.productionReleaseVersion}`,
          author: params.author || 'priya@holdpoint.internal',
          timestamp: Date.now()
        });
        this.processedIdempotencyKeys.add(idempotencyKey);
        return { success: true, result: { deployedVersion: this.repo.productionReleaseVersion } };
      }
    }

    if (destination === 'bank_payments') {
      if (actionType === 'transfer_funds' || actionType === 'pay_invoice') {
        const amount = Number(params.amount) || 0;
        if (amount > this.bankBalance) {
          return { success: false, error: 'INSUFFICIENT_FUNDS', result: null };
        }
        this.bankBalance -= amount;
        this.dailyBudgetUsed += amount;
        const tx: PaymentTransaction = {
          id: `tx-${Date.now().toString(36)}`,
          actorId: params.actorId || 'neha@holdpoint.internal',
          recipient: params.recipient || 'Unknown',
          recipientAccount: params.recipientAccount || 'UNKNOWN_ACC',
          amount,
          currency: params.currency || 'USD',
          timestamp: Date.now(),
          status: 'settled',
          reconciled: true,
          idempotencyKey
        };
        this.payments.unshift(tx);
        this.processedIdempotencyKeys.add(idempotencyKey);
        return { success: true, result: tx };
      }
    }

    if (destination === 'email_crm') {
      if (actionType === 'send_email') {
        const cust = this.customers['cust-101'];
        cust.sentEmails.unshift({
          id: `mail-${Date.now().toString(36)}`,
          subject: params.subject || 'Notice',
          recipient: params.recipient || 'customer@acmelogistics.com',
          sentAt: Date.now(),
          attachments: params.attachments || []
        });
        this.processedIdempotencyKeys.add(idempotencyKey);
        return { success: true, result: { delivered: true, recipient: params.recipient } };
      }
      if (actionType === 'issue_refund') {
        const cust = this.customers[params.customerId || 'cust-101'];
        if (cust) {
          const amt = Number(params.amount) || 0;
          cust.refundTotalYtd += amt;
          this.processedIdempotencyKeys.add(idempotencyKey);
          return { success: true, result: { refunded: amt, totalYtd: cust.refundTotalYtd } };
        }
      }
    }

    if (destination === 'user_identity') {
      if (actionType === 'reset_account_recovery') {
        const user = this.userSecurity[resourceId] || this.userSecurity['dev-user'];
        if (user.recoveryLocked && !params.securityPasscodeVerified) {
          return { success: false, error: 'SECURITY_LOCKED: Recovery settings locked by user against account takeover.', result: null };
        }
        user.recoveryEmail = params.newEmail || user.recoveryEmail;
        this.processedIdempotencyKeys.add(idempotencyKey);
        return { success: true, result: { updated: true, user } };
      }
    }

    // Default fallback
    this.processedIdempotencyKeys.add(idempotencyKey);
    return { success: true, result: { executed: true, destination, actionType } };
  }

  // Restore drill executor
  public performRestoreDrill(snapshotId: string): {
    success: boolean;
    restoredResourceId: string;
    verifiedIntegrity: boolean;
    verifiedPermissions: boolean;
    verifiedKeyFingerprint: boolean;
    logs: string[];
  } {
    const snap = this.snapshots.get(snapshotId);
    if (!snap) {
      return {
        success: false,
        restoredResourceId: '',
        verifiedIntegrity: false,
        verifiedPermissions: false,
        verifiedKeyFingerprint: false,
        logs: [`Snapshot ${snapshotId} not found in independent vault.`]
      };
    }

    const logs: string[] = [
      `Initializing restore drill for snapshot ${snapshotId}`,
      `Authority validated: ${snap.authority} (Independent Security Custodian)`,
      `Restoring resource ${snap.resourceId} to version ${snap.version}`,
    ];

    if (snap.destination === 'cloud_infra') {
      const res = this.cloudResources.find(r => r.id === snap.resourceId);
      if (res) {
        res.status = 'running';
        res.version = snap.version;
        res.permissions = { ...snap.data.permissions };
        res.activeKeyFingerprint = snap.data.activeKeyFingerprint;
        logs.push(`State rolled back to version ${snap.version}`);
        logs.push(`Verified cryptographic key signature: ${snap.data.activeKeyFingerprint}`);
        logs.push(`Verified IAM role bindings: ${JSON.stringify(res.permissions)}`);
        return {
          success: true,
          restoredResourceId: res.id,
          verifiedIntegrity: true,
          verifiedPermissions: true,
          verifiedKeyFingerprint: true,
          logs
        };
      }
    }

    logs.push('Resource restored successfully.');
    return {
      success: true,
      restoredResourceId: snap.resourceId,
      verifiedIntegrity: true,
      verifiedPermissions: true,
      verifiedKeyFingerprint: true,
      logs
    };
  }
}
