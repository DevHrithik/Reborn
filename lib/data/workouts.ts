import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface Plan {
  id: number;
  name: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: 'General' | 'Fat Burning' | 'Muscle Building' | 'Combo Plan';
  description: string | null;
  created_at: string;
}

export interface WorkoutDay {
  id: number;
  plan_id: number;
  week_number: number;
  day_number: number;
  name: string;
  duration_est: string | null;
  created_at: string;
  plan?: Plan;
}

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface DaySection {
  id: number;
  workout_day_id: number;
  name: 'Warm-up' | 'Main Workout' | 'Recovery' | 'Cooldown';
  section_type: 'Warm-up' | 'Main Workout' | 'Recovery' | 'Cooldown';
  description?: string | null;
  section_order: number;
  order_index: number;
  rounds: number;
  rest_between_rounds_seconds: number | null;
  created_at: string;
}

export interface SectionExercise {
  id: number;
  day_section_id: number;
  exercise_id: number;
  parent_section_exercise_id: number | null;
  exercise_order: number;
  equipment_id: number | null;
  reps: string | null;
  duration_seconds: number | null;
  sets: number | null;
  rest_time_seconds: number | null;
  notes: string | null;
  created_at: string;
  exercise?: Exercise;
  equipment?: Equipment;
  alternatives?: SectionExercise[];
}

export interface Equipment {
  id: number;
  name: string;
  created_at: string;
}

export class WorkoutService {
  // Plan Management
  static async getPlans() {
    const { data, error } = await (supabase as any)
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Plan[];
  }

  static async createPlan(plan: Omit<Plan, 'id' | 'created_at'>) {
    const { data, error } = await (supabase as any)
      .from('plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data as Plan;
  }

  static async updatePlan(id: number, updates: Partial<Plan>) {
    const { data, error } = await (supabase as any)
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Plan;
  }

  static async deletePlan(id: number) {
    const { error } = await (supabase as any)
      .from('plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Workout Day Management
  static async getWorkoutDays(planId: number) {
    const { data, error } = await (supabase as any)
      .from('workout_days')
      .select(
        `
        *,
        plan:plans(*)
      `
      )
      .eq('plan_id', planId)
      .order('week_number')
      .order('day_number');

    if (error) throw error;
    return data as (WorkoutDay & { plan: Plan })[];
  }

  static async createWorkoutDay(day: Omit<WorkoutDay, 'id' | 'created_at'>) {
    const { data, error } = await (supabase as any)
      .from('workout_days')
      .insert(day)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutDay;
  }

  static async updateWorkoutDay(id: number, updates: Partial<WorkoutDay>) {
    const { data, error } = await (supabase as any)
      .from('workout_days')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutDay;
  }

  static async deleteWorkoutDay(id: number) {
    const { error } = await (supabase as any)
      .from('workout_days')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Exercise Management
  static async getExercises() {
    const { data, error } = await (supabase as any)
      .from('exercises')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Exercise[];
  }

  static async createExercise(exercise: Omit<Exercise, 'id' | 'created_at'>) {
    const { data, error } = await (supabase as any)
      .from('exercises')
      .insert(exercise)
      .select()
      .single();

    if (error) throw error;
    return data as Exercise;
  }

  static async updateExercise(id: number, updates: Partial<Exercise>) {
    const { data, error } = await (supabase as any)
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Exercise;
  }

  static async deleteExercise(id: number) {
    const { error } = await (supabase as any)
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Day Section Management
  static async getDaySections(workoutDayId: number) {
    const { data, error } = await (supabase as any)
      .from('day_sections')
      .select('*')
      .eq('workout_day_id', workoutDayId)
      .order('section_order');

    if (error) throw error;
    return data as DaySection[];
  }

  static async createDaySection(
    section: Omit<DaySection, 'id' | 'created_at'>
  ) {
    const { data, error } = await (supabase as any)
      .from('day_sections')
      .insert(section)
      .select()
      .single();

    if (error) throw error;
    return data as DaySection;
  }

  static async updateDaySection(id: number, updates: Partial<DaySection>) {
    const { data, error } = await (supabase as any)
      .from('day_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DaySection;
  }

  static async deleteDaySection(id: number) {
    const { error } = await (supabase as any)
      .from('day_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Section Exercise Management
  static async getSectionExercises(daySectionId: number) {
    const { data, error } = await (supabase as any)
      .from('section_exercises')
      .select(
        `
        *,
        exercise:exercises(*),
        equipment:equipment(*),
        alternatives:section_exercises!parent_section_exercise_id(
          *,
          exercise:exercises(*),
          equipment:equipment(*)
        )
      `
      )
      .eq('day_section_id', daySectionId)
      .is('parent_section_exercise_id', null)
      .order('exercise_order');

    if (error) throw error;
    return data as (SectionExercise & {
      exercise: Exercise;
      equipment?: Equipment;
      alternatives: (SectionExercise & {
        exercise: Exercise;
        equipment?: Equipment;
      })[];
    })[];
  }

  static async createSectionExercise(
    sectionExercise: Omit<SectionExercise, 'id' | 'created_at'>
  ) {
    const { data, error } = await (supabase as any)
      .from('section_exercises')
      .insert(sectionExercise)
      .select()
      .single();

    if (error) throw error;
    return data as SectionExercise;
  }

  static async updateSectionExercise(
    id: number,
    updates: Partial<SectionExercise>
  ) {
    const { data, error } = await (supabase as any)
      .from('section_exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SectionExercise;
  }

  static async deleteSectionExercise(id: number) {
    const { error } = await (supabase as any)
      .from('section_exercises')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Equipment Management
  static async getEquipment() {
    const { data, error } = await (supabase as any)
      .from('equipment')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Equipment[];
  }

  static async createEquipment(
    equipment: Omit<Equipment, 'id' | 'created_at'>
  ) {
    const { data, error } = await (supabase as any)
      .from('equipment')
      .insert(equipment)
      .select()
      .single();

    if (error) throw error;
    return data as Equipment;
  }

  static async updateEquipment(id: number, updates: Partial<Equipment>) {
    const { data, error } = await (supabase as any)
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Equipment;
  }

  static async deleteEquipment(id: number) {
    const { error } = await (supabase as any)
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Bulk Operations
  static async duplicateWeek(planId: number, fromWeek: number, toWeek: number) {
    try {
      // Get all workout days from the source week
      const { data: sourceDays, error: daysError } = await (supabase as any)
        .from('workout_days')
        .select(
          `
          *,
          day_sections (
            *,
            section_exercises (
              *,
              alternatives:section_exercises!parent_section_exercise_id(*)
            )
          )
        `
        )
        .eq('plan_id', planId)
        .eq('week_number', fromWeek);

      if (daysError) throw daysError;
      if (!sourceDays || sourceDays.length === 0) return;

      // Create new days for target week
      for (const sourceDay of sourceDays) {
        const { data: newDay, error: dayError } = await (supabase as any)
          .from('workout_days')
          .insert({
            plan_id: planId,
            week_number: toWeek,
            day_number: sourceDay.day_number,
            name: sourceDay.name,
            duration_est: sourceDay.duration_est,
          })
          .select()
          .single();

        if (dayError) throw dayError;

        // Create sections for the new day
        for (const sourceSection of sourceDay.day_sections || []) {
          const { data: newSection, error: sectionError } = await (
            supabase as any
          )
            .from('day_sections')
            .insert({
              workout_day_id: newDay.id,
              name: sourceSection.name,
              section_order: sourceSection.section_order,
              rounds: sourceSection.rounds,
              rest_between_rounds_seconds:
                sourceSection.rest_between_rounds_seconds,
            })
            .select()
            .single();

          if (sectionError) throw sectionError;

          // Create exercises for the new section
          const exerciseIdMap = new Map();

          for (const sourceExercise of (
            sourceSection.section_exercises || []
          ).filter((e: any) => !e.parent_section_exercise_id)) {
            const { data: newExercise, error: exerciseError } = await (
              supabase as any
            )
              .from('section_exercises')
              .insert({
                day_section_id: newSection.id,
                exercise_id: sourceExercise.exercise_id,
                exercise_order: sourceExercise.exercise_order,
                equipment_id: sourceExercise.equipment_id,
                reps: sourceExercise.reps,
                duration_seconds: sourceExercise.duration_seconds,
                sets: sourceExercise.sets,
                rest_time_seconds: sourceExercise.rest_time_seconds,
                notes: sourceExercise.notes,
              })
              .select()
              .single();

            if (exerciseError) throw exerciseError;

            exerciseIdMap.set(sourceExercise.id, newExercise.id);

            // Create alternatives
            for (const alternative of sourceExercise.alternatives || []) {
              await (supabase as any).from('section_exercises').insert({
                day_section_id: newSection.id,
                exercise_id: alternative.exercise_id,
                parent_section_exercise_id: newExercise.id,
                exercise_order: alternative.exercise_order,
                equipment_id: alternative.equipment_id,
                reps: alternative.reps,
                duration_seconds: alternative.duration_seconds,
                sets: alternative.sets,
                rest_time_seconds: alternative.rest_time_seconds,
                notes: alternative.notes,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error duplicating week:', error);
      throw error;
    }
  }

  static async getWeeklyOverview(planId: number) {
    const { data, error } = await (supabase as any)
      .from('workout_days')
      .select('week_number, day_number, name, duration_est')
      .eq('plan_id', planId)
      .order('week_number')
      .order('day_number');

    if (error) throw error;
    return data;
  }
}
