import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Smile, Meh, Frown, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

type Mood = 'Happy' | 'Neutral' | 'Sad';

interface Entry {
    id: string;
    created_at: string;
    content: string;
    mood: Mood;
}

const moodConfig = {
    Happy: { icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
    Neutral: { icon: Meh, color: 'text-amber-500', bg: 'bg-amber-100' },
    Sad: { icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100' }
};

const Journal = () => {
    const { user } = useAuthStore();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [newEntry, setNewEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>('Neutral');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load entries from backend
    useEffect(() => {
        const loadEntries = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const result = await api.get(`/api/patient/journals/${user.id}`);
                if (result.success && Array.isArray(result.data)) {
                    setEntries(result.data);
                }
            } catch (error) {
                console.error('Failed to load journals:', error);
            }
            setIsLoading(false);
        };
        loadEntries();
    }, [user]);

    const handleSave = async () => {
        if (!newEntry.trim() || !user?.id) return;
        setIsSaving(true);

        try {
            const result = await api.post('/api/patient/journals', {
                userId: user.id,
                content: newEntry,
                mood: selectedMood
            });

            if (result.success && result.data) {
                setEntries([result.data, ...entries]);
            }
        } catch (error) {
            console.error('Failed to save journal:', error);
        }

        setNewEntry('');
        setSelectedMood('Neutral');
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/patient/journals/${id}`);
            setEntries(entries.filter(e => e.id !== id));
        } catch (error) {
            console.error('Failed to delete journal:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-2xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">Daily Journal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="How are you feeling today? Write about your day..."
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                            className="min-h-[120px] resize-none"
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">How do you feel?</span>
                                {(['Happy', 'Neutral', 'Sad'] as Mood[]).map((mood) => {
                                    const config = moodConfig[mood];
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={mood}
                                            onClick={() => setSelectedMood(mood)}
                                            className={`p-2 rounded-full transition-all ${selectedMood === mood
                                                    ? `${config.bg} ${config.color}`
                                                    : 'hover:bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </button>
                                    );
                                })}
                            </div>

                            <Button onClick={handleSave} disabled={isSaving || !newEntry.trim()}>
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Save Entry
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <h2 className="text-xl font-semibold mb-4">Past Entries</h2>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : entries.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No journal entries yet. Start writing above!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry) => {
                            const config = moodConfig[entry.mood] || moodConfig.Neutral;
                            const Icon = config.icon;
                            return (
                                <Card key={entry.id}>
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`p-1 rounded-full ${config.bg}`}>
                                                    <Icon className={`w-4 h-4 ${config.color}`} />
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {format(new Date(entry.created_at), 'PPP p')}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Journal;
