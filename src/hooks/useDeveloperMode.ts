 import { useState, useEffect, useCallback } from 'react';
 import { useAuth } from './useAuth';
 import { useSettings } from './useSettings';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 export function useDeveloperMode() {
   const { user } = useAuth();
   const { settings, activateDeveloperMode } = useSettings();
   const [isVerifying, setIsVerifying] = useState(false);
   const [isProcessingPayment, setIsProcessingPayment] = useState(false);
 
   const isPurchased = settings.developerMode.paid;
   const isEnabled = settings.developerMode.enabled;
 
   const verifyPurchase = useCallback(async () => {
     if (!user) return false;
     
     setIsVerifying(true);
     try {
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
     }
   }, [user, activateDeveloperMode]);
 
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
 
   // Check for payment success on page load
   useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const paymentStatus = urlParams.get('payment');
     
     if (paymentStatus === 'success' && user) {
       verifyPurchase().then((success) => {
         if (success) {
           toast.success('🎉 Developer Mode activated! Lifetime access unlocked.');
         }
       });
       // Clear URL params
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