"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Language = {
  id: string;
  name: string;
};

type LanguageSwitcherProps = {
  languages: Language[];
};

export default function LanguageSwitcher({ languages }: LanguageSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langId = e.target.value;
    if (langId) {
      router.push(`/dashboard?lang=${langId}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <select
      id="language"
      value={currentLang}
      onChange={handleChange}
      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
    >
      <option value="">All Languages</option>
      {languages.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
