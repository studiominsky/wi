// app/test-fetch/page.tsx

import { createClient } from "@/lib/supabase/server"; // Adjust this path if you don't use @/ aliases

// This is a Server Component!
export default async function TestFetchPage() {
  const supabase = createClient();

  // Let's fetch the data from the 'languages' table
  const { data, error } = await supabase.from("languages").select();

  if (error) {
    return <p>Could not fetch languages: {error.message}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Language List (from local Supabase!)</h1>

      {/* We'll show the data in a simple list */}
      <ul>
        {data.map((language) => (
          <li key={language.id}>
            {language.name} ({language.iso_code})
          </li>
        ))}
      </ul>

      {/* This is helpful for debugging */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
