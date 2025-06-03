import { useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';

export const useSubscriptionStatus = (sport) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const entitlements = customerInfo.entitlements.active;

        // Replace "pro_access" with the actual entitlement identifier you used in RevenueCat
        setIsSubscribed(!!entitlements["pro"]);
      } catch (err) {
        console.error('Error checking subscription', err);
      }
    };

    if(sport == "pickleball"){
      checkSubscription();
    } else {
      setIsSubscribed(true);
    }
  }, [sport]);

  return isSubscribed;
};
