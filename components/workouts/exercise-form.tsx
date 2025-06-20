'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Trash2, Search, PlayCircle, ImageIcon, Zap } from 'lucide-react';
import {
  SectionExercise,
  Exercise,
  Equipment,
  WorkoutService,
} from '@/lib/data/workouts';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const supabase = createClient();

// Simplified schema for main exercise only
const mainExerciseSchema = z.object({
  exercise_id: z.number().min(1, 'Please select an exercise'),
  exercise_order: z.number().min(1, 'Exercise order must be at least 1'),
  equipment_id: z.number().optional(),
  reps: z.string().optional(),
  duration_seconds: z.number().min(0).optional(),
  sets: z.number().min(1).optional(),
  rest_time_seconds: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Schema for alternative exercises
const alternativeExerciseSchema = z.object({
  exercise_id: z.number().min(1, 'Please select an exercise'),
  equipment_id: z.number().optional(),
  reps: z.string().optional(),
  duration_seconds: z.number().min(0).optional(),
  sets: z.number().min(1).optional(),
  rest_time_seconds: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type MainExerciseData = z.infer<typeof mainExerciseSchema>;
type AlternativeExerciseData = z.infer<typeof alternativeExerciseSchema>;

interface ExerciseFormProps {
  onSubmit: (data: Omit<SectionExercise, 'id' | 'created_at'>) => void;
  onRefresh?: () => void; // Add refresh callback for when we create exercises internally
  sectionId: number;
  existingExercises: any[];
  initialData?: SectionExercise;
  onClose?: () => void;
}

export function ExerciseForm({
  onSubmit,
  onRefresh,
  sectionId,
  existingExercises,
  initialData,
  onClose,
}: ExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Main exercise state
  const [mainExerciseId, setMainExerciseId] = useState<number | null>(
    initialData?.id || null
  );
  const [isMainExerciseSaved, setIsMainExerciseSaved] = useState(!!initialData);

  // Alternative exercises state
  const [alternatives, setAlternatives] = useState<
    (SectionExercise & { exercise: Exercise })[]
  >([]);
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);
  const [alternativeLoading, setAlternativeLoading] = useState(false);

  // Creation forms
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [showCreateEquipment, setShowCreateEquipment] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState('');

  // Main exercise form
  const mainForm = useForm<MainExerciseData>({
    resolver: zodResolver(mainExerciseSchema),
    defaultValues: initialData
      ? {
          exercise_id: initialData.exercise_id,
          exercise_order: initialData.exercise_order,
          equipment_id: initialData.equipment_id || undefined,
          reps: initialData.reps || '',
          sets: initialData.sets || 1,
          duration_seconds: initialData.duration_seconds || 0,
          rest_time_seconds: initialData.rest_time_seconds || 0,
          notes: initialData.notes || '',
        }
      : {
          exercise_order:
            Math.max(...existingExercises.map(e => e.exercise_order), 0) + 1,
          sets: 1,
          rest_time_seconds: 0,
          duration_seconds: 0,
        },
  });

  // Alternative exercise form
  const altForm = useForm<AlternativeExerciseData>({
    resolver: zodResolver(alternativeExerciseSchema),
    defaultValues: {
      sets: 1,
      rest_time_seconds: 0,
      duration_seconds: 0,
    },
  });

  useEffect(() => {
    loadExercises();
    loadEquipment();
    if (initialData) {
      loadAlternatives();
    }
  }, []);

  const loadExercises = async () => {
    try {
      const data = await WorkoutService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Failed to load exercises');
    }
  };

  const loadEquipment = async () => {
    try {
      const data = await WorkoutService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment');
    }
  };

  const loadAlternatives = async () => {
    if (!mainExerciseId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('section_exercises')
        .select(
          `
          *,
          exercise:exercises(*)
        `
        )
        .eq('parent_section_exercise_id', mainExerciseId);

      if (error) throw error;
      setAlternatives(data || []);
    } catch (error) {
      console.error('Error loading alternatives:', error);
    }
  };

  const handleCreateNewExercise = async () => {
    if (!newExerciseName.trim()) {
      toast.error('Exercise name is required');
      return;
    }

    try {
      const newExercise = await WorkoutService.createExercise({
        name: newExerciseName,
        description: newExerciseDescription || null,
        video_url: null,
        thumbnail_url: null,
      });

      setExercises(prev => [...prev, newExercise]);
      mainForm.setValue('exercise_id', newExercise.id);
      setShowCreateExercise(false);
      setNewExerciseName('');
      setNewExerciseDescription('');
      toast.success('Exercise created successfully');
    } catch (error) {
      console.error('Error creating exercise:', error);
      toast.error('Failed to create exercise');
    }
  };

  const handleCreateNewEquipment = async () => {
    if (!newEquipmentName.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    try {
      const newEquipment = await WorkoutService.createEquipment({
        name: newEquipmentName,
      });

      setEquipment(prev => [...prev, newEquipment]);
      setShowCreateEquipment(false);
      setNewEquipmentName('');
      toast.success('Equipment created successfully');
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Failed to create equipment');
    }
  };

  const handleMainExerciseSubmit = async (data: MainExerciseData) => {
    setLoading(true);

    try {
      const exerciseData = {
        day_section_id: sectionId,
        exercise_id: data.exercise_id,
        parent_section_exercise_id: null,
        exercise_order: data.exercise_order,
        equipment_id: data.equipment_id || null,
        reps: data.reps || null,
        duration_seconds: data.duration_seconds || null,
        sets: data.sets || null,
        rest_time_seconds: data.rest_time_seconds || null,
        notes: data.notes || null,
      };

      if (initialData) {
        // Update existing exercise
        await WorkoutService.updateSectionExercise(
          initialData.id,
          exerciseData
        );
        toast.success('Exercise updated successfully');
        // Call parent to refresh data for updates
        onSubmit(exerciseData);
      } else {
        // Create new exercise
        const created =
          await WorkoutService.createSectionExercise(exerciseData);
        setMainExerciseId(created.id);
        setIsMainExerciseSaved(true);
        toast.success(
          'Exercise created successfully! You can now add alternatives.'
        );

        // For new exercises, call refresh callback instead of onSubmit to avoid duplicate creation
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Failed to save exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlternative = async (data: AlternativeExerciseData) => {
    if (!mainExerciseId) {
      toast.error('Please save the main exercise first');
      return;
    }

    setAlternativeLoading(true);

    try {
      const altData = {
        day_section_id: sectionId,
        exercise_id: data.exercise_id,
        parent_section_exercise_id: mainExerciseId,
        exercise_order: alternatives.length + 1,
        equipment_id: data.equipment_id || null,
        reps: data.reps || null,
        duration_seconds: data.duration_seconds || null,
        sets: data.sets || null,
        rest_time_seconds: data.rest_time_seconds || null,
        notes: data.notes || null,
      };

      const created = await WorkoutService.createSectionExercise(altData);

      // Get the exercise details
      const exercise = exercises.find(e => e.id === data.exercise_id);
      if (exercise) {
        setAlternatives(prev => [...prev, { ...created, exercise }]);
      }

      altForm.reset({
        sets: 1,
        rest_time_seconds: 0,
        duration_seconds: 0,
      });
      setShowAlternativeForm(false);
      toast.success('Alternative exercise added successfully');
    } catch (error) {
      console.error('Error adding alternative:', error);
      toast.error('Failed to add alternative exercise');
    } finally {
      setAlternativeLoading(false);
    }
  };

  const handleDeleteAlternative = async (altId: number) => {
    try {
      await WorkoutService.deleteSectionExercise(altId);
      setAlternatives(prev => prev.filter(alt => alt.id !== altId));
      toast.success('Alternative exercise deleted');
    } catch (error) {
      console.error('Error deleting alternative:', error);
      toast.error('Failed to delete alternative exercise');
    }
  };

  const filteredExercises = exercises.filter(
    exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Main Exercise Form */}
      <form onSubmit={mainForm.handleSubmit(handleMainExerciseSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {initialData ? 'Edit Exercise' : 'Add Main Exercise'}
            </CardTitle>
            <CardDescription>
              {initialData
                ? 'Update the exercise details'
                : 'First, add the main exercise. You can add alternatives after saving.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exercise Selection */}
            <div className="space-y-2">
              <Label>Search Exercises</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise_id">Select Exercise</Label>
              <Select
                value={mainForm.watch('exercise_id')?.toString()}
                onValueChange={value =>
                  mainForm.setValue('exercise_id', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exercise" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredExercises.map(exercise => (
                    <SelectItem
                      key={exercise.id}
                      value={exercise.id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <span>{exercise.name}</span>
                        {exercise.video_url && (
                          <PlayCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        {exercise.thumbnail_url && (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mainForm.formState.errors.exercise_id && (
                <p className="text-sm text-red-600">
                  {mainForm.formState.errors.exercise_id.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateExercise(!showCreateExercise)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Exercise
              </Button>
            </div>

            {showCreateExercise && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Exercise Name</Label>
                    <Input
                      placeholder="Enter exercise name"
                      value={newExerciseName}
                      onChange={e => setNewExerciseName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter exercise description"
                      value={newExerciseDescription}
                      onChange={e => setNewExerciseDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleCreateNewExercise}>
                      Create Exercise
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateExercise(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exercise_order">Exercise Order</Label>
                <Input
                  id="exercise_order"
                  type="number"
                  min="1"
                  {...mainForm.register('exercise_order', {
                    valueAsNumber: true,
                  })}
                />
                {mainForm.formState.errors.exercise_order && (
                  <p className="text-sm text-red-600">
                    {mainForm.formState.errors.exercise_order.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment_id">Equipment (Optional)</Label>
                <Select
                  value={mainForm.watch('equipment_id')?.toString() || 'none'}
                  onValueChange={value =>
                    mainForm.setValue(
                      'equipment_id',
                      value === 'none' ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No equipment</SelectItem>
                    {equipment.map(item => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateEquipment(!showCreateEquipment)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equipment
                  </Button>
                </div>

                {showCreateEquipment && (
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label>Equipment Name</Label>
                        <Input
                          placeholder="Enter equipment name"
                          value={newEquipmentName}
                          onChange={e => setNewEquipmentName(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleCreateNewEquipment}
                        >
                          Create Equipment
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateEquipment(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  placeholder="Number of sets"
                  {...mainForm.register('sets', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  placeholder="e.g., 8-12, AMRAP"
                  {...mainForm.register('reps')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  min="0"
                  placeholder="Exercise duration"
                  {...mainForm.register('duration_seconds', {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rest_time_seconds">Rest Time (seconds)</Label>
                <Input
                  id="rest_time_seconds"
                  type="number"
                  min="0"
                  placeholder="Rest after exercise"
                  {...mainForm.register('rest_time_seconds', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions or modifications"
                {...mainForm.register('notes')}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading}>
                {loading
                  ? initialData
                    ? 'Updating Exercise...'
                    : 'Creating Exercise...'
                  : initialData
                    ? 'Update Exercise'
                    : 'Create Exercise'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Alternative Exercises Section - Only show after main exercise is saved */}
      {isMainExerciseSaved && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-orange-600">⚡</span>
                  Alternative Exercises
                </CardTitle>
                <CardDescription>
                  Add alternative exercises for different skill levels or
                  equipment options
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAlternativeForm(true)}
                disabled={showAlternativeForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Alternative
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Existing Alternatives List */}
            {alternatives.length > 0 && (
              <div className="space-y-3 mb-4">
                {alternatives.map((alt, index) => (
                  <Card
                    key={alt.id}
                    className="border-l-4 border-l-orange-500 bg-orange-50/50"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-orange-900">
                            Alternative {index + 1}: {alt.exercise.name}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {alt.sets && `${alt.sets} sets`}
                            {alt.reps && ` × ${alt.reps}`}
                            {alt.duration_seconds &&
                              ` • ${alt.duration_seconds}s`}
                            {alt.notes && ` • ${alt.notes}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlternative(alt.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Alternative Form */}
            {showAlternativeForm && (
              <form onSubmit={altForm.handleSubmit(handleAddAlternative)}>
                <Card className="border-dashed border-2 border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-orange-900">
                        Add New Alternative
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAlternativeForm(false)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Exercise</Label>
                        <Select
                          value={altForm.watch('exercise_id')?.toString() || ''}
                          onValueChange={value =>
                            altForm.setValue('exercise_id', parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose alternative exercise" />
                          </SelectTrigger>
                          <SelectContent className="max-h-40">
                            {exercises.map(exercise => (
                              <SelectItem
                                key={exercise.id}
                                value={exercise.id.toString()}
                              >
                                {exercise.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {altForm.formState.errors.exercise_id && (
                          <p className="text-sm text-red-600">
                            {altForm.formState.errors.exercise_id.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Equipment (Optional)</Label>
                        <Select
                          value={
                            altForm.watch('equipment_id')?.toString() || 'none'
                          }
                          onValueChange={value =>
                            altForm.setValue(
                              'equipment_id',
                              value === 'none' ? undefined : parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No equipment</SelectItem>
                            {equipment.map(item => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Sets</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Sets"
                          {...altForm.register('sets', { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Reps</Label>
                        <Input
                          placeholder="Reps"
                          {...altForm.register('reps')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (s)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Duration"
                          {...altForm.register('duration_seconds', {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rest (s)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Rest"
                          {...altForm.register('rest_time_seconds', {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Alternative exercise notes"
                        {...altForm.register('notes')}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAlternativeForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={alternativeLoading}>
                        {alternativeLoading ? 'Adding...' : 'Add Alternative'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}

            {alternatives.length === 0 && !showAlternativeForm && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No alternative exercises added yet</p>
                <p className="text-sm">
                  Click "Add Alternative" to provide exercise options
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final Actions */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
