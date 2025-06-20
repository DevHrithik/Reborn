'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DaySection } from '@/lib/data/workouts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const daySectionSchema = z.object({
  name: z.string(),
  section_order: z.number().min(1, 'Section order must be at least 1'),
  rounds: z.number().min(1, 'Must have at least 1 round'),
  rest_between_rounds_seconds: z
    .number()
    .min(0, 'Rest time cannot be negative')
    .optional(),
});

type DaySectionFormData = z.infer<typeof daySectionSchema>;

interface DaySectionFormProps {
  initialData?: DaySection;
  onSubmit: (data: Omit<DaySection, 'id' | 'created_at'>) => void;
  existingSections: DaySection[];
}

export function DaySectionForm({
  initialData,
  onSubmit,
  existingSections,
}: DaySectionFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DaySectionFormData>({
    resolver: zodResolver(daySectionSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || 'Warm-up',
          section_order: initialData.section_order,
          rounds: initialData.rounds,
          rest_between_rounds_seconds:
            initialData.rest_between_rounds_seconds || 0,
        }
      : {
          name: 'Warm-up',
          section_order:
            Math.max(...existingSections.map(s => s.section_order), 0) + 1,
          rounds: 1,
          rest_between_rounds_seconds: 0,
        },
  });

  const sectionName = watch('name');

  const handleFormSubmit = async (data: DaySectionFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        workout_day_id: initialData?.workout_day_id || 0,
        name: data.name,
        section_type: data.name,
        section_order: data.section_order,
        order_index: data.section_order,
        rounds: data.rounds,
        rest_between_rounds_seconds: data.rest_between_rounds_seconds || null,
        description: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSectionDescription = (name: string) => {
    switch (name) {
      case 'Warm-up':
        return 'Prepare the body for exercise with light movements and stretches';
      case 'Main Workout':
        return 'The primary exercise portion focusing on strength, endurance, or skills';
      case 'Recovery':
        return 'Active recovery movements between intense exercise sets';
      case 'Cooldown':
        return 'Gradual reduction in intensity to help the body return to rest';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Section Type</Label>
          <Select
            value={sectionName}
            onValueChange={value => setValue('name', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select section type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Warm-up">🔥 Warm-up</SelectItem>
              <SelectItem value="Main Workout">💪 Main Workout</SelectItem>
              <SelectItem value="Recovery">⚡ Recovery</SelectItem>
              <SelectItem value="Cooldown">❄️ Cooldown</SelectItem>
            </SelectContent>
          </Select>
          {sectionName && (
            <p className="text-sm text-muted-foreground">
              {getSectionDescription(sectionName)}
            </p>
          )}
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="section_order">Section Order</Label>
            <Input
              id="section_order"
              type="number"
              min="1"
              placeholder="Order in workout"
              {...register('section_order', { valueAsNumber: true })}
            />
            {errors.section_order && (
              <p className="text-sm text-red-600">
                {errors.section_order.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rounds">Number of Rounds</Label>
            <Input
              id="rounds"
              type="number"
              min="1"
              placeholder="How many rounds"
              {...register('rounds', { valueAsNumber: true })}
            />
            {errors.rounds && (
              <p className="text-sm text-red-600">{errors.rounds.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rest_between_rounds_seconds">
            Rest Between Rounds (seconds)
          </Label>
          <Input
            id="rest_between_rounds_seconds"
            type="number"
            min="0"
            placeholder="Rest time in seconds (0 if no rest)"
            {...register('rest_between_rounds_seconds', {
              valueAsNumber: true,
            })}
          />
          <p className="text-sm text-muted-foreground">
            Leave as 0 if there's no rest needed between rounds
          </p>
          {errors.rest_between_rounds_seconds && (
            <p className="text-sm text-red-600">
              {errors.rest_between_rounds_seconds.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : initialData
              ? 'Update Section'
              : 'Create Section'}
        </Button>
      </div>
    </form>
  );
}
