export const userConstraints = {
  selectOptions: {
    roles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    status: ['ACTIVE', 'INACTIVE'],
  },
};

export const accountConstraints = {
  selectOptions: {
    industry: [
      'Agriculture',
      'Apparel',
      'Banking',
      'Biotechnology',
      'Chemicals',
      'Communications',
      'Construction',
      'Consulting',
      'Education',
      'Electronics',
      'Energy',
      'Engineering',
      'Entertainment',
      'Environmental',
      'Finance',
      'Food & Beverage',
      'Government',
      'Healthcare',
      'Hospitality',
      'Insurance',
      'Machinery',
      'Manufacturing',
      'Media',
      'Not For Profit',
      'Other',
      'Recreation',
      'Retail',
      'Shipping',
      'Technology',
      'Telecommunications',
      'Transportation',
      'Utilities',
    ],
    type: ['CUSTOMER', 'PARTNER'],
    title: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof'],
  },
};

export const orderConstraints = {
  selectOptions: {
    status: ['DRAFT', 'ACTIVATED', 'CANCELLED'],
  },
};


export const priceListConstraints = {
  selectOptions: {
    country: [
      'Angola',
      'Benin',
      'Botswana',
      'Burkina Faso',
      'Burundi',
      'Cameroon',
      'Cape Verde',
      'Central African Republic',
      'Chad',
      'Comoros',
      'Congo',
      'Djibouti',
      'DRC',
      'Equatorial Guinea',
      'Eritrea',
      'Eswatini',
      'Ethiopia',
      'Gabon',
      'Gambia',
      'Ghana',
      'Guinea',
      'Guinea-Bissau',
      'Ivory Coast',
      'Kenya',
      'Lesotho',
      'Liberia',
      'Madagascar',
      'Malawi',
      'Mali',
      'Mauritania',
      'Mauritius',
      'Mozambique',
      'Namibia',
      'Niger',
      'Nigeria',
      'Rwanda',
      'Sao Tome and Principe',
      'Senegal',
      'Seychelles',
      'Sierra Leone',
      'Somalia',
      'South Africa',
      'South Sudan',
      'Sudan',
      'Tanzania',
      'Togo',
      'Uganda',
      'Zambia',
      'Zimbabwe',
    ],

    currencyCode: [
      { value: 'AOA', label: 'Angola Kwanza' },
      { value: 'BWP', label: 'Botswana Pula' },
      { value: 'CDF', label: 'Franc Congolais' },
      { value: 'DJF', label: 'Dijibouti Franc' },
      { value: 'ERN', label: 'Eritrea Nakfa' },
      { value: 'ETB', label: 'Ethiopian Birr' },
      { value: 'EUR', label: 'Euro' },
      { value: 'GBP', label: 'British Pound' },
      { value: 'GHS', label: 'Ghanaian Cedi' },
      { value: 'KES', label: 'Kenyan Shilling' },
      { value: 'MUR', label: 'Mauritius Rupee' },
      { value: 'MWK', label: 'Malawi Kwacha' },
      { value: 'MZN', label: 'Mozambique New Metical' },
      { value: 'NAD', label: 'Namibian Dollar' },
      { value: 'NGN', label: 'Nigerian Naira' },
      { value: 'SCR', label: 'Seychelles Rupee' },
      { value: 'SDG', label: 'Sudanese Pound' },
      { value: 'SOS', label: 'Somali Shilling' },
      { value: 'SSP', label: 'South Sudan Pound' },
      { value: 'SZL', label: 'Eswatini Lilageni' },
      { value: 'TZS', label: 'Tanzanian Shilling' },
      { value: 'UGX', label: 'Ugandan Shilling' },
      { value: 'USD', label: 'U.S. Dollar' },
      { value: 'ZAR', label: 'South African Rand' },
      { value: 'ZMW', label: 'Zambian Kwacha' },
    ],

    accountType: ['B2B', 'B2C'],
  },
};

export const pricelistEntryConstraints = {
  selectOptions: {
    currency: [
      { key: 'AOA', name: 'Angola Kwanza' },
      { key: 'BWP', name: 'Botswana Pula' },
      { key: 'CDF', name: 'Franc Congolais' },
      { key: 'DJF', name: 'Dijibouti Franc' },
      { key: 'ERN', name: 'Eritrea Nakfa' },
      { key: 'ETB', name: 'Ethiopian Birr' },
      { key: 'EUR', name: 'Euro' },
      { key: 'GBP', name: 'British Pound' },
      { key: 'GHS', name: 'Ghanaian Cedi' },
      { key: 'KES', name: 'Kenyan Shilling' },
      { key: 'MUR', name: 'Mauritius Rupee' },
      { key: 'MWK', name: 'Malawi Kwacha' },
      { key: 'MZN', name: 'Mozambique New Metical' },
      { key: 'NAD', name: 'Namibian Dollar' },
      { key: 'NGN', name: 'Nigerian Naira' },
      { key: 'SCR', name: 'Seychelles Rupee' },
      { key: 'SDG', name: 'Sudanese Pound' },
      { key: 'SOS', name: 'Somali Shilling' },
      { key: 'SSP', name: 'South Sudan Pound' },
      { key: 'SZL', name: 'Eswatini Lilageni' },
      { key: 'TZS', name: 'Tanzanian Shilling' },
      { key: 'UGX', name: 'Ugandan Shilling' },
      { key: 'USD', name: 'U.S. Dollar' },
      { key: 'ZAR', name: 'South African Rand' },
      { key: 'ZMW', name: 'Zambian Kwacha' },
    ],
    billingFrequency: ['DAILY', 'MONTHLY', 'ONE_TIME', 'USAGE', 'WEEKLY', 'YEARLY'],
  },
};

export const productConstraints = {
  selectOptions: {
    type: ['GOOD', 'SERVICE', 'SUBSCRIPTION'],
    defaultBillingPeriod: ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'],
    isArchived: ['Active', 'InActive'],
    specification: ['Simple', 'Bundle'],
  },
};
export const pricebookConstraints = {
  selectOptions: {
    type: ['CUSTOM', 'STANDARD'],
  },
};

export const bundleItemConstraints = {
  selectOptions: {
    pricingMode: ['INHERIT', 'OVERRIDE', 'INCLUDED'],
    isRequired: [
      { label: 'True', value: 'true' },
      { label: 'False', value: 'false' },
    ],
  },
};

export const FIXED_FILTER_OPTIONS: Record<string, string[]> = {
  roles: userConstraints.selectOptions.roles,
  accountType: accountConstraints.selectOptions.type,
  industry: accountConstraints.selectOptions.industry,
  productType: productConstraints.selectOptions.type,
  isArchived: productConstraints.selectOptions.isArchived,
  pricebookType: pricebookConstraints.selectOptions.type,
  orderStatus: orderConstraints.selectOptions.status,
};
