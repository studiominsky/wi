import { createClient as createNodeClient } from "@supabase/supabase-js";

export const createClient = () => {
  return createNodeClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};
