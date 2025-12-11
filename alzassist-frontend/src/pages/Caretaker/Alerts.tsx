import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Check, X, Bell, BellOff } from 'lucide-react';

interface Alert {
    id: string;
    patientId: string;
    patientName: string;
    type: 'GEOFENCE_EXIT' | 'LOW_BATTERY' | 'SOS' | 'MISSED_MEDICATION';
    message: string;
    time: Date;
    resolved: boolean;
}

const AlertsPage = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

    useEffect(() => {
        const stored = localStorage.getItem('caretaker-alerts');
        if (stored) {
            setAlerts(JSON.parse(stored));
        } else {
            // Default alerts
            const defaultAlerts: Alert[] = [
                { id: '1', patientId: '2', patientName: 'Maria Garcia', type: 'GEOFENCE_EXIT', message: 'Left the Safe Zone (Park)', time: new Date(Date.now() - 120000), resolved: false },
                { id: '2', patientId: '2', patientName: 'Maria Garcia', type: 'LOW_BATTERY', message: 'Tracker battery is at 15%', time: new Date(Date.now() - 600000), resolved: false },
                { id: '3', patientId: '1', patientName: 'James Doe', type: 'MISSED_MEDICATION', message: 'Missed afternoon medication', time: new Date(Date.now() - 3600000), resolved: true },
                { id: '4', patientId: '3', patientName: 'Robert Smith', type: 'SOS', message: 'SOS button pressed', time: new Date(Date.now() - 86400000), resolved: true },
            ];
            localStorage.setItem('caretaker-alerts', JSON.stringify(defaultAlerts));
            setAlerts(defaultAlerts);
        }
    }, []);

    const handleResolve = (alertId: string) => {
        const updated = alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a);
        setAlerts(updated);
        localStorage.setItem('caretaker-alerts', JSON.stringify(updated));
    };

    const handleUnresolve = (alertId: string) => {
        const updated = alerts.map(a => a.id === alertId ? { ...a, resolved: false } : a);
        setAlerts(updated);
        localStorage.setItem('caretaker-alerts', JSON.stringify(updated));
    };

    const handleDelete = (alertId: string) => {
        const updated = alerts.filter(a => a.id !== alertId);
        setAlerts(updated);
        localStorage.setItem('caretaker-alerts', JSON.stringify(updated));
    };

    const formatTime = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const getAlertStyle = (type: Alert['type'], resolved: boolean) => {
        if (resolved) return 'bg-muted border-muted-foreground/20 opacity-60';
        switch (type) {
            case 'GEOFENCE_EXIT': return 'bg-red-50 border-red-300';
            case 'SOS': return 'bg-red-100 border-red-400';
            case 'LOW_BATTERY': return 'bg-yellow-50 border-yellow-300';
            case 'MISSED_MEDICATION': return 'bg-amber-50 border-amber-300';
            default: return 'bg-muted border-muted';
        }
    };

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'GEOFENCE_EXIT': return '📍';
            case 'SOS': return '🆘';
            case 'LOW_BATTERY': return '🔋';
            case 'MISSED_MEDICATION': return '💊';
            default: return '⚠️';
        }
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'active') return !a.resolved;
        if (filter === 'resolved') return a.resolved;
        return true;
    }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const activeCount = alerts.filter(a => !a.resolved).length;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-6 max-w-4xl">
                <Link to="/caretaker/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
                            <p className="text-muted-foreground">{activeCount} active alert(s)</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All ({alerts.length})
                        </Button>
                        <Button
                            variant={filter === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('active')}
                            className={filter === 'active' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            <Bell className="w-4 h-4 mr-1" /> Active ({activeCount})
                        </Button>
                        <Button
                            variant={filter === 'resolved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('resolved')}
                        >
                            <BellOff className="w-4 h-4 mr-1" /> Resolved ({alerts.length - activeCount})
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredAlerts.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">
                                    {filter === 'active' ? 'No active alerts! 🎉' : 'No alerts found.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredAlerts.map((alert) => (
                            <Card key={alert.id} className={`border-2 ${getAlertStyle(alert.type, alert.resolved)}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <span className="text-3xl">{getAlertIcon(alert.type)}</span>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg text-foreground">
                                                        {alert.type.replace(/_/g, ' ')}
                                                    </h3>
                                                    {alert.resolved && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground">
                                                    <strong>{alert.patientName}</strong>: {alert.message}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {formatTime(alert.time)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!alert.resolved ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleResolve(alert.id)}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Resolve
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleUnresolve(alert.id)}
                                                >
                                                    Unresolve
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(alert.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default AlertsPage;
