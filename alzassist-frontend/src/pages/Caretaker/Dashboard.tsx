import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Users, AlertTriangle, Map, Activity, Plus, Eye, MapPin, Bell, Check, Trash2 } from 'lucide-react';

export interface Patient {
    id: string;
    name: string;
    age: number;
    status: 'Safe' | 'Alert' | 'Offline';
    lastLocation: string;
    battery: number;
    lat: number;
    lng: number;
    phone: string;
}

export interface Alert {
    id: string;
    patientId: string;
    patientName: string;
    type: 'GEOFENCE_EXIT' | 'LOW_BATTERY' | 'SOS' | 'MISSED_MEDICATION';
    message: string;
    time: Date;
    resolved: boolean;
}

// Shared state - in a real app this would be in a global store or API
const initialPatients: Patient[] = [
    { id: '1', name: 'James Doe', age: 78, status: 'Safe', lastLocation: 'Home', battery: 85, lat: 40.7128, lng: -74.0060, phone: '+1555-0101' },
    { id: '2', name: 'Maria Garcia', age: 82, status: 'Alert', lastLocation: 'Park (Geofence Exit)', battery: 40, lat: 40.7580, lng: -73.9855, phone: '+1555-0102' },
    { id: '3', name: 'Robert Smith', age: 75, status: 'Safe', lastLocation: 'Home', battery: 92, lat: 40.7489, lng: -73.9680, phone: '+1555-0103' },
];

const initialAlerts: Alert[] = [
    { id: '1', patientId: '2', patientName: 'Maria Garcia', type: 'GEOFENCE_EXIT', message: 'Left the Safe Zone (Park)', time: new Date(Date.now() - 120000), resolved: false },
    { id: '2', patientId: '2', patientName: 'Maria Garcia', type: 'LOW_BATTERY', message: 'Tracker battery is at 15%', time: new Date(Date.now() - 600000), resolved: false },
    { id: '3', patientId: '1', patientName: 'James Doe', type: 'MISSED_MEDICATION', message: 'Missed afternoon medication', time: new Date(Date.now() - 3600000), resolved: true },
];

// Export for use in other pages
export const usePatientsStore = () => {
    const [patients, setPatients] = useState<Patient[]>(() => {
        const stored = localStorage.getItem('caretaker-patients');
        return stored ? JSON.parse(stored) : initialPatients;
    });

    const savePatients = (newPatients: Patient[]) => {
        localStorage.setItem('caretaker-patients', JSON.stringify(newPatients));
        setPatients(newPatients);
    };

    return { patients, setPatients: savePatients };
};

export const useAlertsStore = () => {
    const [alerts, setAlerts] = useState<Alert[]>(() => {
        const stored = localStorage.getItem('caretaker-alerts');
        return stored ? JSON.parse(stored) : initialAlerts;
    });

    const saveAlerts = (newAlerts: Alert[]) => {
        localStorage.setItem('caretaker-alerts', JSON.stringify(newAlerts));
        setAlerts(newAlerts);
    };

    return { alerts, setAlerts: saveAlerts };
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: React.ElementType, color: string }) => (
    <Card className="bg-card">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            </div>
            <div className={`p-3 rounded-full bg-primary/10`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </CardContent>
    </Card>
);

const CaretakerDashboard = () => {
    const navigate = useNavigate();
    const { patients, setPatients } = usePatientsStore();
    const { alerts, setAlerts } = useAlertsStore();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', phone: '' });

    const activeAlerts = alerts.filter(a => !a.resolved);
    const safePatients = patients.filter(p => p.status === 'Safe').length;

    const handleAddPatient = () => {
        if (!newPatient.name || !newPatient.age) return;
        const patient: Patient = {
            id: Date.now().toString(),
            name: newPatient.name,
            age: parseInt(newPatient.age),
            status: 'Safe',
            lastLocation: 'Home',
            battery: 100,
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            phone: newPatient.phone || 'N/A'
        };
        setPatients([...patients, patient]);
        setNewPatient({ name: '', age: '', phone: '' });
        setDialogOpen(false);
    };

    const handleResolveAlert = (alertId: string) => {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    };

    const handleDeletePatient = (patientId: string) => {
        setPatients(patients.filter(p => p.id !== patientId));
        setAlerts(alerts.filter(a => a.patientId !== patientId));
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
        if (diff < 60) return `${diff} mins ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
        return `${Math.floor(diff / 1440)} days ago`;
    };

    const getAlertColor = (type: Alert['type']) => {
        switch (type) {
            case 'GEOFENCE_EXIT': return 'bg-red-50 border-red-200 text-red-800';
            case 'SOS': return 'bg-red-100 border-red-300 text-red-900';
            case 'LOW_BATTERY': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'MISSED_MEDICATION': return 'bg-amber-50 border-amber-200 text-amber-800';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Caretaker Portal</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 w-4 h-4" /> Add Patient
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Patient</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Patient Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Full name"
                                        value={newPatient.name}
                                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        placeholder="e.g. 75"
                                        value={newPatient.age}
                                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+1 555-0100"
                                        value={newPatient.phone}
                                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddPatient} disabled={!newPatient.name || !newPatient.age}>
                                    Add Patient
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Patients" value={patients.length.toString()} icon={Users} color="text-blue-600" />
                    <StatCard title="Active Alerts" value={activeAlerts.length.toString()} icon={AlertTriangle} color="text-red-600" />
                    <StatCard title="Safe Patients" value={`${safePatients}/${patients.length}`} icon={Activity} color="text-green-600" />
                    <StatCard title="Devices Online" value={`${patients.length}/${patients.length}`} icon={Map} color="text-purple-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Patient List */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-foreground">Patient Overview</CardTitle>
                            <Link to="/caretaker/locations">
                                <Button variant="outline" size="sm">
                                    <MapPin className="w-4 h-4 mr-2" /> View All Locations
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {patients.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No patients yet. Add one to get started.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Battery</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.map((p) => (
                                            <TableRow key={p.id} className="group">
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Safe' ? 'bg-green-100 text-green-800' :
                                                        p.status === 'Alert' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{p.lastLocation}</TableCell>
                                                <TableCell>
                                                    <span className={p.battery < 20 ? 'text-red-600 font-bold' : ''}>
                                                        {p.battery}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => navigate(`/caretaker/patient/${p.id}`)}>
                                                        <Eye className="w-4 h-4 mr-1" /> View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeletePatient(p.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Alerts */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Recent Alerts
                            </CardTitle>
                            <Link to="/caretaker/alerts">
                                <Button variant="link" size="sm" className="text-primary">
                                    <Bell className="w-4 h-4 mr-1" /> View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {activeAlerts.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No active alerts 🎉</p>
                            ) : (
                                activeAlerts.slice(0, 3).map((alert) => (
                                    <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{alert.type.replace('_', ' ')}</p>
                                                <p className="text-sm">{alert.patientName}: {alert.message}</p>
                                                <p className="text-xs mt-1 opacity-70">{formatTime(alert.time)}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleResolveAlert(alert.id)}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CaretakerDashboard;
