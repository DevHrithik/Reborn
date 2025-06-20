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
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, PlayCircle, ImageIcon, Zap, X } from 'lucide-react';
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
  onRefresh?: () => void;
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
      setNewExerciseName('');
      setNewExerciseDescription('');
      setShowCreateExercise(false);
      toast.success('Exercise created successfully');
      onRefresh?.();
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
      mainForm.setValue('equipment_id', newEquipment.id);
      setNewEquipmentName('');
      setShowCreateEquipment(false);
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
        exercise_order: data.exercise_order,
        equipment_id: data.equipment_id || null,
        reps: data.reps || null,
        sets: data.sets || null,
        duration_seconds: data.duration_seconds || null,
        rest_time_seconds: data.rest_time_seconds || null,
        notes: data.notes || null,
        parent_section_exercise_id: null,
      };

      if (initialData) {
        await WorkoutService.updateSectionExercise(
          initialData.id,
          exerciseData
        );
        toast.success('Exercise updated successfully');
        onSubmit(exerciseData);
      } else {
        const created =
          await WorkoutService.createSectionExercise(exerciseData);
        setMainExerciseId(created.id);
        setIsMainExerciseSaved(true);
        toast.success('Exercise created successfully');
        onSubmit(exerciseData);
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Failed to save exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlternative = async (data: AlternativeExerciseData) => {
    if (!mainExerciseId) return;

    setAlternativeLoading(true);
    try {
      const alternativeData = {
        day_section_id: sectionId,
        exercise_id: data.exercise_id,
        exercise_order: 1,
        equipment_id: data.equipment_id || null,
        reps: data.reps || null,
        sets: data.sets || null,
        duration_seconds: data.duration_seconds || null,
        rest_time_seconds: data.rest_time_seconds || null,
        notes: data.notes || null,
        parent_section_exercise_id: mainExerciseId,
      };

      await WorkoutService.createSectionExercise(alternativeData);
      toast.success('Alternative exercise added');
      setShowAlternativeForm(false);
      altForm.reset();
      loadAlternatives();
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
      toast.success('Alternative exercise removed');
      loadAlternatives();
    } catch (error) {
      console.error('Error deleting alternative:', error);
      toast.error('Failed to remove alternative exercise');
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Exercise Form - Ultra Compact */}
      <form onSubmit={mainForm.handleSubmit(handleMainExerciseSubmit)}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">
                  {initialData ? 'Edit Exercise' : 'Add Exercise'}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs h-5">
                #{mainForm.watch('exercise_order')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {/* Row 1: Exercise Selection */}
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <Label className="text-xs mb-1 block">Exercise</Label>
                <Select
                  value={mainForm.watch('exercise_id')?.toString()}
                  onValueChange={value =>
                    mainForm.setValue('exercise_id', parseInt(value))
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Choose exercise" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[160px]">
                    {exercises.map(exercise => (
                      <SelectItem
                        key={exercise.id}
                        value={exercise.id.toString()}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="flex-1 truncate text-xs">
                            {exercise.name}
                          </span>
                          {exercise.video_url && (
                            <PlayCircle className="h-3 w-3 text-green-600" />
                          )}
                          {exercise.thumbnail_url && (
                            <ImageIcon className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateExercise(!showCreateExercise)}
                  className="h-7 w-full text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </div>

              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Order</Label>
                <Input
                  type="number"
                  min="1"
                  className="h-7 text-center text-xs"
                  {...mainForm.register('exercise_order', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>

            {/* Create Exercise Form */}
            {showCreateExercise && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Quick Create</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateExercise(false)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Exercise name"
                    value={newExerciseName}
                    onChange={e => setNewExerciseName(e.target.value)}
                    className="h-6 text-xs col-span-3"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNewExercise}
                    className="h-6 text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Row 2: Equipment and Parameters */}
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label className="text-xs mb-1 block">Equipment</Label>
                <Select
                  value={mainForm.watch('equipment_id')?.toString() || 'none'}
                  onValueChange={value =>
                    mainForm.setValue(
                      'equipment_id',
                      value === 'none' ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">
                      None
                    </SelectItem>
                    {equipment.map(item => (
                      <SelectItem
                        key={item.id}
                        value={item.id.toString()}
                        className="text-xs"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Sets</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="3"
                  className="h-7 text-center text-xs"
                  {...mainForm.register('sets', { valueAsNumber: true })}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Reps</Label>
                <Input
                  placeholder="12"
                  className="h-7 text-center text-xs"
                  {...mainForm.register('reps')}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Duration</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="30"
                  className="h-7 text-center text-xs"
                  {...mainForm.register('duration_seconds', {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs mb-1 block">Rest</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="60"
                  className="h-7 text-center text-xs"
                  {...mainForm.register('rest_time_seconds', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>

            {/* Row 3: Equipment Creation */}
            {showCreateEquipment && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Equipment name"
                    value={newEquipmentName}
                    onChange={e => setNewEquipmentName(e.target.value)}
                    className="h-6 text-xs col-span-2"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNewEquipment}
                    className="h-6 text-xs"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateEquipment(false)}
                    className="h-6 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Row 4: Notes and Actions */}
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-8">
                <Label className="text-xs mb-1 block">Notes</Label>
                <Input
                  placeholder="Special instructions..."
                  className="h-7 text-xs"
                  {...mainForm.register('notes')}
                />
              </div>

              <div className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateEquipment(!showCreateEquipment)}
                  className="h-7 w-full text-xs"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="col-span-2">
                <Button
                  type="submit"
                  disabled={loading}
                  size="sm"
                  className="h-7 w-full text-xs"
                >
                  {loading
                    ? initialData
                      ? 'Update'
                      : 'Create'
                    : initialData
                      ? 'Update'
                      : 'Create'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Alternative Exercises - Ultra Compact */}
      {isMainExerciseSaved && (
        <Card className="border-orange-200">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 text-sm">⚡</span>
                <CardTitle className="text-sm">Alternatives</CardTitle>
                <Badge variant="secondary" className="text-xs h-4">
                  {alternatives.length}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAlternativeForm(true)}
                disabled={showAlternativeForm}
                className="h-6 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Existing Alternatives */}
            {alternatives.length > 0 && (
              <div className="space-y-1 mb-2">
                {alternatives.map((alt, index) => (
                  <div
                    key={alt.id}
                    className="flex items-center justify-between p-1 bg-orange-50 border border-orange-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs px-1 h-4">
                        {index + 1}
                      </Badge>
                      <span className="font-medium truncate text-xs">
                        {alt.exercise.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {alt.sets && `${alt.sets}×`}
                        {alt.reps && `${alt.reps}`}
                        {alt.duration_seconds && ` ${alt.duration_seconds}s`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlternative(alt.id)}
                      className="text-red-600 hover:bg-red-100 h-5 w-5 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Alternative Form */}
            {showAlternativeForm && (
              <form onSubmit={altForm.handleSubmit(handleAddAlternative)}>
                <div className="border-dashed border-orange-300 bg-orange-50/30 rounded p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-orange-900">
                      Add Alternative
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAlternativeForm(false)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={altForm.watch('exercise_id')?.toString() || ''}
                      onValueChange={value =>
                        altForm.setValue('exercise_id', parseInt(value))
                      }
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue placeholder="Exercise" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[100px]">
                        {exercises.map(exercise => (
                          <SelectItem
                            key={exercise.id}
                            value={exercise.id.toString()}
                            className="text-xs"
                          >
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue placeholder="Equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs">
                          None
                        </SelectItem>
                        {equipment.map(item => (
                          <SelectItem
                            key={item.id}
                            value={item.id.toString()}
                            className="text-xs"
                          >
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Sets"
                      className="h-6 text-center text-xs"
                      {...altForm.register('sets', { valueAsNumber: true })}
                    />
                    <Input
                      placeholder="Reps"
                      className="h-6 text-center text-xs"
                      {...altForm.register('reps')}
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Dur"
                      className="h-6 text-center text-xs"
                      {...altForm.register('duration_seconds', {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Rest"
                      className="h-6 text-center text-xs"
                      {...altForm.register('rest_time_seconds', {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      placeholder="Notes"
                      className="h-6 text-xs"
                      {...altForm.register('notes')}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={alternativeLoading}
                      className="h-6 text-xs"
                    >
                      {alternativeLoading ? '...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {alternatives.length === 0 && !showAlternativeForm && (
              <div className="text-center py-2 text-muted-foreground">
                <p className="text-xs">No alternatives</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
            className="text-xs"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
