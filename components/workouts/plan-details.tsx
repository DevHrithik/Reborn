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
import {
  Plus,
  Calendar,
  Clock,
  Copy,
  Edit,
  Trash2,
  ChevronRight,
  Dumbbell,
  ArrowLeft,
  Users,
  Target,
  Timer,
} from 'lucide-react';
import { Plan, WorkoutService, WorkoutDay } from '@/lib/data/workouts';
import { toast } from 'sonner';
import { WorkoutDayForm } from './workout-day-form';
import { WorkoutDayDetails } from './workout-day-details';

interface PlanDetailsProps {
  plan: Plan;
  onClose: () => void;
}

export function PlanDetails({ plan, onClose }: PlanDetailsProps) {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isCreateDayDialogOpen, setIsCreateDayDialogOpen] = useState(false);
  const [isEditDayDialogOpen, setIsEditDayDialogOpen] = useState(false);
  const [isDayDetailsDialogOpen, setIsDayDetailsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);

  useEffect(() => {
    loadWorkoutDays();
  }, [plan.id]);

  const loadWorkoutDays = async () => {
    try {
      const data = await WorkoutService.getWorkoutDays(plan.id);
      setWorkoutDays(data);
    } catch (error) {
      console.error('Error loading workout days:', error);
      toast.error('Failed to load workout days');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDay = async (
    dayData: Omit<WorkoutDay, 'id' | 'created_at' | 'plan'>
  ) => {
    try {
      await WorkoutService.createWorkoutDay({ ...dayData, plan_id: plan.id });
      toast.success('Workout day created successfully');
      loadWorkoutDays();
      setIsCreateDayDialogOpen(false);
    } catch (error) {
      console.error('Error creating workout day:', error);
      toast.error('Failed to create workout day');
    }
  };

  const handleUpdateDay = async (
    dayData: Omit<WorkoutDay, 'id' | 'created_at' | 'plan'>
  ) => {
    if (!editingDay) return;

    try {
      await WorkoutService.updateWorkoutDay(editingDay.id, dayData);
      toast.success('Workout day updated successfully');
      loadWorkoutDays();
      setIsEditDayDialogOpen(false);
      setEditingDay(null);
    } catch (error) {
      console.error('Error updating workout day:', error);
      toast.error('Failed to update workout day');
    }
  };

  const handleDeleteDay = async (day: WorkoutDay) => {
    if (
      !confirm(
        `Are you sure you want to delete "${day.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await WorkoutService.deleteWorkoutDay(day.id);
      toast.success('Workout day deleted successfully');
      loadWorkoutDays();
    } catch (error) {
      console.error('Error deleting workout day:', error);
      toast.error('Failed to delete workout day');
    }
  };

  const handleDuplicateWeek = async (fromWeek: number) => {
    const toWeek = Math.max(...workoutDays.map(d => d.week_number)) + 1;

    try {
      await WorkoutService.duplicateWeek(plan.id, fromWeek, toWeek);
      toast.success(`Week ${fromWeek} duplicated to Week ${toWeek}`);
      loadWorkoutDays();
    } catch (error) {
      console.error('Error duplicating week:', error);
      toast.error('Failed to duplicate week');
    }
  };

  const handleViewDay = (day: WorkoutDay) => {
    setSelectedDay(day);
    setIsDayDetailsDialogOpen(true);
  };

  const handleEditDay = (day: WorkoutDay) => {
    setEditingDay(day);
    setIsEditDayDialogOpen(true);
  };

  // Group workout days by week
  const weeklyStructure = workoutDays.reduce(
    (acc, day) => {
      if (!acc[day.week_number]) {
        acc[day.week_number] = [];
      }
      acc[day.week_number].push(day);
      return acc;
    },
    {} as Record<number, WorkoutDay[]>
  );

  const weeks = Object.keys(weeklyStructure)
    .map(Number)
    .sort((a, b) => a - b);

  const maxWeeks = Math.max(8, ...weeks);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beginner':
        return '🌱';
      case 'Intermediate':
        return '💪';
      case 'Advanced':
        return '🔥';
      default:
        return '📋';
    }
  };

  const getFocusColor = (focus: string) => {
    switch (focus) {
      case 'Fat Burning':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Muscle Building':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Combo Plan':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'General':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading workout structure...</p>
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
            Back to Plans
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">{getCategoryIcon(plan.category)}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h1>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-white">
                {plan.category}
              </Badge>
              <Badge variant="outline" className={getFocusColor(plan.focus)}>
                {plan.focus}
              </Badge>
            </div>
            {plan.description && (
              <p className="text-gray-600">{plan.description}</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weeks</p>
                <p className="text-xl font-bold text-gray-900">
                  {weeks.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Dumbbell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Workout Days</p>
                <p className="text-xl font-bold text-gray-900">
                  {workoutDays.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-xl font-bold text-gray-900">
                  {plan.category}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Focus</p>
                <p className="text-xl font-bold text-gray-900">{plan.focus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Weekly Structure
              </h2>
              <p className="text-gray-600">
                Organize your workout plan by weeks and days
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDayDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Workout Day
            </Button>
          </div>
        </div>

        {/* Week Selector */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {Array.from({ length: maxWeeks }, (_, i) => i + 1).map(week => (
              <Button
                key={week}
                variant={selectedWeek === week ? 'default' : 'outline'}
                onClick={() => setSelectedWeek(week)}
                className={`flex-shrink-0 ${
                  selectedWeek === week
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                Week {week}
                {weeklyStructure[week] && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-white text-gray-700"
                  >
                    {weeklyStructure[week].length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Selected Week Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Week {selectedWeek} Workouts
              </h3>
              {weeklyStructure[selectedWeek] &&
                weeklyStructure[selectedWeek].length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateWeek(selectedWeek)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate Week
                  </Button>
                )}
            </div>

            {weeklyStructure[selectedWeek] &&
            weeklyStructure[selectedWeek].length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weeklyStructure[selectedWeek]
                  .sort((a, b) => a.day_number - b.day_number)
                  .map(day => (
                    <Card
                      key={day.id}
                      className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm"
                      onClick={() => handleViewDay(day)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Dumbbell className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                                Day {day.day_number}
                              </CardTitle>
                              <CardDescription className="font-medium">
                                {day.name}
                              </CardDescription>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Timer className="h-4 w-4" />
                            <span>
                              {day.duration_est || 'Duration not set'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditDay(day);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteDay(day);
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No workouts for Week {selectedWeek}
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Start building your training plan by adding workout days to
                  this week
                </p>
                <Button
                  onClick={() => setIsCreateDayDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Workout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State for entire plan */}
      {workoutDays.length === 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏋️‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to build your workout plan?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a comprehensive training program by adding workout days,
              exercises, and structure to your plan.
            </p>
            <Button
              onClick={() => setIsCreateDayDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Workout
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog
        open={isCreateDayDialogOpen}
        onOpenChange={setIsCreateDayDialogOpen}
      >
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Add Workout Day</DialogTitle>
            <DialogDescription>
              Create a new workout day for {plan.name}
            </DialogDescription>
          </DialogHeader>
          <WorkoutDayForm
            onSubmit={handleCreateDay}
            defaultWeek={selectedWeek}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDayDialogOpen} onOpenChange={setIsEditDayDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Workout Day</DialogTitle>
            <DialogDescription>
              Update the workout day details
            </DialogDescription>
          </DialogHeader>
          {editingDay && (
            <WorkoutDayForm
              initialData={editingDay}
              onSubmit={handleUpdateDay}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDayDetailsDialogOpen}
        onOpenChange={setIsDayDetailsDialogOpen}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Dumbbell className="h-6 w-6 text-blue-600" />
              {selectedDay?.name}
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Week {selectedDay?.week_number} • Day {selectedDay?.day_number}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Duration: {selectedDay?.duration_est || 'Not specified'}
            </DialogDescription>
          </DialogHeader>
          {selectedDay && (
            <WorkoutDayDetails
              workoutDay={selectedDay}
              onClose={() => setIsDayDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
