export type Rating = 'HT1' | 'HT2' | 'HT3' | 'HT4' | 'LT5';

export interface Config {
  siteTitle: string;
  aspects: string[];
  aspectWeights: Record<string, number>;
  defaultAspectValue: number;
  adminCredentials: { username: string; password: string };
  secretTapCount: number;
  secretTapWindowSeconds: number;
  assetsFolder: string;
  placeholderImage: string;
  discordServerLink: string;
  allowConfigEdit: boolean;
  baseUrl: string;
}

export interface Computed {
  score: number;
  percent: number;
}

export interface Entry {
  id: string;
  name: string;
  image: string;
  aspects: Record<string, Rating | string | undefined>;
  computed: Computed;
  notes?: string;
}

export interface AssetItem {
  name: string;
  path: string;
}
