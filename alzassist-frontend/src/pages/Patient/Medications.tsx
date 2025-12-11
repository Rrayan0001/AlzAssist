import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Check, ArrowLeft, Clock, Info, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
    instructions?: string;
}

const Medications = () => {
    const { user } = useAuthStore();
    const [meds, setMeds] = useState<Medicine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '', instructions: '' });

    // Load medications from backend
    useEffect(() => {
        const loadMeds = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const result = await api.get(`/api/patient/medications/${user.id}`);
                if (result.success && Array.isArray(result.data)) {
                    setMeds(result.data);
                }
            } catch (error) {
                console.error('Failed to load medications:', error);
            }
            setIsLoading(false);
        };
        loadMeds();
    }, [user]);

    const toggleTaken = async (id: string) => {
        const med = meds.find(m => m.id === id);
        if (!med) return;

        try {
            await api.put(`/api/patient/medications/${id}`, { taken: !med.taken });
            setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
        } catch (error) {
            console.error('Failed to update medication:', error);
        }
    };

    const handleAddMed = async () => {
        if (!newMed.name || !newMed.dosage || !newMed.time || !user?.id) return;

        try {
            const result = await api.post('/api/patient/medications', {
                userId: user.id,
                name: newMed.name,
                dosage: newMed.dosage,
                time: newMed.time,
                instructions: newMed.instructions
            });

            if (result.success && result.data) {
                setMeds([...meds, result.data]);
            }
        } catch (error) {
            console.error('Failed to add medication:', error);
        }

        setNewMed({ name: '', dosage: '', time: '', instructions: '' });
        setDialogOpen(false);
    };

    const handleDeleteMed = async (id: string) => {
        try {
            await api.delete(`/api/patient/medications/${id}`);
            setMeds(meds.filter(m => m.id !== id));
        } catch (error) {
            console.error('Failed to delete medication:', error);
        }
    };

    const formatTime = (time: string) => {
        if (!time.includes(':')) return time;
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-3xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">My Medications</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="mr-2 h-4 w-4" /> Add Medication
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Medication</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="name">Medication Name</Label>
                                    <Input
                                        id="name"
                                        value={newMed.name}
                                        onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                                        placeholder="e.g., Donepezil"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dosage">Dosage</Label>
                                    <Input
                                        id="dosage"
                                        value={newMed.dosage}
                                        onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                        placeholder="e.g., 10mg"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="time">Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={newMed.time}
                                        onChange={e => setNewMed({ ...newMed, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instructions">Instructions (optional)</Label>
                                    <Input
                                        id="instructions"
                                        value={newMed.instructions}
                                        onChange={e => setNewMed({ ...newMed, instructions: e.target.value })}
                                        placeholder="e.g., Take with food"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddMed} className="bg-emerald-500 hover:bg-emerald-600">
                                    Add Medication
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : meds.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No medications added yet. Click "Add Medication" to get started.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {meds.map(med => (
                            <Card key={med.id} className={`transition-all ${med.taken ? 'opacity-60' : ''}`}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleTaken(med.id)}
                                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${med.taken
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-muted-foreground hover:border-emerald-500'
                                                    }`}
                                            >
                                                {med.taken && <Check className="w-5 h-5" />}
                                            </button>
                                            <div>
                                                <h3 className={`font-semibold text-lg ${med.taken ? 'line-through' : ''}`}>
                                                    {med.name} ({med.dosage})
                                                </h3>
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(med.time)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {med.instructions && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Info className="w-3 h-3" />
                                                    {med.instructions}
                                                </span>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteMed(med.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Medications;
