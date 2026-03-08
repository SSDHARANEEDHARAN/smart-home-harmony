export type SubscriptionTier = 'starter' | 'pro' | 'ultimate' | null;

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: string;
  durationLabel: string;
  platforms: string[]; // platform IDs unlocked
  features: string[];
  badge?: string;
}

export const SUBSCRIPTION_TIERS: TierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1499,
    currency: 'INR',
    duration: '1 year',
    durationLabel: '/year',
    platforms: ['esp32', 'thingspeak', 'esp-rainmaker'],
    features: [
      'ESP32 microcontroller support',
      'ThingSpeak IoT analytics',
      'ESP RainMaker cloud',
      '1 year of updates',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7999,
    currency: 'INR',
    duration: '3 years',
    durationLabel: '/3 years',
    platforms: ['esp32', 'thingspeak', 'esp-rainmaker', 'raspberry-pi', 'esphome'],
    features: [
      'Everything in Starter',
      'Raspberry Pi support',
      'ESPHome integration',
      '3 years of updates',
    ],
    badge: 'Popular',
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 15999,
    currency: 'INR',
    duration: 'Perpetual',
    durationLabel: ' lifetime',
    platforms: ['esp32', 'thingspeak', 'esp-rainmaker', 'raspberry-pi', 'esphome', 'node-server'],
    features: [
      'Everything in Pro',
      'Own server accessibility',
      'Node.js programming operations',
      'Lifetime updates & support',
    ],
    badge: 'Best Value',
  },
];

// Free platforms available to all users
export const FREE_PLATFORMS = ['firebase', 'mqtt'];

// Check if a platform is unlocked for a given tier
export function isPlatformUnlocked(platformId: string, tier: SubscriptionTier): boolean {
  if (FREE_PLATFORMS.includes(platformId)) return true;
  if (!tier) return false;
  const tierConfig = SUBSCRIPTION_TIERS.find(t => t.id === tier);
  if (!tierConfig) return false;
  return tierConfig.platforms.includes(platformId);
}

// Get the minimum tier required for a platform
export function getRequiredTier(platformId: string): SubscriptionTier {
  if (FREE_PLATFORMS.includes(platformId)) return null;
  for (const tier of SUBSCRIPTION_TIERS) {
    if (tier.platforms.includes(platformId)) return tier.id;
  }
  return 'ultimate';
}

// Get tier config by id
export function getTierConfig(tier: SubscriptionTier): TierConfig | undefined {
  return SUBSCRIPTION_TIERS.find(t => t.id === tier);
}
