import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SubscriptionTier } from '@/config/subscriptionTiers';

export function useDeveloperMode() {
  const { user } = useAuth();
  const { settings, updateDeveloperModeSettings } = useSettings();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const hasVerifiedRef = useRef(false);

  const isPurchased = subscriptionTier !== null;
  const isEnabled = settings.developerMode.enabled && isPurchased;

  // Verify subscription from database on mount
  useEffect(() => {
    if (!user || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verifyFromDatabase = async () => {
      setIsVerifying(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_expires_at, developer_mode_purchased')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.subscription_tier) {
          // Check if subscription is still valid
          const expiresAt = profile.subscription_expires_at;
          if (expiresAt && new Date(expiresAt) < new Date() && profile.subscription_tier !== 'ultimate') {
            // Expired
            setSubscriptionTier(null);
            setSubscriptionExpiresAt(null);
          } else {
            setSubscriptionTier(profile.subscription_tier as SubscriptionTier);
            setSubscriptionExpiresAt(expiresAt);
            updateDeveloperModeSettings({ enabled: true, paid: true });
          }
        } else if (profile?.developer_mode_purchased) {
          // Legacy: treat old purchases as ultimate
          setSubscriptionTier('ultimate');
          updateDeveloperModeSettings({ enabled: true, paid: true });
        } else {
          setSubscriptionTier(null);
        }
      } catch (error) {
        console.error('[DevMode] Failed to verify from database:', error);
      } finally {
        setIsVerifying(false);
        setVerified(true);
      }
    };

    verifyFromDatabase();
  }, [user, updateDeveloperModeSettings]);

  const activateSubscription = useCallback(async (tier: SubscriptionTier) => {
    if (!user || !tier) return;

    let expiresAt: string | null = null;
    if (tier === 'starter') {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (tier === 'pro') {
      expiresAt = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    // ultimate = null (perpetual)

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt,
        subscription_purchased_at: new Date().toISOString(),
        developer_mode_purchased: true,
        developer_mode_purchased_at: new Date().toISOString(),
      } as any)
      .eq('user_id', user.id);

    if (error) {
      console.error('[DevMode] Failed to activate subscription:', error);
      toast.error('Failed to activate subscription');
      return;
    }

    setSubscriptionTier(tier);
    setSubscriptionExpiresAt(expiresAt);
    updateDeveloperModeSettings({ enabled: true, paid: true });
  }, [user, updateDeveloperModeSettings]);

  return {
    isPurchased,
    isEnabled,
    isVerifying: isVerifying && !verified,
    isProcessingPayment,
    subscriptionTier,
    subscriptionExpiresAt,
    activateSubscription,
  };
}
