'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Dumbbell } from 'lucide-react';
import { Equipment, WorkoutService } from '@/lib/data/workouts';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export function EquipmentLibrary() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const data = await WorkoutService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipment = async (data: EquipmentFormData) => {
    try {
      await WorkoutService.createEquipment({
        name: data.name,
      });
      toast.success('Equipment created successfully');
      loadEquipment();
      setIsCreateDialogOpen(false);
      resetCreate();
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Failed to create equipment');
    }
  };

  const handleUpdateEquipment = async (data: EquipmentFormData) => {
    if (!editingEquipment) return;

    try {
      await WorkoutService.updateEquipment(editingEquipment.id, {
        name: data.name,
      });
      toast.success('Equipment updated successfully');
      loadEquipment();
      setIsEditDialogOpen(false);
      setEditingEquipment(null);
      resetEdit();
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    }
  };

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (
      !confirm(
        `Are you sure you want to delete "${equipment.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await WorkoutService.deleteEquipment(equipment.id);
      toast.success('Equipment deleted successfully');
      loadEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Failed to delete equipment');
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setEditValue('name', equipment.name);
    setIsEditDialogOpen(true);
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Equipment Library
          </h2>
          <p className="text-muted-foreground">
            Manage workout equipment and gear
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Badge variant="outline" className="whitespace-nowrap">
          {filteredEquipment.length} items
        </Badge>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEquipment.map(item => (
            <Card
              key={item.id}
              className="group hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Dumbbell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEquipment(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEquipment(item)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-lg font-semibold mb-2">
              {equipment.length === 0
                ? 'No equipment yet'
                : 'No equipment found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {equipment.length === 0
                ? 'Add your first equipment to build your library'
                : `No equipment matches your search for "${searchTerm}"`}
            </p>
            {equipment.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Equipment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Add a new piece of equipment to your library
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateSubmit(handleCreateEquipment)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  placeholder="Enter equipment name (e.g., Dumbbells, Resistance Bands)"
                  {...registerCreate('name')}
                />
                {createErrors.name && (
                  <p className="text-sm text-red-600">
                    {createErrors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Equipment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>Update the equipment details</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleEditSubmit(handleUpdateEquipment)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Equipment Name</Label>
                <Input
                  id="edit_name"
                  placeholder="Enter equipment name"
                  {...registerEdit('name')}
                />
                {editErrors.name && (
                  <p className="text-sm text-red-600">
                    {editErrors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Equipment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
