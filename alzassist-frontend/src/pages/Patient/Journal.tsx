import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Smile, Meh, Frown, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

type Mood = 'Happy' | 'Neutral' | 'Sad';

interface Entry {
    id: string;
    created_at: string;
    content: string;
    mood: Mood;
}

const moodIcons = {
    Happy: { icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
    Neutral: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    Sad: { icon: Frown, color: 'text-red-500', bg: 'bg-red-100' }
};

const Journal = () => {
    const { user } = useAuthStore();
    const [entries, setEntries] = useState<Entry[]>([]);
    const [newEntry, setNewEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>('Neutral');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load entries from backend or localStorage
    useEffect(() => {
        const loadEntries = async () => {
            setIsLoading(true);
            try {
                if (user?.token && user.token !== 'mock-token') {
                    const result = await api.get('/journals', user.token);
                    if (result.success && result.data) {
                        setEntries(result.data);
                    }
                } else {
                    // Fallback to localStorage for demo
                    const stored = localStorage.getItem(`journal-entries-${user?.id}`);
                    if (stored) {
                        setEntries(JSON.parse(stored));
                    }
                }
            } catch (error) {
                console.error('Failed to load entries:', error);
                // Fallback to localStorage
                const stored = localStorage.getItem(`journal-entries-${user?.id}`);
                if (stored) {
                    setEntries(JSON.parse(stored));
                }
            }
            setIsLoading(false);
        };

        if (user) {
            loadEntries();
        }
    }, [user]);

    // Save to localStorage whenever entries change (for demo purposes)
    useEffect(() => {
        if (user && entries.length > 0) {
            localStorage.setItem(`journal-entries-${user.id}`, JSON.stringify(entries));
        }
    }, [entries, user]);

    const handleSave = async () => {
        if (!newEntry.trim()) return;
        setIsSaving(true);

        const newEntryData = {
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            content: newEntry,
            mood: selectedMood
        };

        try {
            if (user?.token && user.token !== 'mock-token') {
                const result = await api.post('/journals', {
                    content: newEntry,
                    mood: selectedMood
                }, user.token);

                if (result.success && result.data) {
                    setEntries([result.data, ...entries]);
                } else {
                    // Fallback to local
                    setEntries([newEntryData, ...entries]);
                }
            } else {
                // Fallback to local storage only
                setEntries([newEntryData, ...entries]);
            }
        } catch (error) {
            console.error('Failed to save entry:', error);
            // Fallback to local
            setEntries([newEntryData, ...entries]);
        }

        setNewEntry('');
        setSelectedMood('Neutral');
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        try {
            if (user?.token && user.token !== 'mock-token') {
                await api.delete(`/journals/${id}`, user.token);
            }
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
        setEntries(entries.filter(e => e.id !== id));
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-2xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-6">Daily Journal</h1>

                <Card className="mb-8 border-t-4 border-t-amber-400 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-foreground">How are you feeling today?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Mood Selector */}
                        <div className="flex gap-4 justify-center">
                            {(Object.keys(moodIcons) as Mood[]).map((mood) => {
                                const { icon: Icon, color, bg } = moodIcons[mood];
                                return (
                                    <button
                                        key={mood}
                                        onClick={() => setSelectedMood(mood)}
                                        className={`p-4 rounded-full transition-all ${selectedMood === mood
                                            ? `${bg} ring-4 ring-primary scale-110`
                                            : 'bg-muted hover:bg-muted/80'
                                            }`}
                                    >
                                        <Icon className={`w-8 h-8 ${color}`} />
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-center text-muted-foreground">Selected: <strong>{selectedMood}</strong></p>

                        <Textarea
                            placeholder="Write your thoughts here..."
                            className="min-h-[150px] text-lg p-4 bg-card"
                            value={newEntry}
                            onChange={(e) => setNewEntry(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                className="bg-amber-500 hover:bg-amber-600"
                                onClick={handleSave}
                                disabled={!newEntry.trim() || isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Save Entry
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Past Entries</h2>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground mt-2">Loading entries...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No entries yet. Start writing!</p>
                    ) : (
                        entries.map((entry) => {
                            const moodKey = (entry.mood as Mood) || 'Neutral';
                            const { icon: MoodIcon, color, bg } = moodIcons[moodKey];
                            return (
                                <Card key={entry.id} className="bg-card group relative">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-primary">
                                                {format(new Date(entry.created_at), 'MMMM do, yyyy • h:mm a')}
                                            </span>
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${bg} ${color}`}>
                                                <MoodIcon className="w-4 h-4" />
                                                {entry.mood}
                                            </span>
                                        </div>
                                        <p className="text-foreground text-lg">{entry.content}</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default Journal;
