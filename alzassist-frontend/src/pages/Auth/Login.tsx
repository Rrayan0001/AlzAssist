import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Role } from '@/store/useAuthStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock login helper
const performLogin = async (email: string, role: string) => {
    return new Promise<{ success: boolean; role: Role }>((resolve) => {
        console.log(`Logging in ${email} as ${role}`);
        setTimeout(() => resolve({ success: true, role: role as Role }), 1000);
    });
};

const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>('PATIENT');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulating API call
        try {
            await performLogin(email, selectedRole || 'PATIENT');
            login(email, selectedRole);

            if (selectedRole === 'PATIENT') {
                navigate('/patient/dashboard');
            } else {
                navigate('/caretaker/dashboard');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-foreground">Welcome Back</CardTitle>
                    <CardDescription>Sign in to AlzAssist Care Portal</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="PATIENT" onValueChange={(v) => setSelectedRole(v as Role)} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="PATIENT">Patient</TabsTrigger>
                            <TabsTrigger value="CARETAKER">Caretaker</TabsTrigger>
                        </TabsList>
                        <TabsContent value="PATIENT">
                            <p className="text-sm text-center text-muted-foreground my-2">
                                Access your daily journal, reminders, and help.
                            </p>
                        </TabsContent>
                        <TabsContent value="CARETAKER">
                            <p className="text-sm text-center text-muted-foreground my-2">
                                Monitor patients, set alerts, and manage care.
                            </p>
                        </TabsContent>
                    </Tabs>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className="text-sm text-primary hover:text-primary/80">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
