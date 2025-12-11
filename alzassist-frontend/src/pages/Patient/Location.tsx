import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Navigation, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when position changes
const MapRecenter = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 15);
    }, [position, map]);
    return null;
};

const LocationPage = () => {
    const { user } = useAuthStore();
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

    // Send location to backend
    const syncLocationToBackend = useCallback(async (lat: number, lng: number) => {
        if (!user?.id) return;

        setSyncStatus('syncing');
        try {
            await api.post('/api/patient/location', {
                userId: user.id,
                lat,
                lng,
                status: 'Safe',
                battery: 100 // Could get real battery if available
            });
            setSyncStatus('synced');
        } catch (err) {
            console.error('Failed to sync location:', err);
            setSyncStatus('error');
        }
    }, [user]);

    const requestLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                setLastUpdated(new Date());
                setLoading(false);
                // Sync to backend
                syncLocationToBackend(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                setError(`Unable to get location: ${err.message}`);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, [syncLocationToBackend]);

    useEffect(() => {
        requestLocation();
        // Update location every 30 seconds
        const interval = setInterval(requestLocation, 30000);
        return () => clearInterval(interval);
    }, [requestLocation]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 max-w-4xl flex-1 flex flex-col">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <Card className="mb-4">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-primary" />
                                <div>
                                    <h1 className="text-xl font-bold">My Location</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Your location is being shared with your caretaker
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {syncStatus === 'syncing' && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Syncing...
                                    </span>
                                )}
                                {syncStatus === 'synced' && (
                                    <span className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Shared
                                    </span>
                                )}
                                <Button onClick={requestLocation} variant="outline" size="sm">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="mb-4 border-destructive">
                        <CardContent className="py-4 flex items-center gap-3 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </CardContent>
                    </Card>
                )}

                <Card className="flex-1">
                    <CardContent className="p-0 h-[500px]">
                        {loading && !position ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="ml-2">Getting your location...</span>
                            </div>
                        ) : position ? (
                            <MapContainer
                                center={position}
                                zoom={15}
                                className="h-full w-full rounded-lg"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position}>
                                    <Popup>
                                        <strong>You are here</strong>
                                        <br />
                                        {lastUpdated && (
                                            <span className="text-xs text-muted-foreground">
                                                Updated: {lastUpdated.toLocaleTimeString()}
                                            </span>
                                        )}
                                    </Popup>
                                </Marker>
                                <MapRecenter position={position} />
                            </MapContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Unable to load map
                            </div>
                        )}
                    </CardContent>
                </Card>

                {lastUpdated && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Location updates every 30 seconds • Last update: {lastUpdated.toLocaleTimeString()}
                    </p>
                )}
            </main>
        </div>
    );
};

export default LocationPage;
