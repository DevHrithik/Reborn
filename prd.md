# REBORN Fitness App - Admin Panel Documentation

## Overview

This documentation provides comprehensive information about the REBORN fitness app architecture to guide the development of a centralized admin panel. The app is built with React Native + Expo and uses Supabase as the backend database.

## Tech Stack

- **Frontend (Mobile App)**: React Native + Expo Router
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **Charts**: React Native Chart Kit
- **State Management**: React Context API
- **File Uploads**: Supabase Storage
- **Real-time**: Supabase Real-time subscriptions

## Database Schema Overview

### Core Tables

#### 1. User Management

```sql
-- Main users table (extends Supabase auth.users)
users: {
  id: string (UUID, references auth.users)
  email: string
  full_name: string | null
  avatar_url: string | null
  user_role: string | null
  fitness_level: string | null (beginner, intermediate, advanced)
  fitness_goals: string[] | null
  date_of_birth: string | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: string | null
  age: number | null
  location: string | null
  gender: string | null
  is_active: boolean | null
  last_login_at: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

#### 2. Workout System

```sql
-- Workout plans (main workout programs)
plans: {
  id: number
  name: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  focus: 'Fat Burning' | 'Muscle Building' | 'Combo Plan' | 'General'
  description: string | null
  created_at: timestamp
}

-- Individual workout days
workout_days: {
  id: number
  plan_id: number (references plans)
  week_number: number
  day_number: number
  name: string
  duration_est: string | null
  created_at: timestamp
}

-- Workout sections (warm-up, main workout, etc.)
day_sections: {
  id: number
  workout_day_id: number (references workout_days)
  name: 'Warm-up' | 'Main Workout' | 'Recovery' | 'Cooldown'
  section_order: number
  rounds: number
  rest_between_rounds_seconds: number | null
  created_at: timestamp
}

-- Individual exercises within sections
section_exercises: {
  id: number
  day_section_id: number (references day_sections)
  exercise_id: number (references exercises)
  exercise_order: number
  sets: number | null
  reps: string | null
  duration_seconds: number | null
  rest_time_seconds: number | null
  equipment_id: number | null (references equipment)
  notes: string | null
  parent_section_exercise_id: number | null (for alternatives)
  created_at: timestamp
}

-- Exercise library
exercises: {
  id: number
  name: string
  description: string | null
  video_url: string | null
  created_at: timestamp
}

-- Equipment types
equipment: {
  id: number
  name: string
  created_at: timestamp
}

-- User's active workout plans
user_plans: {
  id: number
  user_id: string (references users)
  plan_id: number (references plans)
  current_week: number
  current_day: number
  start_date: string
  is_active: boolean
  created_at: timestamp
}

-- Exercise performance tracking
exercise_performances: {
  id: number
  user_id: string | null (references users)
  exercise_id: number | null (references exercises)
  workout_day_id: number | null (references workout_days)
  set_number: number
  reps: number | null
  weight: number | null
  duration_seconds: number | null
  notes: string | null
  performed_at: string | null
  created_at: timestamp
}
```

#### 3. Nutrition System

```sql
-- Food database
foods: {
  id: number
  name: string
  category: 'Meat & Poultry' | 'Eggs' | 'Vegetables' | 'Whole Grains' | 'Legumes' | 'Nuts & Seeds' | 'Plant Oils' | 'Fruits'
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g: number | null
  sodium_per_100g: number | null
  sugar_per_100g: number | null
  is_starchy_vegetable: boolean | null
  meal_types: string[] | null
  restrictions: Json | null
  created_at: timestamp
}

-- Meal plan templates
meal_plan_templates: {
  id: number
  name: string
  plan_type: 'Cutting' | 'Maintaining' | 'Bulking'
  description: string | null
  target_calories: number
  target_protein_grams: number
  target_carbs_grams: number
  target_fat_grams: number
  created_at: timestamp
}

-- User's meal plans
user_meal_plans: {
  id: number
  user_id: string | null (references users)
  template_id: number | null (references meal_plan_templates)
  plan_type: 'Cutting' | 'Maintaining' | 'Bulking'
  target_calories: number
  target_protein_grams: number
  target_carbs_grams: number
  target_fat_grams: number
  is_active: boolean | null
  created_at: timestamp
  updated_at: timestamp
}

-- Daily meal tracking
user_daily_meals: {
  id: number
  user_id: string | null (references users)
  meal_plan_id: number | null (references user_meal_plans)
  meal_date: string
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  total_calories: number | null
  total_protein: number | null
  total_carbs: number | null
  total_fat: number | null
  is_saved: boolean | null
  created_at: timestamp
  updated_at: timestamp
}

-- Food selections within meals
meal_food_selections: {
  id: number
  daily_meal_id: number | null (references user_daily_meals)
  food_id: number | null (references foods)
  portion_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  created_at: timestamp
}
```

#### 4. Community System

```sql
-- Community posts
community_posts: {
  id: number
  user_id: string (references users)
  content: string
  post_type: 'milestone' | 'tip' | 'celebration' | 'question' | 'sharing'
  image_url: string | null
  created_at: timestamp
  updated_at: timestamp
}

-- Post likes
community_likes: {
  id: number
  user_id: string (references users)
  post_id: number (references community_posts)
  created_at: timestamp
}

-- Post comments
community_comments: {
  id: number
  user_id: string (references users)
  post_id: number (references community_posts)
  content: string
  created_at: timestamp
  updated_at: timestamp
}
```

#### 5. Support System

Based on the support service code, the support system includes:

```sql
-- Support chat sessions (inferred from code)
support_chat_sessions: {
  id: number
  user_id: string (references users)
  subject: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_agent_id: string | null
  created_at: timestamp
  updated_at: timestamp
  last_message_at: timestamp
}

-- Support chat messages (inferred from code)
support_chat_messages: {
  id: number
  session_id: number (references support_chat_sessions)
  sender_id: string
  message_text: string
  is_agent_message: boolean
  attachments: string[] | null
  created_at: timestamp
  updated_at: timestamp
}
```

## App Features & Functionality

### 1. Authentication System

- **Location**: `src/lib/AuthContext.tsx`, `src/lib/supabase.ts`
- **Features**:
  - User registration with profile data (name, age, location, gender)
  - Email/password authentication via Supabase Auth
  - User profile management
  - Password reset functionality
  - Session management with AsyncStorage

### 2. Dashboard System

- **Location**: `src/app/(tabs)/dashboard.tsx`
- **Features**:
  - Active workout plan display
  - Progress tracking (completed workouts, current week/day)
  - Next workout preview
  - User statistics (workouts this week, current streak)
  - Progress charts using React Native Chart Kit

### 3. Workout Management

- **Location**: `src/services/workoutService.ts`, `src/app/workout-plans/`
- **Features**:
  - Hierarchical workout structure (Plans → Weeks → Days → Sections → Exercises)
  - Exercise alternatives for each movement
  - Performance tracking (sets, reps, weight, duration)
  - Progress monitoring and analytics
  - Equipment requirements tracking
  - Video demonstrations for exercises

### 4. Meal Planning System

- **Location**: `src/services/mealService.ts`, `src/app/(tabs)/mealPlans.tsx`
- **Features**:
  - Comprehensive food database with nutritional information
  - Pre-built meal plan templates (Cutting, Maintaining, Bulking)
  - Daily meal tracking (Breakfast, Lunch, Dinner, Snacks)
  - Real-time macro calculation
  - Food category organization
  - Recipe system with instructions and ingredients

### 5. Community Features

- **Location**: `src/services/communityService.ts`, `src/app/(tabs)/community.tsx`
- **Features**:
  - Social posts with different types (milestone, tip, celebration, question, sharing)
  - Image uploads via Supabase Storage
  - Like and comment system
  - Post filtering by type
  - Community statistics
  - Real-time updates

### 6. Support System

- **Location**: `src/services/supportService.ts`, `src/app/(modals)/support.tsx`
- **Features**:
  - FAQ system with categorized questions
  - Live chat with support agents
  - Chat session management
  - Real-time messaging via Supabase subscriptions
  - Priority-based ticket system

### 7. Profile Management

- **Location**: `src/app/(tabs)/profile.tsx`
- **Features**:
  - User profile editing
  - Fitness goals and preferences
  - Account settings
  - Avatar upload
  - Account deletion

## API Services Structure

### Workout Service (`src/services/workoutService.ts`)

- `getWorkoutPlans()` - Fetch all workout plans
- `getWorkoutDays(planId, weekNumber)` - Get workout days for a plan/week
- `getDayWorkouts(workoutDayId)` - Get exercises for a specific day
- `recordExercisePerformance()` - Save user's exercise performance
- `getExercisePerformanceHistory()` - Get user's performance history
- `updateUserProgress()` - Update user's current week/day

### Meal Service (`src/services/mealService.ts`)

- `getAllFoods()` - Get food database
- `getFoodsByCategory()` - Filter foods by category
- `getMealPlanTemplates()` - Get meal plan templates
- `createUserMealPlan()` - Create user's meal plan
- `addFoodToMeal()` - Add food to daily meal
- `calculateDailyMacros()` - Calculate nutrition totals

### Community Service (`src/services/communityService.ts`)

- `getCommunityPosts()` - Fetch posts with pagination
- `createCommunityPost()` - Create new post
- `togglePostLike()` - Like/unlike posts
- `addPostComment()` - Add comment to post
- `uploadCommunityImage()` - Upload images to Supabase Storage

### Support Service (`src/services/supportService.ts`)

- `createChatSession()` - Start new support chat
- `sendChatMessage()` - Send message in chat
- `getChatMessages()` - Get chat history
- `updateChatSessionStatus()` - Update support ticket status

## Admin Panel Requirements

### 1. User Management

**Features Needed:**

- User list with filters (active/inactive, registration date, fitness level)
- User profile viewer with complete data
- User activity monitoring (last login, workout completion rates)
- User deactivation/reactivation
- User statistics dashboard
- Export user data

**Database Operations:**

```sql
-- Get users with activity stats
SELECT u.*,
  COUNT(ep.id) as total_exercises_completed,
  MAX(ep.performed_at) as last_workout_date,
  COUNT(DISTINCT up.id) as total_plans_started
FROM users u
LEFT JOIN exercise_performances ep ON u.id = ep.user_id
LEFT JOIN user_plans up ON u.id = up.user_id
GROUP BY u.id
```

### 2. Workout Plan Management

**Features Needed:**

- Create/edit/delete workout plans
- Manage workout structure (weeks → days → sections → exercises)
- Exercise library management
- Equipment management
- Video upload/management for exercises
- Bulk import from Excel (code shows Excel import functionality)
- Plan analytics (completion rates, user feedback)

**Key Operations:**

- CRUD operations on plans, workout_days, day_sections, section_exercises
- Exercise alternatives management
- Performance data analysis

### 3. Nutrition Management

**Features Needed:**

- Food database management (add/edit/delete foods)
- Nutritional information management
- Meal plan template creation
- Recipe management with ingredients and instructions
- Food category management
- Bulk import/export of nutrition data

### 4. Community Content Moderation

**Features Needed:**

- View all community posts with filters
- Moderate inappropriate content
- Delete posts/comments
- Ban users from community features
- Community analytics (engagement rates, popular content)
- Image content moderation

**Moderation Operations:**

```sql
-- Get posts requiring moderation
SELECT cp.*, u.full_name, u.email,
  COUNT(cl.id) as likes_count,
  COUNT(cc.id) as comments_count
FROM community_posts cp
JOIN users u ON cp.user_id = u.id
LEFT JOIN community_likes cl ON cp.id = cl.post_id
LEFT JOIN community_comments cc ON cp.id = cc.post_id
WHERE cp.created_at > NOW() - INTERVAL '24 hours'
GROUP BY cp.id, u.full_name, u.email
ORDER BY cp.created_at DESC
```

### 5. Support Management

**Features Needed:**

- Support ticket dashboard
- Chat session management
- Agent assignment system
- Response templates
- Ticket status tracking
- Support analytics (response times, resolution rates)
- FAQ management

### 6. Analytics & Reporting

**Features Needed:**

- User engagement metrics
- Workout completion rates
- Popular exercises/plans
- Community engagement stats
- Support ticket metrics
- Revenue analytics (if applicable)
- Custom report generation

### 7. Content Management

**Features Needed:**

- Exercise video management
- Image moderation and management
- FAQ content editing
- App content updates
- Notification management

## Real-time Features

The app uses Supabase real-time subscriptions for:

- Support chat messages
- Community post updates (likes, comments)
- Live user activity monitoring

## File Storage

Supabase Storage is used for:

- User avatar images
- Community post images
- Exercise demonstration videos
- Recipe images

## Security Considerations

### Current Authentication

- Supabase Auth handles user authentication
- Row-level security (RLS) should be implemented
- User roles system exists (`user_role` field in users table)

### Admin Panel Security

- Implement admin role verification
- Secure API endpoints with proper authorization
- Rate limiting for admin operations
- Audit logging for all admin actions
- Two-factor authentication for admin accounts

## Recommended Admin Panel Tech Stack

**Frontend:**

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui for components
- Recharts for analytics dashboards
- React Hook Form for form management

**Backend:**

- Supabase (same database)
- Edge Functions for admin-specific operations
- Row-level security policies
- Real-time subscriptions for live updates

**Additional Tools:**

- Uploadthing or Supabase Storage for file management
- React Table for data tables
- Date-fns for date manipulation
- Zod for schema validation

## Database Extensions Needed

```sql
-- Add admin-specific tables
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES users(id),
  role TEXT CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  moderator_id UUID REFERENCES admin_users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Priority

1. **Phase 1 - Core Admin Functions**

   - User management
   - Basic content moderation
   - Support ticket management

2. **Phase 2 - Content Management**

   - Workout plan management
   - Exercise library management
   - Nutrition database management

3. **Phase 3 - Advanced Features**

   - Analytics dashboard
   - Advanced moderation tools
   - Automated content management

4. **Phase 4 - Optimization**
   - Performance monitoring
   - Advanced reporting
   - ML-based recommendations

This documentation provides a complete foundation for building a comprehensive admin panel for the REBORN fitness app. The admin panel should maintain the same design principles and user experience standards as the main app while providing powerful management capabilities.
