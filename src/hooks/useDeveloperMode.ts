import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Module-level deduplication to prevent multiple components from triggering simultaneous calls
let verifyInFlight: Promise<boolean> | null = null;
let lastVerifyTime = 0;
const VERIFY_COOLDOWN_MS = 30000; // 30 second cooldown between Stripe API calls

export function useDeveloperMode() {
  const { user } = useAuth();
  const { settings, activateDeveloperMode } = useSettings();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [verifiedPurchase, setVerifiedPurchase] = useState<boolean | null>(null);
  const hasCheckedRef = useRef(false);
  const hasVerifiedRef = useRef(false);

  // Use database-verified status, fallback to localStorage only if not yet verified
  const isPurchased = verifiedPurchase ?? settings.developerMode.paid;
  const isEnabled = settings.developerMode.enabled && isPurchased;

  const verifyPurchase = useCallback(async (force = false) => {
    if (!user) return false;
    
    // If already purchased locally, skip Stripe call
    if (isPurchased && !force) return true;

    // Check cooldown to prevent rate limiting
    const now = Date.now();
    if (!force && now - lastVerifyTime < VERIFY_COOLDOWN_MS) {
      console.log('[DevMode] Skipping verify - cooldown active');
      return false;
    }

    // Deduplicate: if a call is already in flight, reuse it
    if (verifyInFlight) {
      console.log('[DevMode] Reusing in-flight verify call');
      return verifyInFlight;
    }
    
    setIsVerifying(true);
    const promise = (async () => {
      try {
        // First check the database profile before hitting Stripe
        const { data: profile } = await supabase
          .from('profiles')
          .select('developer_mode_purchased')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.developer_mode_purchased) {
          activateDeveloperMode();
          return true;
        }

        // Only call Stripe if DB says not purchased
        lastVerifyTime = Date.now();
        const { data, error } = await supabase.functions.invoke('verify-developer-payment');
        
        if (error) {
          console.error('Verification error:', error);
          return false;
        }

        if (data?.purchased) {
          activateDeveloperMode();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to verify purchase:', error);
        return false;
      } finally {
        setIsVerifying(false);
        verifyInFlight = null;
      }
    })();

    verifyInFlight = promise;
    return promise;
  }, [user, isPurchased, activateDeveloperMode]);

  const initiatePayment = async () => {
    if (!user) {
      toast.error('Please log in to purchase Developer Mode');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-developer-payment');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment: ' + error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Verify purchase from database on mount (security: don't trust localStorage alone)
  useEffect(() => {
    if (!user || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verifyFromDatabase = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('developer_mode_purchased')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.developer_mode_purchased) {
          setVerifiedPurchase(true);
          activateDeveloperMode();
        } else {
          setVerifiedPurchase(false);
        }
      } catch (error) {
        console.error('[DevMode] Failed to verify from database:', error);
        setVerifiedPurchase(false);
      }
    };

    verifyFromDatabase();
  }, [user, activateDeveloperMode]);

  // Check for payment success on page load (only once)
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success' && user) {
      verifyPurchase(true).then((success) => {
        if (success) {
          setVerifiedPurchase(true);
          toast.success('🎉 Developer Mode activated! Lifetime access unlocked.');
        }
      });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user, verifyPurchase]);

  return {
    isPurchased,
    isEnabled,
    isVerifying,
    isProcessingPayment,
    verifyPurchase,
    initiatePayment,
  };
}