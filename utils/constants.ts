export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const FITNESS_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const POST_TYPES = {
  MILESTONE: 'milestone',
  TIP: 'tip',
  CELEBRATION: 'celebration',
  QUESTION: 'question',
  SHARING: 'sharing',
} as const;

export const SUPPORT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const SUPPORT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const PLAN_CATEGORIES = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export const PLAN_FOCUS = {
  FAT_BURNING: 'Fat Burning',
  MUSCLE_BUILDING: 'Muscle Building',
  COMBO_PLAN: 'Combo Plan',
  GENERAL: 'General',
} as const;

export const MEAL_PLAN_TYPES = {
  CUTTING: 'Cutting',
  MAINTAINING: 'Maintaining',
  BULKING: 'Bulking',
} as const;

export const FOOD_CATEGORIES = {
  MEAT_POULTRY: 'Meat & Poultry',
  EGGS: 'Eggs',
  VEGETABLES: 'Vegetables',
  WHOLE_GRAINS: 'Whole Grains',
  LEGUMES: 'Legumes',
  NUTS_SEEDS: 'Nuts & Seeds',
  PLANT_OILS: 'Plant Oils',
  FRUITS: 'Fruits',
} as const;

export const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACKS: 'Snacks',
} as const;

export const ROUTES = {
  DASHBOARD: '/dashboard',
  USERS: '/users',
  WORKOUTS: '/workouts',
  NUTRITION: '/nutrition',
  COMMUNITY: '/community',
  SUPPORT: '/support',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  AUTH: '/auth',
} as const;
