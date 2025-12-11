import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { User, Save, Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                // @ts-ignore
                phone: user.phone || '',
                // @ts-ignore
                age: user.age?.toString() || '',
                // @ts-ignore
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccessMessage('');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setIsLoading(true);
        setSuccessMessage('');
        setError('');

        try {
            const result = await api.put(`/api/profiles/${user.id}`, {
                name: formData.name,
                phone: formData.phone,
                age: formData.age ? parseInt(formData.age) : null,
                address: formData.address
            });

            if (result.success && result.data) {
                // Update local store
                // @ts-ignore
                updateUser(result.data);
                setSuccessMessage('Profile updated successfully!');
            } else {
                setError('Failed to save changes.');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setError('An error occurred. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-6 max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal details and contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {successMessage && (
                                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> {successMessage}
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> {error}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="pl-9 bg-muted"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Age"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Your home address"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Profile;
