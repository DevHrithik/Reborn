'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Dumbbell,
  Users,
  Target,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs,TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { WorkoutService, Plan } from '@/lib/data/workouts';
import { PlanForm } from '@/components/workouts/plan-form';
import { PlanDetails } from '@/components/workouts/plan-details';
import { ExerciseLibrary } from '@/components/workouts/exercise-library';
import { EquipmentLibrary } from '@/components/workouts/equipment-library';

export default function WorkoutsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isExerciseLibraryOpen, setIsExerciseLibraryOpen] = useState(false);
  const [isEquipmentLibraryOpen, setIsEquipmentLibraryOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'category'>('name');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await WorkoutService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (
    planData: Omit<Plan, 'id' | 'created_at'>
  ) => {
    try {
      await WorkoutService.createPlan(planData);
      toast.success('Workout plan created successfully');
      loadPlans();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create workout plan');
    }
  };

  const handleUpdatePlan = async (
    planData: Omit<Plan, 'id' | 'created_at'>
  ) => {
    if (!editingPlan) return;

    try {
      await WorkoutService.updatePlan(editingPlan.id, planData);
      toast.success('Workout plan updated successfully');
      loadPlans();
      setIsEditDialogOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update workout plan');
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (
      !confirm(
        `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await WorkoutService.deletePlan(plan.id);
      toast.success('Workout plan deleted successfully');
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete workout plan');
    }
  };

  const handleViewPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDetailsDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsEditDialogOpen(true);
  };

  const filteredPlans = plans
    .filter(plan => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = (() => {
        switch (activeTab) {
          case 'beginner':
            return plan.category === 'Beginner';
          case 'intermediate':
            return plan.category === 'Intermediate';
          case 'advanced':
            return plan.category === 'Advanced';
          default:
            return true;
        }
      })();

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const getStats = () => {
    return {
      total: plans.length,
      beginner: plans.filter(p => p.category === 'Beginner').length,
      intermediate: plans.filter(p => p.category === 'Intermediate').length,
      advanced: plans.filter(p => p.category === 'Advanced').length,
    };
  };

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

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading workout plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Workout Management
                  </h1>
                  <p className="text-gray-600">
                    Create and manage workout plans for all fitness levels
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setIsExerciseLibraryOpen(true)}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Exercise Library
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEquipmentLibraryOpen(true)}
                className="flex items-center gap-2"
              >
                <Dumbbell className="h-4 w-4" />
                Equipment Library
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create New Plan
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Plans</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <p className="text-sm text-green-600">Beginner</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.beginner}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-lg">💪</span>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Intermediate</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.intermediate}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-lg">🔥</span>
                </div>
                <div>
                  <p className="text-sm text-red-600">Advanced</p>
                  <p className="text-2xl font-bold text-red-700">
                    {stats.advanced}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workout plans..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="created">Sort by Date</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1 bg-gray-50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                All Plans
              </TabsTrigger>
              <TabsTrigger value="beginner" className="flex items-center gap-2">
                <span>🌱</span>
                Beginner
              </TabsTrigger>
              <TabsTrigger
                value="intermediate"
                className="flex items-center gap-2"
              >
                <span>💪</span>
                Intermediate
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <span>🔥</span>
                Advanced
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plans Grid/List */}
        <div className="space-y-6">
          {filteredPlans.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredPlans.map(plan => (
                <Card
                  key={plan.id}
                  className={`transition-all duration-200 border-0 shadow-sm hover:shadow-md cursor-pointer ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                  onClick={() => handleViewPlan(plan)}
                >
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getCategoryIcon(plan.category)}
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                              {plan.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {plan.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getFocusColor(plan.focus)}`}
                              >
                                {plan.focus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {plan.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>8 weeks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{plan.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleEditPlan(plan);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Edit</span>
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeletePlan(plan);
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <span className="sr-only">Delete</span>
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏋️‍♂️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plans.length === 0
                    ? 'No workout plans yet'
                    : 'No plans found'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {plans.length === 0
                    ? 'Get started by creating your first workout plan for your fitness program'
                    : `No plans match your search for "${searchTerm}". Try adjusting your filters.`}
                </p>
                {plans.length === 0 && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Plan
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>Create New Workout Plan</DialogTitle>
            <DialogDescription>
              Design a comprehensive workout plan for your fitness program
            </DialogDescription>
          </DialogHeader>
          <PlanForm onSubmit={handleCreatePlan} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Workout Plan</DialogTitle>
            <DialogDescription>
              Update your workout plan details
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <PlanForm initialData={editingPlan} onSubmit={handleUpdatePlan} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">
                {selectedPlan && getCategoryIcon(selectedPlan.category)}
              </span>
              {selectedPlan?.name}
              <Badge
                variant="outline"
                className={
                  selectedPlan ? getFocusColor(selectedPlan.focus) : ''
                }
              >
                {selectedPlan?.focus}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedPlan?.description}</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <PlanDetails
              plan={selectedPlan}
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isExerciseLibraryOpen}
        onOpenChange={setIsExerciseLibraryOpen}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Exercise Library</DialogTitle>
            <DialogDescription>
              Manage your exercise database with videos and instructions
            </DialogDescription>
          </DialogHeader>
          <ExerciseLibrary />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEquipmentLibraryOpen}
        onOpenChange={setIsEquipmentLibraryOpen}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Equipment Library</DialogTitle>
            <DialogDescription>
              Manage your workout equipment and gear
            </DialogDescription>
          </DialogHeader>
          <EquipmentLibrary />
        </DialogContent>
      </Dialog>
    </div>
  );
}
