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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Trash2, Search, PlayCircle, ImageIcon } from 'lucide-react';
import {
  SectionExercise,
  Exercise,
  Equipment,
  WorkoutService,
} from '@/lib/data/workouts';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const exerciseFormSchema = z.object({
  exercise_id: z.number().min(1, 'Please select an exercise'),
  exercise_order: z.number().min(1, 'Exercise order must be at least 1'),
  equipment_id: z.number().optional(),
  reps: z.string().optional(),
  duration_seconds: z.number().min(0).optional(),
  sets: z.number().min(1).optional(),
  rest_time_seconds: z.number().min(0).optional(),
  notes: z.string().optional(),
  alternatives: z.array(
    z.object({
      exercise_id: z.number().min(1, 'Please select an exercise'),
      reps: z.string().optional(),
      duration_seconds: z.number().min(0).optional(),
      sets: z.number().min(1).optional(),
      rest_time_seconds: z.number().min(0).optional(),
      notes: z.string().optional(),
    })
  ),
});

type ExerciseFormData = z.infer<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  onSubmit: (data: Omit<SectionExercise, 'id' | 'created_at'>) => void;
  sectionId: number;
  existingExercises: any[];
}

export function ExerciseForm({
  onSubmit,
  sectionId,
  existingExercises,
}: ExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      exercise_order:
        Math.max(...existingExercises.map(e => e.exercise_order), 0) + 1,
      sets: 1,
      rest_time_seconds: 0,
      duration_seconds: 0,
      alternatives: [],
    },
  });

  const {
    fields: alternatives,
    append: addAlternative,
    remove: removeAlternative,
  } = useFieldArray({
    control,
    name: 'alternatives',
  });

  useEffect(() => {
    loadExercises();
    loadEquipment();
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
      setValue('exercise_id', newExercise.id);
      setShowCreateExercise(false);
      setNewExerciseName('');
      setNewExerciseDescription('');
      toast.success('Exercise created successfully');
    } catch (error) {
      console.error('Error creating exercise:', error);
      toast.error('Failed to create exercise');
    }
  };

  const handleFormSubmit = async (data: ExerciseFormData) => {
    setLoading(true);
    try {
      await onSubmit({
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
        alternatives: data.alternatives,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(
    exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Selection</CardTitle>
          <CardDescription>
            Choose the main exercise for this section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              value={watch('exercise_id')?.toString()}
              onValueChange={value => setValue('exercise_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an exercise" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredExercises.map(exercise => (
                  <SelectItem key={exercise.id} value={exercise.id.toString()}>
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
            {errors.exercise_id && (
              <p className="text-sm text-red-600">
                {errors.exercise_id.message}
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
        </CardContent>
      </Card>

      {/* Exercise Details */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise_order">Exercise Order</Label>
              <Input
                id="exercise_order"
                type="number"
                min="1"
                {...register('exercise_order', { valueAsNumber: true })}
              />
              {errors.exercise_order && (
                <p className="text-sm text-red-600">
                  {errors.exercise_order.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_id">Equipment (Optional)</Label>
              <Select
                value={watch('equipment_id')?.toString() || ''}
                onValueChange={value =>
                  setValue('equipment_id', value ? parseInt(value) : undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No equipment</SelectItem>
                  {equipment.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {...register('sets', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                placeholder="e.g., 8-12, AMRAP"
                {...register('reps')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_seconds">Duration (seconds)</Label>
              <Input
                id="duration_seconds"
                type="number"
                min="0"
                placeholder="Exercise duration"
                {...register('duration_seconds', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rest_time_seconds">Rest Time (seconds)</Label>
              <Input
                id="rest_time_seconds"
                type="number"
                min="0"
                placeholder="Rest after exercise"
                {...register('rest_time_seconds', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Special instructions or modifications"
              {...register('notes')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alternative Exercises */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alternative Exercises</CardTitle>
              <CardDescription>
                Provide alternative exercises for different skill levels or
                equipment
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addAlternative({
                  exercise_id: 0,
                  reps: '',
                  sets: 1,
                  duration_seconds: 0,
                  rest_time_seconds: 0,
                  notes: '',
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Alternative
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alternatives.length > 0 ? (
            <div className="space-y-4">
              {alternatives.map((field, index) => (
                <Card key={field.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Alternative {index + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlternative(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-2">
                      <Label>Exercise</Label>
                      <Select
                        value={
                          watch(
                            `alternatives.${index}.exercise_id`
                          )?.toString() || ''
                        }
                        onValueChange={value =>
                          setValue(
                            `alternatives.${index}.exercise_id`,
                            parseInt(value)
                          )
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
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Sets</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Sets"
                          {...register(`alternatives.${index}.sets`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Reps</Label>
                        <Input
                          placeholder="Reps"
                          {...register(`alternatives.${index}.reps`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (s)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Duration"
                          {...register(
                            `alternatives.${index}.duration_seconds`,
                            { valueAsNumber: true }
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rest (s)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Rest"
                          {...register(
                            `alternatives.${index}.rest_time_seconds`,
                            { valueAsNumber: true }
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Alternative exercise notes"
                        {...register(`alternatives.${index}.notes`)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No alternative exercises added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding Exercise...' : 'Add Exercise'}
        </Button>
      </div>
    </form>
  );
}
