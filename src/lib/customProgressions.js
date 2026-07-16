const STORAGE_KEY = 'chord-master-custom-progressions-v1';

export const loadCustomProgressions = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const persistCustomProgressions = (progressions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressions));
  } catch {
    // Storage can be unavailable in restrictive browser contexts.
  }
};

export const saveCustomProgression = (progressions, progression) => {
  const now = new Date().toISOString();
  const existingIndex = progressions.findIndex((item) => item.id === progression.id);
  const normalized = {
    ...progression,
    id: progression.id,
    name: progression.name.trim() || 'Untitled Progression',
    updatedAt: now,
    createdAt: progression.createdAt ?? now,
  };

  const next = existingIndex >= 0
    ? progressions.map((item, index) => index === existingIndex ? normalized : item)
    : [normalized, ...progressions];
  persistCustomProgressions(next);
  return next;
};

export const deleteCustomProgression = (progressions, progressionId) => {
  const next = progressions.filter((item) => item.id !== progressionId);
  persistCustomProgressions(next);
  return next;
};
