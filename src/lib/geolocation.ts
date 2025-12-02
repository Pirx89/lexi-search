// Standort-Funktionen mit Haversine-Distanzberechnung

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Standort über Browser-Geolocation-API abfragen
// Datenschutzkonform: Browser fragt automatisch nach Erlaubnis
export function requestUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation wird von diesem Browser nicht unterstützt.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Standortfreigabe wurde verweigert.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Standort nicht verfügbar.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Zeitüberschreitung bei Standortabfrage.'));
            break;
          default:
            reject(new Error('Unbekannter Fehler bei Standortabfrage.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 Minuten Cache
      }
    );
  });
}

// Haversine-Formel zur Berechnung der Distanz zwischen zwei Koordinaten
// Rückgabe in Kilometern
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Erdradius in Kilometern
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Distanz formatieren (z.B. "12,3 km" oder "850 m")
export function formatDistance(distanceKm: number, lang: string = 'de'): string {
  if (distanceKm < 1) {
    // Unter 1 km: in Metern anzeigen
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  } else if (distanceKm < 10) {
    // Unter 10 km: eine Dezimalstelle
    const formatted = lang === 'de' 
      ? distanceKm.toFixed(1).replace('.', ',')
      : distanceKm.toFixed(1);
    return `${formatted} km`;
  } else {
    // Ab 10 km: ohne Dezimalstelle
    return `${Math.round(distanceKm)} km`;
  }
}
