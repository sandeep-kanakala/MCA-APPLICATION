export const EContactStatus = [
  'ACTIVE',
  'DECEASED',
  'EMIGRATED',
  'FORGET_ME',
  'POTENTIAL',
  'FRAUD_INVESTIGATION',
  'FRAUD',
  'CLOSED',
  'SUSPENDED',
] as const;

export const EAccountStatus = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PENDING_CONTRACT_APPROVAL',
  'ACTIVE',
  'CLOSED',
  'DORMANT',
  'FORGET_ME',
  'FRAUD',
  'FRAUD_INVESTIGATION',
  'PIRACY',
  'PIRACY_INVESTIGATION',
  'PROSPECT',
  'SUSPENDED',
] as const;

export const EGender = ['MALE', 'FEMALE'] as const;

export const EAccountType = ['PARTNER', 'CUSTOMER'] as const;

export const EAddressType = ['SHIPPING', 'BILLING'] as const;

export const EProductStatus = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE'] as const;

export const EBillingModel = ['POD', 'ARC'] as const;
