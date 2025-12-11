import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

const defaultTasks: Task[] = [
    { id: '1', text: 'Brush teeth', completed: false },
    { id: '2', text: 'Eat breakfast', completed: false },
    { id: '3', text: 'Take morning medicine', completed: false },
    { id: '4', text: 'Water the plants', completed: false },
    { id: '5', text: 'Call daughter', completed: false },
    { id: '6', text: 'Read a book', completed: false },
];

const Tasks = () => {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTask, setNewTask] = useState('');

    // Load tasks
    useEffect(() => {
        const loadTasks = () => {
            setIsLoading(true);
            const stored = localStorage.getItem(`tasks-${user?.id}`);
            if (stored) {
                setTasks(JSON.parse(stored));
            } else {
                setTasks(defaultTasks);
                localStorage.setItem(`tasks-${user?.id}`, JSON.stringify(defaultTasks));
            }
            setIsLoading(false);
        };

        if (user) {
            loadTasks();
        }
    }, [user]);

    // Save whenever tasks change
    useEffect(() => {
        if (user && tasks.length > 0) {
            localStorage.setItem(`tasks-${user.id}`, JSON.stringify(tasks));
        }
    }, [tasks, user]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        const task: Task = {
            id: Date.now().toString(),
            text: newTask,
            completed: false
        };
        setTasks([...tasks, task]);
        setNewTask('');
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        if (updated.length === 0) {
            localStorage.removeItem(`tasks-${user?.id}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-2xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-2">Daily Tasks</h1>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{completedCount} of {tasks.length} completed</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Add Task */}
                <Card className="mb-6 border-t-4 border-t-sky-400">
                    <CardContent className="p-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a new task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 text-lg"
                            />
                            <Button onClick={addTask} disabled={!newTask.trim()} className="bg-sky-500 hover:bg-sky-600">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground mt-2">Loading tasks...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <Card key={task.id} className={`transition-all group ${task.completed ? 'bg-sky-50 border-sky-200' : 'bg-card'}`}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <Checkbox
                                        id={task.id}
                                        checked={task.completed}
                                        onCheckedChange={() => toggleTask(task.id)}
                                        className="w-7 h-7 border-2 border-sky-500 data-[state=checked]:bg-sky-600"
                                    />
                                    <label
                                        htmlFor={task.id}
                                        className={`text-xl font-medium cursor-pointer flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                                    >
                                        {task.text}
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                        onClick={() => deleteTask(task.id)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {tasks.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No tasks yet. Add one above!</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Tasks;
