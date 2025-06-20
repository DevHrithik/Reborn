'use client';

import { useState } from 'react';
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
import { Plan } from '@/lib/data/workouts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  category: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  focus: z.enum(['General', 'Fat Burning', 'Muscle Building', 'Combo Plan']),
  description: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  initialData?: Plan;
  onSubmit: (data: Omit<Plan, 'id' | 'created_at'>) => void;
}

export function PlanForm({ initialData, onSubmit }: PlanFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          focus: initialData.focus,
          description: initialData.description || '',
        }
      : {
          category: 'Beginner',
          focus: 'General',
        },
  });

  const category = watch('category');

  const handleFormSubmit = async (data: PlanFormData) => {
    setLoading(true);
    try {
      // Convert form data to Plan format
      const planData = {
        ...data,
        description: data.description || null,
      };
      await onSubmit(planData);
    } finally {
      setLoading(false);
    }
  };

  // Define available focus options based on category
  const getFocusOptions = (category: string) => {
    if (category === 'Beginner') {
      return ['General'];
    }
    return ['Fat Burning', 'Muscle Building', 'Combo Plan'];
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            placeholder="Enter plan name"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={value => {
                setValue('category', value as any);
                // Reset focus when category changes
                if (value === 'Beginner') {
                  setValue('focus', 'General');
                } else {
                  setValue('focus', 'Fat Burning');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">Focus</Label>
            <Select
              value={watch('focus')}
              onValueChange={value => setValue('focus', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select focus" />
              </SelectTrigger>
              <SelectContent>
                {getFocusOptions(category).map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.focus && (
              <p className="text-sm text-red-600">{errors.focus.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter plan description"
            rows={3}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
