"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Language = {
  id: string;
  language_name: string;
};

type LanguageSwitcherProps = {
  languages: Language[];
};

export default function LanguageSwitcher({ languages }: LanguageSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") || "all";

  const handleValueChange = (langValue: string) => {
    if (langValue === "all") {
      router.push("/inventory");
    } else {
      router.push(`/inventory?lang=${langValue}`);
    }
  };

  return (
    <Select value={currentLang} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Languages</SelectItem>
        {languages.map((lang) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.language_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
