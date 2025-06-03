import { useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';

export const useOfferings = (sport) => {
  const [offerings, setOfferings] = useState<any>(null);

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const res = await Purchases.getOfferings();
        setOfferings(res.current);
      } catch (err) {
        console.error('Error fetching offerings', err);
      }
    };

    if(sport == "pickleball"){
      loadOfferings();
    }

  }, [sport]);

  return offerings;
};
