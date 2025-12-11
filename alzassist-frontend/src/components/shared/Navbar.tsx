import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-extrabold text-primary tracking-tight">
                    AlzAssist
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <Avatar className="bg-primary/10">
                                    <AvatarFallback className="text-primary font-bold">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
                                </div>
                            </Link>
                            <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
