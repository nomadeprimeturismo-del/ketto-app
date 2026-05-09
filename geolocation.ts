import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const startLocationTracking = (userId: string, userType: 'passageiro' | 'motorista') => {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported');
    return null;
  }

  const collection = userType === 'motorista' ? 'drivers' : 'users';

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        await updateDoc(doc(db, collection, userId), {
          latitude,
          longitude,
          lastLocationUpdate: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating location:', error);
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );

  return watchId;
};

export const stopLocationTracking = (watchId: number) => {
  navigator.geolocation.clearWatch(watchId);
};
