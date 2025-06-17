'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkoutDay } from '@/lib/data/workouts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const workoutDaySchema = z.object({
  week_number: z.number().min(1, 'Week number must be at least 1'),
  day_number: z.number().min(1, 'Day number must be at least 1'),
  name: z.string().min(1, 'Workout name is required'),
  duration_est: z.string().optional(),
});

type WorkoutDayFormData = z.infer<typeof workoutDaySchema>;

interface WorkoutDayFormProps {
  initialData?: WorkoutDay;
  onSubmit: (data: Omit<WorkoutDay, 'id' | 'created_at' | 'plan'>) => void;
  defaultWeek?: number;
}

export function WorkoutDayForm({
  initialData,
  onSubmit,
  defaultWeek = 1,
}: WorkoutDayFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutDayFormData>({
    resolver: zodResolver(workoutDaySchema),
    defaultValues: initialData
      ? {
          week_number: initialData.week_number,
          day_number: initialData.day_number,
          name: initialData.name,
          duration_est: initialData.duration_est || '',
        }
      : {
          week_number: defaultWeek,
          day_number: 1,
        },
  });

  const handleFormSubmit = async (data: WorkoutDayFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        plan_id: initialData?.plan_id || 0,
        week_number: data.week_number,
        day_number: data.day_number,
        name: data.name,
        duration_est: data.duration_est || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="week_number">Week Number</Label>
            <Input
              id="week_number"
              type="number"
              min="1"
              placeholder="Week number"
              {...register('week_number', { valueAsNumber: true })}
            />
            {errors.week_number && (
              <p className="text-sm text-red-600">
                {errors.week_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_number">Day Number</Label>
            <Input
              id="day_number"
              type="number"
              min="1"
              placeholder="Day number"
              {...register('day_number', { valueAsNumber: true })}
            />
            {errors.day_number && (
              <p className="text-sm text-red-600">
                {errors.day_number.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Workout Name</Label>
          <Input
            id="name"
            placeholder="e.g., Push Day, Full Body HIIT"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_est">Estimated Duration</Label>
          <Input
            id="duration_est"
            placeholder="e.g., 45-60 minutes"
            {...register('duration_est')}
          />
          {errors.duration_est && (
            <p className="text-sm text-red-600">
              {errors.duration_est.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Day' : 'Create Day'}
        </Button>
      </div>
    </form>
  );
}
