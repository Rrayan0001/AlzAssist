import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, User, Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Face {
    id: string;
    name: string;
    relation: string;
    image_url: string;
}

const Gallery = () => {
    const { user } = useAuthStore();
    const [faces, setFaces] = useState<Face[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newRelation, setNewRelation] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load gallery from backend
    useEffect(() => {
        const loadGallery = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const result = await api.get(`/api/patient/gallery/${user.id}`);
                if (result.success && Array.isArray(result.data)) {
                    // Map backend data to Face interface
                    const mappedFaces = result.data.map((item: { id: string; caption?: string; image_url: string }) => ({
                        id: item.id,
                        name: item.caption?.split(' - ')[0] || 'Unknown',
                        relation: item.caption?.split(' - ')[1] || 'Person',
                        image_url: item.image_url
                    }));
                    setFaces(mappedFaces);
                }
            } catch (error) {
                console.error('Failed to load gallery:', error);
            }
            setIsLoading(false);
        };
        loadGallery();
    }, [user]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddFace = async () => {
        if (!newName.trim() || !newRelation.trim() || !newImage || !user?.id) return;

        setIsSaving(true);
        try {
            const result = await api.post('/api/patient/gallery', {
                userId: user.id,
                imageUrl: newImage, // Base64 image or URL
                caption: `${newName} - ${newRelation}`
            });

            if (result.success && result.data) {
                const newFace: Face = {
                    id: result.data.id,
                    name: newName,
                    relation: newRelation,
                    image_url: result.data.image_url
                };
                setFaces([newFace, ...faces]);
            }
        } catch (error) {
            console.error('Failed to add face:', error);
        }

        setNewName('');
        setNewRelation('');
        setNewImage(null);
        setDialogOpen(false);
        setIsSaving(false);
    };

    const handleDeleteFace = async (id: string) => {
        try {
            await api.delete(`/api/patient/gallery/${id}`);
            setFaces(faces.filter(f => f.id !== id));
        } catch (error) {
            console.error('Failed to delete face:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-4xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Face Gallery</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 flex items-center justify-center p-0">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Person</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Image Upload */}
                                <div className="flex flex-col items-center">
                                    {newImage ? (
                                        <div className="relative">
                                            <img src={newImage} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-primary" />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full"
                                                onClick={() => setNewImage(null)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            className="w-32 h-32 rounded-full border-4 border-dashed border-primary/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-8 h-8 text-primary/50" />
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">Click to upload photo</p>
                                </div>

                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g., Martha"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="relation">Relationship</Label>
                                    <Input
                                        id="relation"
                                        value={newRelation}
                                        onChange={(e) => setNewRelation(e.target.value)}
                                        placeholder="e.g., Wife, Son, Doctor"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddFace} disabled={isSaving || !newName || !newRelation || !newImage}>
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Add Person
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : faces.length === 0 ? (
                    <Card className="p-12 text-center">
                        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mb-4">No faces added yet.</p>
                        <p className="text-sm text-muted-foreground">Click the + button to add familiar faces that help with memory.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {faces.map(face => (
                            <Card key={face.id} className="p-4 relative group">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                                    onClick={() => handleDeleteFace(face.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <div className="flex flex-col items-center">
                                    <img
                                        src={face.image_url}
                                        alt={face.name}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 mb-3"
                                    />
                                    <h3 className="font-semibold text-lg text-foreground">{face.name}</h3>
                                    <p className="text-sm text-muted-foreground">{face.relation}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Gallery;
