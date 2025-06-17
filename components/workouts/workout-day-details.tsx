'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Play,
  Image,
  RefreshCcw,
  ArrowLeft,
  Activity,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  WorkoutDay,
  WorkoutService,
  DaySection,
  SectionExercise,
  Exercise,
} from '@/lib/data/workouts';
import { toast } from 'sonner';
import { DaySectionForm } from './day-section-form';
import { ExerciseForm } from './exercise-form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface WorkoutDayDetailsProps {
  workoutDay: WorkoutDay;
  onClose: () => void;
}

export function WorkoutDayDetails({
  workoutDay,
  onClose,
}: WorkoutDayDetailsProps) {
  const [sections, setSections] = useState<DaySection[]>([]);
  const [sectionExercises, setSectionExercises] = useState<
    Record<string, SectionExercise[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [isCreateSectionDialogOpen, setIsCreateSectionDialogOpen] =
    useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<DaySection | null>(null);
  const [selectedSectionForExercise, setSelectedSectionForExercise] =
    useState<DaySection | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadSections();
  }, [workoutDay.id]);

  const loadSections = async () => {
    try {
      const sectionsData = await WorkoutService.getDaySections(workoutDay.id);
      setSections(sectionsData);

      // Load exercises for each section
      const exercisesData: Record<string, SectionExercise[]> = {};
      for (const section of sectionsData) {
        exercisesData[section.id] = await WorkoutService.getSectionExercises(
          section.id
        );
      }
      setSectionExercises(exercisesData);

      // Expand all sections by default
      setExpandedSections(new Set(sectionsData.map(s => s.id)));
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load workout sections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (
    sectionData: Omit<DaySection, 'id' | 'created_at'>
  ) => {
    try {
      await WorkoutService.createDaySection({
        ...sectionData,
        workout_day_id: workoutDay.id,
      });
      toast.success('Section created successfully');
      loadSections();
      setIsCreateSectionDialogOpen(false);
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Failed to create section');
    }
  };

  const handleUpdateSection = async (
    sectionData: Omit<DaySection, 'id' | 'created_at'>
  ) => {
    if (!editingSection) return;

    try {
      await WorkoutService.updateDaySection(editingSection.id, sectionData);
      toast.success('Section updated successfully');
      loadSections();
      setIsEditSectionDialogOpen(false);
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    }
  };

  const handleDeleteSection = async (section: DaySection) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${section.name}" section? This will also delete all exercises in this section.`
      )
    ) {
      return;
    }

    try {
      await WorkoutService.deleteDaySection(section.id);
      toast.success('Section deleted successfully');
      loadSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const handleAddExercise = async (
    exerciseData: Omit<SectionExercise, 'id' | 'created_at'>
  ) => {
    if (!selectedSectionForExercise) return;

    try {
      await WorkoutService.createSectionExercise({
        ...exerciseData,
        day_section_id: selectedSectionForExercise.id,
      });
      toast.success('Exercise added successfully');
      loadSections();
      setIsAddExerciseDialogOpen(false);
      setSelectedSectionForExercise(null);
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast.error('Failed to add exercise');
    }
  };

  const handleDeleteExercise = async (exercise: SectionExercise) => {
    if (!confirm(`Are you sure you want to remove this exercise?`)) {
      return;
    }

    try {
      await WorkoutService.deleteSectionExercise(exercise.id);
      toast.success('Exercise removed successfully');
      loadSections();
    } catch (error) {
      console.error('Error removing exercise:', error);
      toast.error('Failed to remove exercise');
    }
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'Warm-up':
        return '🔥';
      case 'Main Workout':
        return '💪';
      case 'Recovery':
        return '🧘';
      case 'Cooldown':
        return '❄️';
      default:
        return '📋';
    }
  };

  const getSectionColor = (sectionType: string) => {
    switch (sectionType) {
      case 'Warm-up':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Main Workout':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Recovery':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Cooldown':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getTotalExercises = () => {
    return Object.values(sectionExercises).reduce(
      (total, exercises) => total + exercises.length,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading workout details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plan
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {workoutDay.name}
            </h1>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-white">
                Week {workoutDay.week_number}
              </Badge>
              <Badge variant="outline" className="bg-white">
                Day {workoutDay.day_number}
              </Badge>
              {workoutDay.duration_est && (
                <Badge variant="outline" className="bg-white">
                  <Clock className="h-3 w-3 mr-1" />
                  {workoutDay.duration_est}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sections</p>
                <p className="text-xl font-bold text-gray-900">
                  {sections.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Exercises</p>
                <p className="text-xl font-bold text-gray-900">
                  {getTotalExercises()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-bold text-gray-900">
                  {workoutDay.duration_est || 'TBD'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Week</p>
                <p className="text-xl font-bold text-gray-900">
                  {workoutDay.week_number}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Workout Structure
              </h2>
              <p className="text-gray-600">
                Organize exercises into sections for better workout flow
              </p>
            </div>
            <Button
              onClick={() => setIsCreateSectionDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>

        <div className="p-6">
          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections
                .sort((a, b) => a.order_index - b.order_index)
                .map(section => (
                  <Card key={section.id} className="border-0 shadow-sm">
                    <Collapsible
                      open={expandedSections.has(section.id)}
                      onOpenChange={() => toggleSection(section.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">
                                {getSectionIcon(section.section_type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className="text-lg">
                                    {section.name}
                                  </CardTitle>
                                  <Badge
                                    variant="outline"
                                    className={getSectionColor(
                                      section.section_type
                                    )}
                                  >
                                    {section.section_type}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-700"
                                  >
                                    {sectionExercises[section.id]?.length || 0}{' '}
                                    exercises
                                  </Badge>
                                </div>
                                {section.description && (
                                  <CardDescription className="text-sm">
                                    {section.description}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedSectionForExercise(section);
                                  setIsAddExerciseDialogOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Exercise
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditingSection(section);
                                  setIsEditSectionDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteSection(section);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {expandedSections.has(section.id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {sectionExercises[section.id] &&
                          sectionExercises[section.id].length > 0 ? (
                            <div className="space-y-3">
                              {sectionExercises[section.id].map(
                                (exercise, index) => (
                                  <div
                                    key={exercise.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                  >
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-semibold text-blue-600">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                          {exercise.exercise?.name ||
                                            'Unknown Exercise'}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                          {exercise.sets && (
                                            <span className="flex items-center gap-1">
                                              <strong>Sets:</strong>{' '}
                                              {exercise.sets}
                                            </span>
                                          )}
                                          {exercise.reps && (
                                            <span className="flex items-center gap-1">
                                              <strong>Reps:</strong>{' '}
                                              {exercise.reps}
                                            </span>
                                          )}
                                          {exercise.duration && (
                                            <span className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {exercise.duration}
                                            </span>
                                          )}
                                          {exercise.weight && (
                                            <span className="flex items-center gap-1">
                                              <strong>Weight:</strong>{' '}
                                              {exercise.weight}
                                            </span>
                                          )}
                                        </div>
                                        {exercise.notes && (
                                          <p className="text-sm text-gray-600 mt-1 italic">
                                            {exercise.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteExercise(exercise)
                                      }
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                              <div className="text-3xl mb-3">💪</div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                No exercises yet
                              </h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Add exercises to this section to build your
                                workout
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSectionForExercise(section);
                                  setIsAddExerciseDialogOpen(true);
                                }}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add First Exercise
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to structure your workout?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create sections like Warm-up, Main Workout, and Cooldown to
                organize your exercises effectively.
              </p>
              <Button
                onClick={() => setIsCreateSectionDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Section
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        open={isCreateSectionDialogOpen}
        onOpenChange={setIsCreateSectionDialogOpen}
      >
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Add Workout Section</DialogTitle>
            <DialogDescription>
              Create a new section to organize exercises in your workout
            </DialogDescription>
          </DialogHeader>
          <DaySectionForm onSubmit={handleCreateSection} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditSectionDialogOpen}
        onOpenChange={setIsEditSectionDialogOpen}
      >
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Workout Section</DialogTitle>
            <DialogDescription>Update the section details</DialogDescription>
          </DialogHeader>
          {editingSection && (
            <DaySectionForm
              initialData={editingSection}
              onSubmit={handleUpdateSection}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddExerciseDialogOpen}
        onOpenChange={setIsAddExerciseDialogOpen}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>
              Add an exercise to the {selectedSectionForExercise?.name} section
            </DialogDescription>
          </DialogHeader>
          {selectedSectionForExercise && (
            <ExerciseForm onSubmit={handleAddExercise} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
