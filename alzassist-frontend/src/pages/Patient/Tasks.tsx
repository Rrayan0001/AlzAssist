import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

const Tasks = () => {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Load tasks from backend
    useEffect(() => {
        const loadTasks = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const result = await api.get(`/api/patient/tasks/${user.id}`);
                if (result.success && Array.isArray(result.data)) {
                    setTasks(result.data);
                }
            } catch (error) {
                console.error('Failed to load tasks:', error);
            }
            setIsLoading(false);
        };
        loadTasks();
    }, [user]);

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            await api.put(`/api/patient/tasks/${id}`, { completed: !task.completed });
            setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.trim() || !user?.id) return;

        try {
            const result = await api.post('/api/patient/tasks', {
                userId: user.id,
                text: newTask.trim()
            });

            if (result.success && result.data) {
                setTasks([...tasks, result.data]);
            }
        } catch (error) {
            console.error('Failed to add task:', error);
        }

        setNewTask('');
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await api.delete(`/api/patient/tasks/${id}`);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete task:', error);
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

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">Daily Tasks</CardTitle>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{completedCount} of {tasks.length} completed</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Add a new task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                            <Button onClick={handleAddTask} className="bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : tasks.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No tasks yet. Add your first task above!
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${task.completed ? 'bg-muted/50 border-muted' : 'hover:border-primary'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-muted-foreground" />
                                            )}
                                            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                                {task.text}
                                            </span>
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Tasks;
