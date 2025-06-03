import { useSubscriptionStatus } from './useSubscriptionStatus';
import { useOfferings } from './useOfferings';

export const useRevenueCat = (sport) => {
  const offerings = useOfferings(sport);
  const isSubscribed = useSubscriptionStatus(sport);
  return { offerings, isSubscribed };
};