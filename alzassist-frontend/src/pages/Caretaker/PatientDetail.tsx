import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone, Activity, Calendar, Pill, Clock, Mail, CheckCircle2, User } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { usePatientsStore, type Patient } from './Dashboard';
import { api } from '@/lib/api';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface JournalEntry {
    id: string;
    created_at: string;
    content: string;
    mood: 'Happy' | 'Neutral' | 'Sad';
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
}

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

const PatientDetail = () => {
    const { id } = useParams();
    const { patients } = usePatientsStore();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const found = patients.find((p) => p.id === id);
        setPatient(found || null);
    }, [id, patients]);

    // Fetch patient detailed data
    useEffect(() => {
        const fetchPatientData = async () => {
            if (!id) return;
            setIsLoadingData(true);
            try {
                // Fetch Location
                const locationRes = await api.get(`/api/patient/location/${id}`);
                if (locationRes.success && locationRes.data) {
                    setPatient(prev => prev ? {
                        ...prev,
                        lat: locationRes.data.lat,
                        lng: locationRes.data.lng,
                        lastLocation: `Last updated: ${new Date(locationRes.data.updated_at || new Date()).toLocaleTimeString()}`
                    } : null);
                }

                // Fetch Journals
                const journalsRes = await api.get(`/api/patient/journals/${id}`);
                if (journalsRes.success) setJournals(journalsRes.data);

                // Fetch Medications
                const resMeds = await api.get(`/api/patient/medications/${id}`);
                if (resMeds.success) setMedications(resMeds.data);

                // Fetch Tasks
                const resTasks = await api.get(`/api/patient/tasks/${id}`);
                if (resTasks.success) setTasks(resTasks.data);

            } catch (error) {
                console.error('Failed to fetch patient details:', error);
            }
            setIsLoadingData(false);
        };

        if (id) {
            fetchPatientData();
        }
    }, [id]);

    if (!patient) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto p-6">
                    <Link to="/caretaker/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg">Patient not found or loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    const position: [number, number] = [patient.lat || 40.7128, patient.lng || -74.0060];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-6">
                <Link to="/caretaker/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                {/* Patient Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-card p-6 rounded-lg shadow-sm border">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-1">{patient.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4" /> {patient.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${patient.status === 'Safe' ? 'bg-green-100 text-green-800' :
                            patient.status === 'Alert' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {patient.status}
                        </span>

                        <Button onClick={() => window.location.href = `tel:${patient.phone}`} className="bg-violet-600 hover:bg-violet-700">
                            <Phone className="w-4 h-4 mr-2" /> Call Patient
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Location Map */}
                    <Card className="lg:row-span-2 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="text-violet-600" /> Current Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[400px] relative">
                            {patient.lat && patient.lng ? (
                                <MapContainer center={position} zoom={14} scrollWheelZoom={true} className="h-full w-full z-0">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={position}>
                                        <Popup>
                                            <strong>{patient.name}</strong><br />
                                            {patient.lastLocation}
                                        </Popup>
                                    </Marker>
                                    {/* Geofence circle */}
                                    <Circle center={position} radius={500} pathOptions={{ color: 'violet', fillColor: 'violet', fillOpacity: 0.1 }} />
                                </MapContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-muted/30">
                                    <MapPin className="w-12 h-12 text-muted-foreground mb-2 opacity-50" />
                                    <p className="text-muted-foreground">Location data pending...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Medications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="text-emerald-600" /> Today's Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {medications.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No medications listed.</p>
                            ) : (
                                medications.map((med) => (
                                    <div key={med.id} className={`flex items-center justify-between p-3 rounded-lg border ${med.taken ? 'bg-emerald-50 border-emerald-200' : 'bg-card border-border'}`}>
                                        <div>
                                            <p className="font-medium text-foreground">{med.name} <span className="text-xs text-muted-foreground">({med.dosage})</span></p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" /> {med.time}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${med.taken ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {med.taken ? <CheckCircle2 className="w-3 h-3" /> : null}
                                            {med.taken ? 'Taken' : 'Pending'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="text-sky-600" /> Daily Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No tasks listed.</p>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {tasks.map((task) => (
                                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded border transition-colors ${task.completed ? 'bg-sky-50 border-sky-200' : 'bg-card'}`}>
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-sky-600 border-sky-600 text-white' : 'border-muted-foreground'}`}>
                                                {task.completed && '✓'}
                                            </span>
                                            <span className={task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                                {task.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tasks.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Progress: {tasks.filter(t => t.completed).length} / {tasks.length} completed
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Journal */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="text-amber-600" /> Recent Journal Entries
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {journals.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No journal entries yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {journals.slice(0, 4).map((entry) => (
                                        <div key={entry.id} className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg hover:border-amber-200 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-medium text-amber-800">
                                                    {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-xl" title={entry.mood}>
                                                    {entry.mood === 'Happy' ? '😊/Happy' : entry.mood === 'Sad' ? '😢/Sad' : '😐/Neutral'}
                                                </span>
                                            </div>
                                            <p className="text-foreground/80 line-clamp-3 italic">"{entry.content}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default PatientDetail;
