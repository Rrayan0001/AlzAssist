import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Role } from '@/store/useAuthStore';
import { useAuthStore } from '@/store/useAuthStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Users, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
        patientEmail: '', // For caretakers to link to a patient
    });
    const [validationError, setValidationError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setValidationError('');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setValidationError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters');
            return;
        }

        // For caretakers, validate patient email is provided
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-foreground">Create Account</CardTitle>
                    <CardDescription>Join AlzAssist as a Patient or Caretaker</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="PATIENT" onValueChange={(v) => setRole(v as Role)} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="PATIENT">Patient</TabsTrigger>
                            <TabsTrigger value="CARETAKER">Caretaker</TabsTrigger>
                        </TabsList>
                        <TabsContent value="PATIENT">
                            <p className="text-sm text-center text-muted-foreground my-2">
                                Create your personal care portal for journals, medications, and more.
                            </p>
                        </TabsContent>
                        <TabsContent value="CARETAKER">
                            <div className="p-3 bg-primary/10 rounded-lg my-2">
                                <p className="text-sm text-center text-primary flex items-center justify-center gap-2">
                                    <Link2 className="w-4 h-4" />
                                    Link to a patient to monitor their location and activities
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {(error || validationError) && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                            {error || validationError}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                        </div>

                        {/* Caretaker-Patient Linking */}
                        {role === 'CARETAKER' && (
                            <div className="space-y-2 p-4 bg-muted rounded-lg border-2 border-dashed border-primary/30">
                                <Label htmlFor="patientEmail" className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    Patient's Email to Monitor
                                </Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    placeholder="patient@example.com"
                                    value={formData.patientEmail}
                                    onChange={handleChange}
                                    required={role === 'CARETAKER'}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the email of the patient you'll be caring for. They must have an account.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pr-10"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Signup;
