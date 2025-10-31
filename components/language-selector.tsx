// studiominsky/wi/wi-6490d5e232baaf957c0eb90cafd653377333ef59/components/language-selector.tsx
"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

type UserLanguage = {
  id: string;
  language_name: string;
  iso_code: string | null;
};

interface LanguageSelectorProps {
  userLanguages: UserLanguage[];
  langSlug: string;
}

export function LanguageSelector({
  userLanguages,
  langSlug,
}: LanguageSelectorProps) {
  const router = useRouter();

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = e.target.value;
    router.push(`/inventory/${newSlug}`);
  };

  const languagesWithSlug = userLanguages.filter((lang) => lang.iso_code);

  if (languagesWithSlug.length === 0) {
    return null;
  }

  return (
    <select
      value={langSlug}
      onChange={handleValueChange}
      className="h-9 w-[180px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:border-ring focus:outline-none"
    >
      {languagesWithSlug.map((lang) => (
        <option key={lang.id} value={lang.iso_code!}>
          {lang.language_name}
        </option>
      ))}
    </select>
  );
}
