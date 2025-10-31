"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as React from "react";

type Language = {
  id: string;
  language_name: string;
  iso_code: string | null;
};

type LanguageSwitcherProps = {
  languages: Language[];
  currentLangSlug: string;
};

export default function LanguageSwitcher({
  languages,
  currentLangSlug,
}: LanguageSwitcherProps) {
  const router = useRouter();

  const handleValueChange = (isoCode: string) => {
    router.push(`/inventory/${isoCode}`);
  };

  const languagesWithSlug = languages.filter((lang) => lang.iso_code);

  if (languagesWithSlug.length === 0) {
    return null;
  }

  return (
    <Select value={currentLangSlug} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        {languagesWithSlug.map((lang) => (
          <SelectItem key={lang.id} value={lang.iso_code!}>
            {lang.language_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
