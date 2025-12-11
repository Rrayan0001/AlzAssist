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

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    time: string;
    taken: boolean;
    instructions: string;
}

const defaultMeds: Medicine[] = [
    { id: '1', name: 'Donepezil', dosage: '10mg', time: '09:00', taken: false, instructions: 'Take with food' },
    { id: '2', name: 'Memantine', dosage: '5mg', time: '14:00', taken: false, instructions: 'Take with water' },
    { id: '3', name: 'Vitamin D', dosage: '1000 IU', time: '20:00', taken: false, instructions: 'Before bed' },
];

const Medications = () => {
    const { user } = useAuthStore();
    const [meds, setMeds] = useState<Medicine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '', instructions: '' });

    // Load medications
    useEffect(() => {
        const loadMeds = () => {
            setIsLoading(true);
            const stored = localStorage.getItem(`medications-${user?.id}`);
            if (stored) {
                setMeds(JSON.parse(stored));
            } else {
                // Use defaults for new users
                setMeds(defaultMeds);
                localStorage.setItem(`medications-${user?.id}`, JSON.stringify(defaultMeds));
            }
            setIsLoading(false);
        };

        if (user) {
            loadMeds();
        }
    }, [user]);

    // Save whenever meds change
    useEffect(() => {
        if (user && meds.length > 0) {
            localStorage.setItem(`medications-${user.id}`, JSON.stringify(meds));
        }
    }, [meds, user]);

    const toggleTaken = (id: string) => {
        setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
    };

    const handleAddMed = () => {
        if (!newMed.name || !newMed.dosage || !newMed.time) return;
        const med: Medicine = {
            id: Date.now().toString(),
            ...newMed,
            taken: false
        };
        setMeds([...meds, med]);
        setNewMed({ name: '', dosage: '', time: '', instructions: '' });
        setDialogOpen(false);
    };

    const handleDeleteMed = (id: string) => {
        const updated = meds.filter(m => m.id !== id);
        setMeds(updated);
        if (updated.length === 0) {
            localStorage.removeItem(`medications-${user?.id}`);
        }
    };

    const formatTime = (time: string) => {
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
                                <Plus className="w-4 h-4 mr-2" /> Add Medication
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Medication</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="med-name">Medication Name</Label>
                                    <Input
                                        id="med-name"
                                        placeholder="e.g. Aspirin"
                                        value={newMed.name}
                                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="med-dosage">Dosage</Label>
                                        <Input
                                            id="med-dosage"
                                            placeholder="e.g. 100mg"
                                            value={newMed.dosage}
                                            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="med-time">Time</Label>
                                        <Input
                                            id="med-time"
                                            type="time"
                                            value={newMed.time}
                                            onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="med-instructions">Instructions (Optional)</Label>
                                    <Input
                                        id="med-instructions"
                                        placeholder="e.g. Take with food"
                                        value={newMed.instructions}
                                        onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddMed} disabled={!newMed.name || !newMed.dosage || !newMed.time}>
                                    Add Medication
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground mt-2">Loading medications...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {meds.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No medications added. Click "Add Medication" to get started.</p>
                        ) : (
                            meds.map((med) => (
                                <Card key={med.id} className={`border-l-8 group relative ${med.taken ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-muted bg-card'}`}>
                                    <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-bold text-foreground">{med.name}</h3>
                                                <span className="text-lg font-medium text-muted-foreground">({med.dosage})</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-muted-foreground">
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(med.time)}</span>
                                                {med.instructions && (
                                                    <span className="flex items-center gap-1"><Info className="w-4 h-4" /> {med.instructions}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="lg"
                                                className={`min-w-[140px] text-lg h-14 ${med.taken ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-card text-foreground border-2 border-muted hover:bg-muted'}`}
                                                variant={med.taken ? 'default' : 'outline'}
                                                onClick={() => toggleTaken(med.id)}
                                            >
                                                {med.taken ? (
                                                    <><Check className="mr-2 h-6 w-6" /> Taken</>
                                                ) : (
                                                    'Mark Taken'
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteMed(med.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Medications;
