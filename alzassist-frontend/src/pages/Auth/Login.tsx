import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Role } from '@/store/useAuthStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Heart, Shield, User, Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const roleConfig = {
    PATIENT: {
        icon: Heart,
        color: 'teal',
        bgGradient: 'from-teal-500/10 to-cyan-500/10',
        borderColor: 'border-t-teal-500',
        buttonBg: 'bg-teal-600 hover:bg-teal-700',
        textColor: 'text-teal-600',
        tabActive: 'data-[state=active]:bg-teal-500 data-[state=active]:text-white',
        title: 'Patient Portal',
        description: 'Access your personal care dashboard',
        instructions: [
            'View and write in your daily journal',
            'Track medications and daily tasks',
            'See familiar faces in your gallery',
            'Play memory games and activities',
            'Emergency contacts always available'
        ]
    },
    CARETAKER: {
        icon: Shield,
        color: 'violet',
        bgGradient: 'from-violet-500/10 to-purple-500/10',
        borderColor: 'border-t-violet-500',
        buttonBg: 'bg-violet-600 hover:bg-violet-700',
        textColor: 'text-violet-600',
        tabActive: 'data-[state=active]:bg-violet-500 data-[state=active]:text-white',
        title: 'Caretaker Portal',
        description: 'Monitor and care for your loved ones',
        instructions: [
            'Real-time patient location tracking',
            'View patient activities and journals',
            'Receive alerts when patient needs help',
            'Manage multiple patients from one dashboard',
            'Quick call access for emergencies'
        ]
    }
};

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>('PATIENT');

    const config = roleConfig[selectedRole || 'PATIENT'];
    const RoleIcon = config.icon;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        const success = await login(email, password, selectedRole);

        if (success) {
            if (selectedRole === 'PATIENT') {
                navigate('/patient/dashboard');
            } else {
                navigate('/caretaker/dashboard');
            }
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${config.bgGradient} p-4 transition-all duration-500`}>
            <Card className={`w-full max-w-md shadow-xl border-t-4 ${config.borderColor} transition-all duration-300`}>
                <CardHeader className="text-center pb-2">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center mb-4`}>
                        <RoleIcon className={`w-8 h-8 ${config.textColor}`} />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">Welcome Back</CardTitle>
                    <CardDescription>Sign in to AlzAssist Care Portal</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="PATIENT"
                        onValueChange={(v) => setSelectedRole(v as Role)}
                        className="w-full mb-6"
                    >
                        <TabsList className="grid w-full grid-cols-2 h-14">
                            <TabsTrigger
                                value="PATIENT"
                                className={`text-base font-semibold h-12 gap-2 transition-all ${roleConfig.PATIENT.tabActive}`}
                            >
                                <User className="w-5 h-5" />
                                Patient
                            </TabsTrigger>
                            <TabsTrigger
                                value="CARETAKER"
                                className={`text-base font-semibold h-12 gap-2 transition-all ${roleConfig.CARETAKER.tabActive}`}
                            >
                                <Users className="w-5 h-5" />
                                Caretaker
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="PATIENT" className="mt-4">
                            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                                <h3 className="font-semibold text-teal-800 mb-2 flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    {roleConfig.PATIENT.title}
                                </h3>
                                <p className="text-sm text-teal-700">{roleConfig.PATIENT.description}</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="CARETAKER" className="mt-4">
                            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
                                <h3 className="font-semibold text-violet-800 mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    {roleConfig.CARETAKER.title}
                                </h3>
                                <p className="text-sm text-violet-700">{roleConfig.CARETAKER.description}</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                            {error}
                        </div>
                    )}

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
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className={`text-sm ${config.textColor} hover:opacity-80`}>
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
                                    className="pr-10 h-12 text-base"
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
                        <Button
                            type="submit"
                            className={`w-full h-12 text-base font-semibold text-white ${config.buttonBg} transition-colors`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <RoleIcon className="mr-2 h-5 w-5" />
                                    Sign In as {selectedRole === 'PATIENT' ? 'Patient' : 'Caretaker'}
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className={`font-medium ${config.textColor} hover:opacity-80`}>
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
