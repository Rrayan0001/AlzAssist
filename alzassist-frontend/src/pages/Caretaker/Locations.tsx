import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Battery, Phone, Eye, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { usePatientsStore, type Patient } from './Dashboard';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationsPage = () => {
    const { patients } = usePatientsStore();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    useEffect(() => {
        if (patients.length > 0 && !selectedPatient) {
            setSelectedPatient(patients[0]);
        }
    }, [patients, selectedPatient]);

    const center: [number, number] = patients.length > 0
        ? [patients.reduce((sum, p) => sum + (p.lat || 0), 0) / patients.length,
        patients.reduce((sum, p) => sum + (p.lng || 0), 0) / patients.length]
        : [40.7128, -74.0060];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-6">
                <Link to="/caretaker/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-8 h-8 text-violet-600" />
                    <h1 className="text-3xl font-bold text-foreground">Patient Locations</h1>
                </div>

                {patients.length === 0 ? (
                    <Card className="p-8 text-center">
                        <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">No patients linked yet.</p>
                        <Link to="/caretaker/dashboard">
                            <Button className="bg-violet-600 hover:bg-violet-700">
                                Go to Dashboard to Link Patients
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Patient List */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Linked Patients</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 p-3">
                                    {patients.map((patient) => (
                                        <div
                                            key={patient.id}
                                            onClick={() => setSelectedPatient(patient)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPatient?.id === patient.id
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-muted hover:bg-muted/80'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{patient.name}</p>
                                                    <p className={`text-sm flex items-center gap-1 ${selectedPatient?.id === patient.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                        <Mail className="w-3 h-3" />
                                                        {patient.email}
                                                    </p>
                                                    <p className={`text-xs ${selectedPatient?.id === patient.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                        {patient.lastLocation}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`w-3 h-3 rounded-full ${patient.status === 'Safe' ? 'bg-green-500' :
                                                        patient.status === 'Alert' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`} />
                                                    <span className={`text-xs flex items-center gap-1 ${(patient.battery || 0) < 20 ? 'text-red-500' :
                                                        selectedPatient?.id === patient.id ? 'text-white/70' : 'text-muted-foreground'
                                                        }`}>
                                                        <Battery className="w-3 h-3" /> {(patient.battery || 0) > 0 ? `${patient.battery}%` : '--'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Map */}
                            <Card className="lg:col-span-3 overflow-hidden">
                                <CardContent className="p-0 h-[600px]">
                                    <MapContainer center={center} zoom={12} scrollWheelZoom={true} className="h-full w-full">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {patients.filter(p => p.lat && p.lng).map((patient) => (
                                            <Marker
                                                key={patient.id}
                                                position={[patient.lat || 0, patient.lng || 0]}
                                                eventHandlers={{
                                                    click: () => setSelectedPatient(patient)
                                                }}
                                            >
                                                <Popup>
                                                    <div className="text-center">
                                                        <strong className="text-lg">{patient.name}</strong><br />
                                                        <span className="text-xs text-gray-500">{patient.email}</span><br />
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${patient.status === 'Safe' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {patient.status}
                                                        </span>
                                                        <p className="text-sm mt-2">{patient.lastLocation}</p>
                                                        <p className="text-sm">🔋 {(patient.battery || 0) > 0 ? `${patient.battery}%` : 'N/A'}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Button size="sm" variant="outline" onClick={() => window.location.href = `tel:${patient.phone}`}>
                                                                <Phone className="w-3 h-3 mr-1" /> Call
                                                            </Button>
                                                            <Link to={`/caretaker/patient/${patient.id}`}>
                                                                <Button size="sm">
                                                                    <Eye className="w-3 h-3 mr-1" /> View
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                        {/* Geofence circles */}
                                        {patients.filter(p => p.lat && p.lng).map((patient) => (
                                            <Circle
                                                key={`circle-${patient.id}`}
                                                center={[patient.lat || 0, patient.lng || 0]}
                                                radius={500}
                                                pathOptions={{
                                                    color: patient.status === 'Safe' ? 'green' : 'red',
                                                    fillColor: patient.status === 'Safe' ? 'green' : 'red',
                                                    fillOpacity: 0.1
                                                }}
                                            />
                                        ))}
                                    </MapContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Selected Patient Details */}
                        {selectedPatient && (
                            <Card className="mt-6">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">{selectedPatient.name}</h2>
                                            <p className="text-muted-foreground">
                                                {selectedPatient.email} • Location: {selectedPatient.lastLocation}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => window.location.href = `tel:${selectedPatient.phone}`}>
                                                <Phone className="w-4 h-4 mr-2" /> Call Patient
                                            </Button>
                                            <Link to={`/caretaker/patient/${selectedPatient.id}`}>
                                                <Button className="bg-violet-600 hover:bg-violet-700">
                                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default LocationsPage;
