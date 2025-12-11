import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const requestLocation = () => {
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
    };

    useEffect(() => {
        requestLocation();
        // Update location every 30 seconds
        const interval = setInterval(requestLocation, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 max-w-4xl flex-1 flex flex-col">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-6">My Location</h1>

                {error && (
                    <Card className="mb-4 border-destructive bg-destructive/10">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="text-destructive w-6 h-6" />
                            <div>
                                <p className="font-medium text-destructive">{error}</p>
                                <Button variant="outline" size="sm" className="mt-2" onClick={requestLocation}>
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="flex-1 shadow-lg border-2 border-primary/20 overflow-hidden min-h-[500px]">
                    <CardContent className="p-0 h-full relative">
                        {loading && !position ? (
                            <div className="h-full min-h-[500px] flex items-center justify-center bg-muted">
                                <div className="text-center">
                                    <Navigation className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
                                    <p className="text-lg text-muted-foreground">Getting your location...</p>
                                </div>
                            </div>
                        ) : position ? (
                            <MapContainer center={position} zoom={15} scrollWheelZoom={true} className="h-full w-full min-h-[500px]">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position}>
                                    <Popup>
                                        <strong>You are here!</strong><br />
                                        Lat: {position[0].toFixed(6)}<br />
                                        Lng: {position[1].toFixed(6)}
                                    </Popup>
                                </Marker>
                                <MapRecenter position={position} />
                            </MapContainer>
                        ) : null}

                        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur p-4 rounded-lg shadow-lg z-[1000]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-primary w-6 h-6" />
                                    <div>
                                        <p className="font-bold text-foreground">Location Sharing is <span className="text-green-600">ON</span></p>
                                        {lastUpdated && (
                                            <p className="text-sm text-muted-foreground">
                                                Last updated: {lastUpdated.toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button onClick={requestLocation} variant="outline" size="sm" disabled={loading}>
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default LocationPage;
