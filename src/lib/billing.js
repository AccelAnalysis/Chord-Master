const STORAGE_KEY = 'chord-master-entitlements-v1';

const defaults = {
  plan: 'free',
  purchasedPacks: [],
};

export const loadEntitlements = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
};

export const saveEntitlements = (entitlements) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entitlements));
  } catch {
    // Storage can be unavailable in restrictive browser contexts.
  }
};

export const canUsePremiumAccess = (entitlements) => ['plus', 'pro'].includes(entitlements.plan);

export const canAccessPreset = (access, entitlements) => {
  if (access === 'free') return true;
  if (entitlements.plan === 'pro') return true;
  if (access === 'plus') return entitlements.plan === 'plus';
  return entitlements.plan === 'plus' || entitlements.purchasedPacks.includes(access);
};

export const mockPurchasePlan = (entitlements, plan) => {
  const next = { ...entitlements, plan };
  saveEntitlements(next);
  return next;
};

export const mockPurchasePack = (entitlements, packId) => {
  const next = {
    ...entitlements,
    purchasedPacks: [...new Set([...entitlements.purchasedPacks, packId])],
  };
  saveEntitlements(next);
  return next;
};
