'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  PlayCircle,
  ImageIcon,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { Exercise, WorkoutService } from '@/lib/data/workouts';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  description: z.string().optional(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumbnail_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

export function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await WorkoutService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (data: ExerciseFormData) => {
    try {
      await WorkoutService.createExercise({
        name: data.name,
        description: data.description || null,
        video_url: data.video_url || null,
        thumbnail_url: data.thumbnail_url || null,
      });
      toast.success('Exercise created successfully');
      loadExercises();
      setIsCreateDialogOpen(false);
      resetCreate();
    } catch (error) {
      console.error('Error creating exercise:', error);
      toast.error('Failed to create exercise');
    }
  };

  const handleUpdateExercise = async (data: ExerciseFormData) => {
    if (!editingExercise) return;

    try {
      await WorkoutService.updateExercise(editingExercise.id, {
        name: data.name,
        description: data.description || null,
        video_url: data.video_url || null,
        thumbnail_url: data.thumbnail_url || null,
      });
      toast.success('Exercise updated successfully');
      loadExercises();
      setIsEditDialogOpen(false);
      setEditingExercise(null);
      resetEdit();
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Failed to update exercise');
    }
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    if (
      !confirm(
        `Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await WorkoutService.deleteExercise(exercise.id);
      toast.success('Exercise deleted successfully');
      loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Failed to delete exercise');
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditValue('name', exercise.name);
    setEditValue('description', exercise.description || '');
    setEditValue('video_url', exercise.video_url || '');
    setEditValue('thumbnail_url', exercise.thumbnail_url || '');
    setIsEditDialogOpen(true);
  };

  const filteredExercises = exercises.filter(
    exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Exercise Library
          </h2>
          <p className="text-muted-foreground">
            Manage exercises, add videos and thumbnails
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map(exercise => (
          <Card key={exercise.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  {exercise.description && (
                    <CardDescription className="text-sm">
                      {exercise.description.length > 100
                        ? `${exercise.description.substring(0, 100)}...`
                        : exercise.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {exercise.video_url && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  {exercise.thumbnail_url && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Created {new Date(exercise.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  {exercise.video_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(exercise.video_url!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditExercise(exercise)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExercise(exercise)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-lg font-semibold mb-2">
              {exercises.length === 0
                ? 'No exercises yet'
                : 'No exercises found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {exercises.length === 0
                ? 'Create your first exercise to build your library'
                : `No exercises match your search for "${searchTerm}"`}
            </p>
            {exercises.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
            <DialogDescription>
              Create a new exercise for your workout library
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateSubmit(handleCreateExercise)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  placeholder="Enter exercise name"
                  {...registerCreate('name')}
                />
                {createErrors.name && (
                  <p className="text-sm text-red-600">
                    {createErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter exercise description and instructions"
                  rows={4}
                  {...registerCreate('description')}
                />
                {createErrors.description && (
                  <p className="text-sm text-red-600">
                    {createErrors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    placeholder="https://youtube.com/watch?v=..."
                    {...registerCreate('video_url')}
                  />
                  {createErrors.video_url && (
                    <p className="text-sm text-red-600">
                      {createErrors.video_url.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    placeholder="https://example.com/image.jpg"
                    {...registerCreate('thumbnail_url')}
                  />
                  {createErrors.thumbnail_url && (
                    <p className="text-sm text-red-600">
                      {createErrors.thumbnail_url.message}
                    </p>
                  )}
                </div>
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
              <Button type="submit">Create Exercise</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update the exercise details</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleEditSubmit(handleUpdateExercise)}
            className="space-y-6"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Exercise Name</Label>
                <Input
                  id="edit_name"
                  placeholder="Enter exercise name"
                  {...registerEdit('name')}
                />
                {editErrors.name && (
                  <p className="text-sm text-red-600">
                    {editErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  placeholder="Enter exercise description and instructions"
                  rows={4}
                  {...registerEdit('description')}
                />
                {editErrors.description && (
                  <p className="text-sm text-red-600">
                    {editErrors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_video_url">Video URL</Label>
                  <Input
                    id="edit_video_url"
                    placeholder="https://youtube.com/watch?v=..."
                    {...registerEdit('video_url')}
                  />
                  {editErrors.video_url && (
                    <p className="text-sm text-red-600">
                      {editErrors.video_url.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="edit_thumbnail_url"
                    placeholder="https://example.com/image.jpg"
                    {...registerEdit('thumbnail_url')}
                  />
                  {editErrors.thumbnail_url && (
                    <p className="text-sm text-red-600">
                      {editErrors.thumbnail_url.message}
                    </p>
                  )}
                </div>
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
              <Button type="submit">Update Exercise</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
