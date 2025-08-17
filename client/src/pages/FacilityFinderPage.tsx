import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Star, Navigation, Clock, Search } from "lucide-react";
import InteractiveMap from "@/components/InteractiveMap";

interface MedicalFacility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  available24h: boolean;
  coordinates: { lat: number; lng: number };
}

export default function FacilityFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [facilityType, setFacilityType] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Mock location for demo - in real app would use geolocation API
  const mockLocation = { lat: 28.6139, lng: 77.2090 };

  const { data: facilities = [], isLoading, refetch } = useQuery<MedicalFacility[]>({
    queryKey: ["/api/facilities", mockLocation.lat, mockLocation.lng, facilityType],
    enabled: true
  });

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to mock location
          setUserLocation(mockLocation);
        }
      );
    } else {
      setUserLocation(mockLocation);
    }
  };

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'bg-red-100 text-red-800';
      case 'clinic':
        return 'bg-blue-100 text-blue-800';
      case 'emergency':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirections = (facility: MedicalFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const callFacility = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Medical Facility Finder
          </h1>
          <p className="text-muted-foreground">
            Find nearby hospitals, clinics, and emergency services
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8" data-testid="card-search-filters">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search facilities, location, or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-facilities"
                  />
                </div>
              </div>
              
              <Select value={facilityType} onValueChange={setFacilityType}>
                <SelectTrigger data-testid="select-facility-type">
                  <SelectValue placeholder="Facility Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hospital">Hospitals</SelectItem>
                  <SelectItem value="clinic">Clinics</SelectItem>
                  <SelectItem value="emergency">Emergency Centers</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={requestLocation}
                variant="outline"
                className="w-full"
                data-testid="button-get-location"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use My Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Banner */}
        <Card className="mb-8 border-red-200 bg-red-50" data-testid="card-emergency-banner">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Emergency Services</h3>
                  <p className="text-red-700 text-sm">For immediate medical assistance</p>
                </div>
              </div>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.location.href = 'tel:108'}
                data-testid="button-call-108"
              >
                Call 108
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <div className="mt-8">
          <InteractiveMap />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Button 
            variant="outline" 
            className="p-6 h-auto flex flex-col space-y-2"
            onClick={() => setFacilityType("emergency")}
            data-testid="button-find-emergency"
          >
            <Phone className="w-8 h-8 text-red-600" />
            <div className="text-center">
              <p className="font-semibold">Emergency Centers</p>
              <p className="text-sm text-muted-foreground">Find nearest emergency services</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="p-6 h-auto flex flex-col space-y-2"
            onClick={() => setFacilityType("hospital")}
            data-testid="button-find-hospitals"
          >
            <MapPin className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <p className="font-semibold">Hospitals</p>
              <p className="text-sm text-muted-foreground">Major medical facilities</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="p-6 h-auto flex flex-col space-y-2"
            onClick={() => setFacilityType("clinic")}
            data-testid="button-find-clinics"
          >
            <Clock className="w-8 h-8 text-green-600" />
            <div className="text-center">
              <p className="font-semibold">Clinics</p>
              <p className="text-sm text-muted-foreground">Outpatient care centers</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
