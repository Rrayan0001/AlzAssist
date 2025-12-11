import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import {
    BookOpen,
    Pill,
    CheckSquare,
    Phone,
    Image as ImageIcon,
    Gamepad2,
    MapPin,
    UserPlus
} from 'lucide-react';

const DashboardOption = ({ title, icon: Icon, to, color }: { title: string, icon: any, to: string, color: string }) => (
    <Link to={to} className="block group">
        <Card className={`h-full hover:shadow-lg transition-shadow border-t-8 ${color} cursor-pointer`}>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-center">
                <div className={`p-4 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-')}`}>
                    <Icon className={`w-12 h-12 ${color.replace('border-t-', 'text-')}`} />
                </div>
                <h3 className="text-xl font-bold group-hover:text-indigo-700">{title}</h3>
            </CardContent>
        </Card>
    </Link>
);

const PatientDashboard = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-foreground">Good Morning!</h1>
                    <p className="text-xl text-muted-foreground mt-2">What would you like to do today?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardOption title="Daily Journal" icon={BookOpen} to="/patient/journal" color="border-t-amber-400" />
                    <DashboardOption title="My Medications" icon={Pill} to="/patient/medications" color="border-t-emerald-400" />
                    <DashboardOption title="Daily Tasks" icon={CheckSquare} to="/patient/tasks" color="border-t-sky-400" />
                    <DashboardOption title="Emergency" icon={Phone} to="/patient/emergency" color="border-t-rose-400" />


                    <DashboardOption title="Photo Gallery" icon={ImageIcon} to="/patient/gallery" color="border-t-pink-400" />
                    <DashboardOption title="Memory Games" icon={Gamepad2} to="/patient/games" color="border-t-purple-400" />
                    <DashboardOption title="My Location" icon={MapPin} to="/patient/location" color="border-t-indigo-400" />
                    <DashboardOption title="Requests" icon={UserPlus} to="/patient/requests" color="border-t-teal-400" />
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;

