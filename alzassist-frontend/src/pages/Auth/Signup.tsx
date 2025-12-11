import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Role } from '@/store/useAuthStore';
import { useAuthStore } from '@/store/useAuthStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Heart, Shield, User, Users, Check, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const roleConfig = {
    PATIENT: {
        icon: Heart,
        color: 'teal',
        bgGradient: 'from-teal-500/10 to-cyan-500/10',
        borderColor: 'border-t-teal-500',
        buttonBg: 'bg-teal-600 hover:bg-teal-700',
        textColor: 'text-teal-600',
        tabActive: 'data-[state=active]:bg-teal-500 data-[state=active]:text-white',
        title: 'Patient Account',
        subtitle: 'Your personal care companion',
        features: [
            'Daily journal to record thoughts & memories',
            'Medication reminders & tracking',
            'Familiar faces gallery',
            'Memory games & brain exercises',
            'One-tap emergency contacts'
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
        title: 'Caretaker Account',
        subtitle: 'Monitor & protect your loved ones',
        features: [
            'Real-time GPS location tracking',
            'Geofence alerts when patient wanders',
            'View patient journals & activities',
            'Medication compliance monitoring',
            'Quick call & emergency response'
        ]
    }
};

const Signup = () => {
    const navigate = useNavigate();
    const { signup, isLoading, error, clearError } = useAuthStore();
    const [role, setRole] = useState<Role>('PATIENT');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        patientEmail: '',
    });
    const [validationError, setValidationError] = useState('');

    const config = roleConfig[role || 'PATIENT'];
    const RoleIcon = config.icon;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setValidationError('');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setValidationError('');

        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters');
            return;
        }

        if (role === 'CARETAKER' && !formData.patientEmail.trim()) {
            setValidationError('Please enter the patient email you want to monitor');
            return;
        }

        const success = await signup(
            formData.email,
            formData.password,
            formData.name,
            role,
            role === 'CARETAKER' ? formData.patientEmail : undefined
        );

        if (success) {
            if (role === 'PATIENT') {
                navigate('/patient/dashboard');
            } else {
                navigate('/caretaker/dashboard');
            }
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${config.bgGradient} p-4 transition-all duration-500`}>
            <Card className={`w-full max-w-lg shadow-xl border-t-4 ${config.borderColor} transition-all duration-300`}>
                <CardHeader className="text-center pb-2">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center mb-4 border-2 ${config.borderColor.replace('border-t-', 'border-')}`}>
                        <RoleIcon className={`w-8 h-8 ${config.textColor}`} />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">Create Account</CardTitle>
                    <CardDescription>Join AlzAssist Care Portal</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="PATIENT"
                        onValueChange={(v) => setRole(v as Role)}
                        className="w-full mb-6"
                    >
                        <TabsList className="grid w-full grid-cols-2 h-14">
                            <TabsTrigger
                                value="PATIENT"
                                className={`text-base font-semibold h-12 gap-2 transition-all ${roleConfig.PATIENT.tabActive}`}
                            >
                                <User className="w-5 h-5" />
                                I'm a Patient
                            </TabsTrigger>
                            <TabsTrigger
                                value="CARETAKER"
                                className={`text-base font-semibold h-12 gap-2 transition-all ${roleConfig.CARETAKER.tabActive}`}
                            >
                                <Users className="w-5 h-5" />
                                I'm a Caretaker
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="PATIENT" className="mt-4">
                            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                                <h3 className="font-semibold text-teal-800 mb-1">{roleConfig.PATIENT.title}</h3>
                                <p className="text-sm text-teal-600 mb-3">{roleConfig.PATIENT.subtitle}</p>
                                <ul className="space-y-1">
                                    {roleConfig.PATIENT.features.map((feature, i) => (
                                        <li key={i} className="text-xs text-teal-700 flex items-start gap-2">
                                            <Check className="w-3 h-3 mt-0.5 text-teal-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>

                        <TabsContent value="CARETAKER" className="mt-4">
                            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
                                <h3 className="font-semibold text-violet-800 mb-1">{roleConfig.CARETAKER.title}</h3>
                                <p className="text-sm text-violet-600 mb-3">{roleConfig.CARETAKER.subtitle}</p>
                                <ul className="space-y-1">
                                    {roleConfig.CARETAKER.features.map((feature, i) => (
                                        <li key={i} className="text-xs text-violet-700 flex items-start gap-2">
                                            <Check className="w-3 h-3 mt-0.5 text-violet-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {(error || validationError) && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                            {error || validationError}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Your Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Caretaker-Patient Linking */}
                        {role === 'CARETAKER' && (
                            <div className="p-4 bg-violet-50 rounded-lg border-2 border-dashed border-violet-300">
                                <Label htmlFor="patientEmail" className="flex items-center gap-2 mb-2 text-violet-800 font-semibold">
                                    <Link2 className="w-4 h-4" />
                                    Link to Patient Account
                                </Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={formData.patientEmail}
                                    onChange={handleChange}
                                    required={role === 'CARETAKER'}
                                    className="h-11 bg-white"
                                />
                                <p className="text-xs text-violet-600 mt-2">
                                    ⚠️ Enter the email of the patient you'll be monitoring. They should create their account first.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="pr-10 h-11"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="pr-10 h-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
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
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <RoleIcon className="mr-2 h-5 w-5" />
                                    Create {role === 'PATIENT' ? 'Patient' : 'Caretaker'} Account
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className={`font-medium ${config.textColor} hover:opacity-80`}>
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Signup;
