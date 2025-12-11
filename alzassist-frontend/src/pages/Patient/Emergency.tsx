import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, Phone, ShieldAlert, PhoneCall, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Contact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
}

const Emergency = () => {
    const { user } = useAuthStore();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRelation, setNewRelation] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadContacts = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const result = await api.get(`/api/patient/emergency/${user.id}`);
                if (result.success && Array.isArray(result.data)) {
                    setContacts(result.data);
                }
            } catch (error) {
                console.error('Failed to load contacts:', error);
            }
            setIsLoading(false);
        };
        loadContacts();
    }, [user]);

    const handleCall = (phoneNumber: string) => {
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleAddContact = async () => {
        if (!newName.trim() || !newPhone.trim() || !user?.id) return;

        setIsSaving(true);
        try {
            const result = await api.post('/api/patient/emergency', {
                userId: user.id,
                name: newName,
                phone: newPhone,
                relationship: newRelation || 'Emergency Contact'
            });

            if (result.success && result.data) {
                setContacts([...contacts, result.data]);
                setNewName('');
                setNewPhone('');
                setNewRelation('');
                setDialogOpen(false);
            }
        } catch (error) {
            console.error('Failed to add contact:', error);
        }
        setIsSaving(false);
    };

    const handleDeleteContact = async (id: string) => {
        try {
            await api.delete(`/api/patient/emergency/${id}`);
            setContacts(contacts.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete contact:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-2xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Emergency Contacts</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 flex items-center justify-center p-0">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Contact</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Dr. Smith"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="e.g. 555-0123"
                                        type="tel"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="relation">Relationship</Label>
                                    <Input
                                        id="relation"
                                        value={newRelation}
                                        onChange={(e) => setNewRelation(e.target.value)}
                                        placeholder="e.g. Doctor, Son"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddContact} disabled={isSaving || !newName || !newPhone}>
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Add Contact
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Always show 911 as a static option at the top? User asked to remove 'default numbers'. 
                            I'll leave 911 out to be safe, or maybe add it if the list is empty? 
                            Let's strictly follow "remove this default number" and rely on user added contacts. 
                            Users can add 911 if they want. */}

                        {contacts.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-lg">
                                <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No emergency contacts added yet.</p>
                                <p className="text-sm mt-1">Tap the + button to add trusted contacts.</p>
                            </div>
                        )}

                        {contacts.map((contact) => (
                            <Card key={contact.id} className="border-l-8 border-l-rose-500 shadow-sm relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteContact(contact.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-full bg-rose-50 text-rose-600`}>
                                            <Phone className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                {contact.name}
                                                {contact.relationship && <span className="text-sm font-normal text-muted-foreground ml-2">({contact.relationship})</span>}
                                            </h3>
                                            <p className="text-2xl font-mono font-bold text-muted-foreground">{contact.phone}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="bg-rose-600 hover:bg-rose-700 h-14 text-lg px-8 mr-8"
                                        onClick={() => handleCall(contact.phone)}
                                    >
                                        <PhoneCall className="w-5 h-5 mr-2" />
                                        Call
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="mt-8 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                        Tap "Call" to immediately dial the contact. Your device's phone app will open.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Emergency;
