import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Ambulance, ShieldAlert, PhoneCall } from 'lucide-react';

const Emergency = () => {
    const contacts = [
        { name: 'Dr. Smith (Doctor)', number: '+15550123', displayNumber: '555-0123', icon: Ambulance, color: 'text-red-600', bg: 'bg-red-50' },
        { name: 'Sarah (Daughter)', number: '+15550199', displayNumber: '555-0199', icon: Phone, color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Emergency Services', number: '911', displayNumber: '911', icon: ShieldAlert, color: 'text-red-700', bg: 'bg-red-100' },
    ];

    const handleCall = (phoneNumber: string) => {
        window.location.href = `tel:${phoneNumber}`;
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-2xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-6">Emergency Contacts</h1>

                <div className="space-y-4">
                    {contacts.map((contact, idx) => (
                        <Card key={idx} className="border-l-8 border-l-rose-500 shadow-sm">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-full ${contact.bg}`}>
                                        <contact.icon className={`w-8 h-8 ${contact.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{contact.name}</h3>
                                        <p className="text-2xl font-mono font-bold text-muted-foreground">{contact.displayNumber}</p>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-rose-600 hover:bg-rose-700 h-14 text-lg px-8"
                                    onClick={() => handleCall(contact.number)}
                                >
                                    <PhoneCall className="w-5 h-5 mr-2" />
                                    Call
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
