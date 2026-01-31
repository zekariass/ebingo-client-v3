'use client';

import { userStore } from "@/lib/stores/user-store";
import { supabaseBrowser } from "@/lib/supabase/client";

export function logout() {
  const supabase = supabaseBrowser();
  
  userStore.getState().resetUser();
  return supabase.auth.signOut();
}
