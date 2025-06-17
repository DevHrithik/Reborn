import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/types/database';

export const createClient = () => createClientComponentClient<Database>();
