import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database';

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};
