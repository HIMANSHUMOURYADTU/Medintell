import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Clock, Search, Star, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Facility {
  place_id: string;
  name: string;
  category: string;
  vicinity: string;
  address_line1: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  contact?: {
    phone: string;
  };
  distance: string;
  opening_hours?: string;
  rating: string;
}

interface LocationInfo {
  lat: number;
  lng: number;
}

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [manualLocation, setManualLocation] = useState('');
  const [facilityType, setFacilityType] = useState('all');
  const [radius, setRadius] = useState('5');
  const [facilityFilter, setFacilityFilter] = useState('');

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Clear all facility markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Find user's current location
  const findUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    setIsLoading(true);
    setLocationStatus({ type: 'info', message: 'Getting your location...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(location);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 15);
          
          // Clear existing markers
          clearMarkers();
          
          // Remove existing user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          
          // Add user location marker
          userMarkerRef.current = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
              html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              className: 'user-location-marker'
            })
          }).addTo(mapInstanceRef.current);
          
          userMarkerRef.current.bindPopup("Your Location");
        }
        
        setLocationStatus({
          type: 'success',
          message: `Location found: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        });
        
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        let message = 'An unknown error occurred while getting location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        
        setLocationStatus({ type: 'error', message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Search for location manually
  const searchManualLocation = async () => {
    if (!manualLocation.trim()) {
      setLocationStatus({
        type: 'warning',
        message: 'Please enter an address, city, or ZIP code.'
      });
      return;
    }

    setIsLoading(true);
    setLocationStatus({ type: 'info', message: 'Searching for location...' });

    try {
      // First try to search for hospitals with this name
      const hospitalSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation + ' hospital')}&limit=5&addressdetails=1`;
      
      const hospitalResponse = await fetch(hospitalSearchUrl);
      const hospitalData = await hospitalResponse.json();
      
      if (hospitalData && hospitalData.length > 0) {
        // Found hospital(s) - use the first one
        const hospital = hospitalData[0];
        const location = {
          lat: parseFloat(hospital.lat),
          lng: parseFloat(hospital.lon)
        };
        
        setUserLocation(location);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 16);
          
          clearMarkers();
          
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          
          userMarkerRef.current = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
              html: '<div style="background-color: #28a745; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              className: 'user-location-marker'
            })
          }).addTo(mapInstanceRef.current);
        }
        
        setLocationStatus({
          type: 'success',
          message: `Hospital found: ${hospital.display_name}`
        });
        
        // Auto-search for nearby facilities
        await searchNearbyFacilities(location);
      } else {
        // No hospital found, try general location search
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1&addressdetails=1`;
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const location = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
          
          setUserLocation(location);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 15);
            
            clearMarkers();
            
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }
            
            userMarkerRef.current = L.marker([location.lat, location.lng], {
              icon: L.divIcon({
                html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                className: 'user-location-marker'
              })
            }).addTo(mapInstanceRef.current);
          }
          
          setLocationStatus({
            type: 'success',
            message: `Location found: ${result.display_name}`
          });
        } else {
          setLocationStatus({
            type: 'warning',
            message: 'Location not found. Please try a different address or hospital name.'
          });
        }
      }
    } catch (error) {
      console.error('Location search error:', error);
      setLocationStatus({
        type: 'error',
        message: 'Error searching for location. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search for nearby facilities
  const searchNearbyFacilities = async (location = userLocation) => {
    if (!location) {
      setLocationStatus({
        type: 'warning',
        message: 'Please find your location first.'
      });
      return;
    }

    setIsLoading(true);
    clearMarkers();
    
    // Add user location marker back
    if (userMarkerRef.current && mapInstanceRef.current) {
      userMarkerRef.current.addTo(mapInstanceRef.current);
    }

    try {
      const response = await fetch(`/api/nearby-facilities?lat=${location.lat}&lng=${location.lng}&radius=${radius}&type=${facilityType}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setLocationStatus({
          type: 'warning',
          message: 'Some facilities may not be available. Showing available results.'
        });
      }
      
      const facilitiesData = data.facilities || [];
      setFacilities(facilitiesData);
      
      // Add facility markers to map
      facilitiesData.forEach((facility: Facility, index: number) => {
        const lat = facility.geometry.location.lat;
        const lng = facility.geometry.location.lng;
        
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div style="background-color: #dc3545; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            className: 'facility-marker'
          })
        });
        
        if (mapInstanceRef.current) {
          marker.addTo(mapInstanceRef.current);
        }
        
        marker.bindPopup(`
          <div>
            <h6>${facility.name}</h6>
            <p><small>${facility.category}</small></p>
            <p><small>${facility.vicinity}</small></p>
            ${facility.contact?.phone ? `<p><small>📞 ${facility.contact.phone}</small></p>` : ''}
          </div>
        `);
        
        markersRef.current.push(marker);
      });
      
      // Fit map to show all markers
      if (facilitiesData.length > 0 && mapInstanceRef.current) {
        const group = L.featureGroup(markersRef.current);
        if (userMarkerRef.current) {
          group.addLayer(userMarkerRef.current);
        }
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
      
      setLocationStatus({
        type: 'success',
        message: `Found ${facilitiesData.length} facilities within ${radius}km`
      });
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setLocationStatus({
        type: 'error',
        message: 'Unable to load facilities. Please try again or check your connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      hospital: 'Hospital',
      clinic: 'Clinic',
      emergency: 'Emergency Center',
      pharmacy: 'Pharmacy',
      diagnostic: 'Diagnostic Center'
    };
    return categoryMap[category] || category;
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      hospital: 'bg-red-100 text-red-800',
      clinic: 'bg-blue-100 text-blue-800',
      emergency: 'bg-orange-100 text-orange-800',
      pharmacy: 'bg-green-100 text-green-800',
      diagnostic: 'bg-purple-100 text-purple-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  // Filter facilities based on search
  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(facilityFilter.toLowerCase()) ||
    facility.category.toLowerCase().includes(facilityFilter.toLowerCase()) ||
    facility.vicinity.toLowerCase().includes(facilityFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Find Location</label>
              <Button 
                onClick={findUserLocation}
                disabled={isLoading}
                className="w-full"
                data-testid="button-find-location"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 mr-2" />
                )}
                Find My Location
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Location</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter address or hospital name"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchManualLocation()}
                  data-testid="input-manual-location"
                />
                <Button 
                  onClick={searchManualLocation}
                  disabled={isLoading}
                  size="sm"
                  data-testid="button-search-location"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facility Type</label>
              <Select value={facilityType} onValueChange={setFacilityType}>
                <SelectTrigger data-testid="select-facility-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hospital">Hospitals</SelectItem>
                  <SelectItem value="clinic">Clinics</SelectItem>
                  <SelectItem value="emergency">Emergency Centers</SelectItem>
                  <SelectItem value="pharmacy">Pharmacies</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic Centers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Radius</label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger data-testid="select-radius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => searchNearbyFacilities()}
            disabled={!userLocation || isLoading}
            className="w-full"
            data-testid="button-search-facilities"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search Facilities
          </Button>

          {/* Status */}
          {locationStatus.type && (
            <Alert className={`mt-4 ${
              locationStatus.type === 'error' ? 'border-red-200 bg-red-50' :
              locationStatus.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              locationStatus.type === 'success' ? 'border-green-200 bg-green-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <AlertDescription>
                {locationStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef} 
            className="h-96 w-full rounded-lg border"
            data-testid="map-container"
          />
        </CardContent>
      </Card>

      {/* Facilities List */}
      {facilities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Found {facilities.length} Facilities</CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Filter facilities..."
                  value={facilityFilter}
                  onChange={(e) => setFacilityFilter(e.target.value)}
                  data-testid="input-filter-facilities"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredFacilities.map((facility, index) => (
                <div 
                  key={facility.place_id} 
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (mapInstanceRef.current && markersRef.current[index]) {
                      mapInstanceRef.current.setView([
                        facility.geometry.location.lat, 
                        facility.geometry.location.lng
                      ], 17);
                      markersRef.current[index].openPopup();
                    }
                  }}
                  data-testid={`card-facility-${facility.place_id}`}
                >
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                      {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{facility.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getCategoryColor(facility.category)}>
                        {getCategoryDisplayName(facility.category)}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        {facility.rating}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{facility.vicinity}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      {facility.distance && (
                        <span className="flex items-center text-primary">
                          <Navigation className="w-3 h-3 mr-1" />
                          {facility.distance} km
                        </span>
                      )}
                      {facility.opening_hours && (
                        <span className="flex items-center text-green-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {facility.opening_hours}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {facility.contact?.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${facility.contact?.phone}`;
                        }}
                        data-testid={`button-call-${facility.place_id}`}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.geometry.location.lat},${facility.geometry.location.lng}`;
                        window.open(url, '_blank');
                      }}
                      data-testid={`button-directions-${facility.place_id}`}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}