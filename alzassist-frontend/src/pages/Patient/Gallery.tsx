import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowLeft, User, Plus, Trash2, Upload, X } from 'lucide-react';

interface Face {
    id: string;
    name: string;
    relation: string;
    img: string;
}

const initialFaces: Face[] = [
    { id: '1', name: 'Martha', relation: 'Wife', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop' },
    { id: '2', name: 'David', relation: 'Son', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop' },
];

const Gallery = () => {
    const [faces, setFaces] = useState<Face[]>(initialFaces);
    const [newName, setNewName] = useState('');
    const [newRelation, setNewRelation] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleAddFace = () => {
        if (!newName.trim() || !newRelation.trim() || !newImage) return;

        const newFace: Face = {
            id: Date.now().toString(),
            name: newName,
            relation: newRelation,
            img: newImage
        };

        setFaces([...faces, newFace]);
        setNewName('');
        setNewRelation('');
        setNewImage(null);
        setDialogOpen(false);
    };

    const handleDeleteFace = (id: string) => {
        setFaces(faces.filter(f => f.id !== id));
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
                                    <Button variant="link" onClick={() => fileInputRef.current?.click()} className="mt-2">
                                        {newImage ? 'Change Photo' : 'Upload Photo'}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Martha"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="relation">Relationship</Label>
                                    <Input
                                        id="relation"
                                        placeholder="e.g. Wife, Son, Nurse"
                                        value={newRelation}
                                        onChange={(e) => setNewRelation(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddFace} disabled={!newName || !newRelation || !newImage}>
                                    Add Person
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {faces.map((person) => (
                        <Card key={person.id} className="overflow-hidden border-2 border-primary/20 shadow-md transform hover:scale-105 transition-transform group relative">
                            <div className="aspect-square bg-muted relative">
                                <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <p className="text-white font-bold text-xl">{person.name}</p>
                                    <p className="text-primary-foreground/80 text-sm">{person.relation}</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteFace(person.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {/* Add New Placeholder */}
                    <Card
                        className="border-2 border-dashed border-primary/30 shadow-sm flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors h-full min-h-[300px]"
                        onClick={() => setDialogOpen(true)}
                    >
                        <div className="text-center text-muted-foreground">
                            <User className="w-16 h-16 mx-auto mb-2" />
                            <p className="font-medium">Add New Photo</p>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Gallery;
