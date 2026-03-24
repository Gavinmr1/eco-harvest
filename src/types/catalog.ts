export type SubscriptionPlanOption = {
  label: string;
  value: string;
  description: string;
  weeks: number;
};

export type PreferenceOption = {
  label: string;
  description: string;
};

export type UpsertCatalogPlanInput = {
  value: string;
  label: string;
  description: string;
  weeks: number;
};

export type UpsertCatalogPreferenceInput = {
  label: string;
  description: string;
};
