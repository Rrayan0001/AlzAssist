import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Users, AlertTriangle, Map, Activity, Eye, MapPin, Bell, Check, Trash2, Link2, Mail, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export interface Patient {
    id: string;
    name: string;
    email: string;
    age?: number;
    status: 'Safe' | 'Alert' | 'Offline';
    lastLocation?: string;
    battery?: number;
    lat?: number;
    lng?: number;
    phone?: string;
    linkedAt?: string;
    location?: {
        lat: number;
        lng: number;
        status: string;
        battery: number;
        updated_at: string;
    } | null;
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

// Export for use in other pages - now fetches from backend
export const usePatientsStore = () => {
    const { user } = useAuthStore();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPatients = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const result = await api.get(`/api/patient-links/patients/${user.id}`);
            if (result.success && result.data?.patients) {
                // Transform backend data to Patient format
                const transformedPatients: Patient[] = result.data.patients.map((p: { id: string; name: string; email: string; location?: { lat: number; lng: number; status: string; battery: number; updated_at: string } | null; linkedAt?: string }) => ({
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    status: p.location ? 'Safe' : 'Offline',
                    lat: p.location?.lat,
                    lng: p.location?.lng,
                    battery: 0,
                    lastLocation: p.location ? `Last updated ${new Date(p.location.updated_at).toLocaleTimeString()}` : 'No location',
                    linkedAt: p.linkedAt
                }));
                setPatients(transformedPatients);
            }
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPatients();
    }, [user]);

    return { patients, setPatients, isLoading, refetch: fetchPatients };
};

export const useAlertsStore = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    return { alerts, setAlerts };
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
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { patients, setPatients, refetch } = usePatientsStore();
    const { alerts, setAlerts } = useAlertsStore();

    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkEmail, setLinkEmail] = useState('');
    const [linkSuccess, setLinkSuccess] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [, setIsLinking] = useState(false);

    const activeAlerts = alerts.filter(a => !a.resolved);
    const safePatients = patients.filter(p => p.status === 'Safe').length;

    // Reset link dialog state when closed
    useEffect(() => {
        if (!linkDialogOpen) {
            setTimeout(() => {
                setLinkEmail('');
                setLinkSuccess(false);
                setLinkError('');
            }, 300);
        }
    }, [linkDialogOpen]);

    const handleLinkPatient = async () => {
        setLinkError('');
        setIsLinking(true);

        // Validate email
        if (!linkEmail.trim() || !linkEmail.includes('@')) {
            setLinkError('Please enter a valid email address');
            setIsLinking(false);
            return;
        }

        try {
            const result = await api.post('/api/patient-links/link', {
                caretakerId: user?.id,
                patientEmail: linkEmail
            });

            if (!result.success) {
                setLinkError(result.error || 'Failed to link patient');
                setIsLinking(false);
                return;
            }

            // Refresh the patients list
            await refetch();
            setLinkSuccess(true);
        } catch (error) {
            console.error('Link patient error:', error);
            setLinkError('Failed to connect. Please try again.');
        }
        setIsLinking(false);
    };

    const handleResolveAlert = (alertId: string) => {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    };

    const handleDeletePatient = async (patientId: string) => {
        try {
            await api.delete(`/api/patient-links/unlink/${user?.id}/${patientId}`);
            setPatients(patients.filter(p => p.id !== patientId));
            setAlerts(alerts.filter(a => a.patientId !== patientId));
        } catch (error) {
            console.error('Failed to unlink patient:', error);
        }
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

                    {/* Link Patient Dialog */}
                    <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-violet-600 hover:bg-violet-700">
                                <Link2 className="mr-2 w-4 h-4" /> Link New Patient
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-violet-600" />
                                    Link Patient Account
                                </DialogTitle>
                                <DialogDescription>
                                    Enter the email address of the patient you want to monitor. They must have an AlzAssist patient account.
                                </DialogDescription>
                            </DialogHeader>

                            {linkSuccess ? (
                                <div className="py-8 text-center">
                                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Patient Linked!</h3>
                                    <p className="text-muted-foreground mb-4">
                                        You can now monitor <strong>{linkEmail}</strong>
                                    </p>
                                    <Button onClick={() => setLinkDialogOpen(false)} className="bg-violet-600 hover:bg-violet-700">
                                        Done
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 py-4">
                                        <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                                            <div className="flex gap-3">
                                                <Mail className="w-5 h-5 text-violet-600 mt-0.5" />
                                                <div className="flex-1 space-y-2">
                                                    <Label htmlFor="patient-email" className="text-violet-800 font-medium">
                                                        Patient's Email Address
                                                    </Label>
                                                    <Input
                                                        id="patient-email"
                                                        type="email"
                                                        placeholder="patient@example.com"
                                                        value={linkEmail}
                                                        onChange={(e) => {
                                                            setLinkEmail(e.target.value);
                                                            setLinkError('');
                                                        }}
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {linkError && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                {linkError}
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>ℹ️ The patient will appear in your dashboard once linked.</p>
                                            <p>📍 You'll be able to track their location, medications, and activities.</p>
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={handleLinkPatient}
                                            disabled={!linkEmail.trim()}
                                            className="bg-violet-600 hover:bg-violet-700"
                                        >
                                            <Link2 className="w-4 h-4 mr-2" />
                                            Link Patient
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
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
                            <CardTitle className="text-foreground">Linked Patients</CardTitle>
                            <Link to="/caretaker/locations">
                                <Button variant="outline" size="sm">
                                    <MapPin className="w-4 h-4 mr-2" /> View All Locations
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {patients.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground mb-4">No patients linked yet.</p>
                                    <Button
                                        onClick={() => setLinkDialogOpen(true)}
                                        className="bg-violet-600 hover:bg-violet-700"
                                    >
                                        <Link2 className="w-4 h-4 mr-2" /> Link Your First Patient
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.map((p) => (
                                            <TableRow key={p.id} className="group">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{p.name}</p>
                                                        <p className="text-xs text-muted-foreground">{p.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Safe' ? 'bg-green-100 text-green-800' :
                                                        p.status === 'Alert' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{p.lastLocation}</TableCell>
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
