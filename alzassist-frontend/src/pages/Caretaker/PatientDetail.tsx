import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone, Activity, Calendar, Pill, Battery, Clock, Mail } from 'lucide-react';
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

interface JournalEntry {
    id: string;
    date: Date;
    content: string;
    mood: 'Happy' | 'Neutral' | 'Sad';
}

interface Medication {
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
}

const PatientDetail = () => {
    const { id } = useParams();
    const { patients } = usePatientsStore();
    const [patient, setPatient] = useState<Patient | null>(null);

    // Mock data for patient details - in real app would fetch from patient's data
    const journalEntries: JournalEntry[] = [
        { id: '1', date: new Date(Date.now() - 86400000), content: 'Had a wonderful day at the park.', mood: 'Happy' },
        { id: '2', date: new Date(Date.now() - 172800000), content: 'Felt a bit tired today.', mood: 'Neutral' },
    ];

    const medications: Medication[] = [
        { name: 'Donepezil', dosage: '10mg', time: '9:00 AM', taken: true },
        { name: 'Memantine', dosage: '5mg', time: '2:00 PM', taken: false },
        { name: 'Vitamin D', dosage: '1000 IU', time: '8:00 PM', taken: false },
    ];

    const tasks = [
        { text: 'Brush teeth', completed: true },
        { text: 'Take morning medicine', completed: true },
        { text: 'Call daughter', completed: false },
        { text: 'Read a book', completed: false },
    ];

    useEffect(() => {
        const found = patients.find((p) => p.id === id);
        setPatient(found || null);
    }, [id, patients]);

    if (!patient) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto p-6">
                    <Link to="/caretaker/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                        <ArrowLeft className="mr-2" /> Back to Dashboard
                    </Link>
                    <p className="text-muted-foreground text-center py-8">Patient not found.</p>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {patient.email}
                        </p>
                        <p className="text-muted-foreground">
                            Age: {patient.age > 0 ? patient.age : 'Not set'} • Phone: {patient.phone || 'Not set'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${patient.status === 'Safe' ? 'bg-green-100 text-green-800' :
                            patient.status === 'Alert' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {patient.status}
                        </span>
                        <div className={`flex items-center gap-1 ${patient.battery < 20 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            <Battery className="w-5 h-5" />
                            <span className="font-medium">{patient.battery > 0 ? `${patient.battery}%` : '--'}</span>
                        </div>
                        <Button onClick={() => window.location.href = `tel:${patient.phone}`} className="bg-violet-600 hover:bg-violet-700">
                            <Phone className="w-4 h-4 mr-2" /> Call
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Location Map */}
                    <Card className="lg:row-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="text-violet-600" /> Current Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[400px]">
                            {patient.lat && patient.lng ? (
                                <MapContainer center={position} zoom={14} scrollWheelZoom={true} className="h-full w-full rounded-b-lg">
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
                                <div className="h-full flex items-center justify-center bg-muted rounded-b-lg">
                                    <p className="text-muted-foreground">Location pending...</p>
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
                        <CardContent className="space-y-3">
                            {medications.map((med, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${med.taken ? 'bg-emerald-50 border border-emerald-200' : 'bg-muted'}`}>
                                    <div>
                                        <p className="font-medium text-foreground">{med.name} ({med.dosage})</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {med.time}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${med.taken ? 'bg-emerald-600 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                                        {med.taken ? '✓ Taken' : 'Pending'}
                                    </span>
                                </div>
                            ))}
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
                            <div className="space-y-2">
                                {tasks.map((task, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 p-2 rounded ${task.completed ? 'bg-sky-50' : ''}`}>
                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-sky-600 border-sky-600 text-white' : 'border-muted-foreground'}`}>
                                            {task.completed && '✓'}
                                        </span>
                                        <span className={task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                            {task.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Completed: {tasks.filter(t => t.completed).length}/{tasks.length}
                                </p>
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {journalEntries.map((entry) => (
                                    <div key={entry.id} className="p-4 bg-muted rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-xl">
                                                {entry.mood === 'Happy' ? '😊' : entry.mood === 'Sad' ? '😢' : '😐'}
                                            </span>
                                        </div>
                                        <p className="text-foreground">{entry.content}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default PatientDetail;
