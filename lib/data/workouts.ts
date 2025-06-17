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
  section_order: number;
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
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('category', { ascending: true })
      .order('focus', { ascending: true });

    if (error) throw error;
    return data as Plan[];
  }

  static async createPlan(plan: Omit<Plan, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data as Plan;
  }

  static async updatePlan(id: number, updates: Partial<Plan>) {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Plan;
  }

  static async deletePlan(id: number) {
    const { error } = await supabase.from('plans').delete().eq('id', id);

    if (error) throw error;
  }

  // Workout Day Management
  static async getWorkoutDays(planId: number) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('workout_days')
      .insert(day)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutDay;
  }

  static async updateWorkoutDay(id: number, updates: Partial<WorkoutDay>) {
    const { data, error } = await supabase
      .from('workout_days')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutDay;
  }

  static async deleteWorkoutDay(id: number) {
    const { error } = await supabase.from('workout_days').delete().eq('id', id);

    if (error) throw error;
  }

  // Exercise Management
  static async getExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Exercise[];
  }

  static async createExercise(exercise: Omit<Exercise, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single();

    if (error) throw error;
    return data as Exercise;
  }

  static async updateExercise(id: number, updates: Partial<Exercise>) {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Exercise;
  }

  static async deleteExercise(id: number) {
    const { error } = await supabase.from('exercises').delete().eq('id', id);

    if (error) throw error;
  }

  // Day Section Management
  static async getDaySections(workoutDayId: number) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('day_sections')
      .insert(section)
      .select()
      .single();

    if (error) throw error;
    return data as DaySection;
  }

  static async updateDaySection(id: number, updates: Partial<DaySection>) {
    const { data, error } = await supabase
      .from('day_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DaySection;
  }

  static async deleteDaySection(id: number) {
    const { error } = await supabase.from('day_sections').delete().eq('id', id);

    if (error) throw error;
  }

  // Section Exercise Management
  static async getSectionExercises(daySectionId: number) {
    const { data, error } = await supabase
      .from('section_exercises')
      .select(
        `
        *,
        exercise:exercises(*),
        alternatives:section_exercises!parent_section_exercise_id(
          *,
          exercise:exercises(*)
        )
      `
      )
      .eq('day_section_id', daySectionId)
      .is('parent_section_exercise_id', null)
      .order('exercise_order');

    if (error) throw error;
    return data as (SectionExercise & {
      exercise: Exercise;
      alternatives: (SectionExercise & { exercise: Exercise })[];
    })[];
  }

  static async createSectionExercise(
    sectionExercise: Omit<SectionExercise, 'id' | 'created_at'>
  ) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('section_exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SectionExercise;
  }

  static async deleteSectionExercise(id: number) {
    const { error } = await supabase
      .from('section_exercises')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Equipment Management
  static async getEquipment() {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Equipment[];
  }

  static async createEquipment(
    equipment: Omit<Equipment, 'id' | 'created_at'>
  ) {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipment)
      .select()
      .single();

    if (error) throw error;
    return data as Equipment;
  }

  // Bulk Operations
  static async duplicateWeek(planId: number, fromWeek: number, toWeek: number) {
    try {
      // Get all workout days from the source week
      const { data: sourceDays, error: daysError } = await supabase
        .from('workout_days')
        .select(
          `
          *,
          day_sections(
            *,
            section_exercises(
              *,
              alternatives:section_exercises!parent_section_exercise_id(*)
            )
          )
        `
        )
        .eq('plan_id', planId)
        .eq('week_number', fromWeek);

      if (daysError) throw daysError;

      // Create new workout days for the target week
      for (const sourceDay of sourceDays) {
        const { data: newDay, error: dayError } = await supabase
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
        for (const sourceSection of sourceDay.day_sections) {
          const { data: newSection, error: sectionError } = await supabase
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

          for (const sourceExercise of sourceSection.section_exercises.filter(
            (e: any) => !e.parent_section_exercise_id
          )) {
            const { data: newExercise, error: exerciseError } = await supabase
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
            for (const alternative of sourceExercise.alternatives) {
              await supabase.from('section_exercises').insert({
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
      throw error;
    }
  }

  static async getWeeklyOverview(planId: number) {
    const { data, error } = await supabase
      .from('workout_days')
      .select('week_number, day_number, name, duration_est')
      .eq('plan_id', planId)
      .order('week_number')
      .order('day_number');

    if (error) throw error;

    const weeks = data.reduce((acc: any, day: any) => {
      if (!acc[day.week_number]) {
        acc[day.week_number] = [];
      }
      acc[day.week_number].push(day);
      return acc;
    }, {});

    return weeks;
  }
}
