import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Smile, Meh, Frown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type Mood = 'Happy' | 'Neutral' | 'Sad';

interface Entry {
    id: string;
    date: Date;
    content: string;
    mood: Mood;
}

const moodIcons = {
    Happy: { icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
    Neutral: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    Sad: { icon: Frown, color: 'text-red-500', bg: 'bg-red-100' }
};

const Journal = () => {
    const [entries, setEntries] = useState<Entry[]>([
        { id: '1', date: new Date(Date.now() - 86400000), content: 'Today was a good day. I visited the park with my daughter.', mood: 'Happy' },
        { id: '2', date: new Date(Date.now() - 172800000), content: 'Felt a bit tired today. Took extra rest.', mood: 'Neutral' }
    ]);
    const [newEntry, setNewEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>('Neutral');

    const handleSave = () => {
        if (!newEntry.trim()) return;
        const entry: Entry = {
            id: Date.now().toString(),
            date: new Date(),
            content: newEntry,
            mood: selectedMood
        };
        setEntries([entry, ...entries]);
        setNewEntry('');
        setSelectedMood('Neutral');
    };

    const handleDelete = (id: string) => {
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
                            <Button size="lg" className="bg-amber-500 hover:bg-amber-600" onClick={handleSave} disabled={!newEntry.trim()}>
                                <Send className="mr-2 h-4 w-4" /> Save Entry
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Past Entries</h2>
                    {entries.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No entries yet. Start writing!</p>
                    ) : (
                        entries.map((entry) => {
                            const { icon: MoodIcon, color, bg } = moodIcons[entry.mood];
                            return (
                                <Card key={entry.id} className="bg-card group relative">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-primary">
                                                {format(entry.date, 'MMMM do, yyyy • h:mm a')}
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
