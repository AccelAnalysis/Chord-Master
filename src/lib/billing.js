const STORAGE_KEY = 'chord-master-entitlements-v1';

const defaults = {
  plan: 'free',
  purchasedPacks: [],
};

const PLAN_RANK = { free: 0, plus: 1, pro: 2 };

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

export const hasPlan = (entitlements, requiredPlan = 'free') =>
  (PLAN_RANK[entitlements.plan] ?? 0) >= (PLAN_RANK[requiredPlan] ?? 0);

export const canUsePremiumAccess = (entitlements) => hasPlan(entitlements, 'plus');

export const canAccessRequirement = (access, entitlements) => {
  if (!access || access === 'free') return true;
  if (access === 'plus' || access === 'pro') return hasPlan(entitlements, access);
  if (entitlements.plan === 'pro') return true;
  return entitlements.purchasedPacks.includes(access);
};

export const canAccessPreset = canAccessRequirement;

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
