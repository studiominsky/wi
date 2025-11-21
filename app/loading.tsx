import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-[50vh]">
      <CircleNotchIcon className="size-8 animate-spin text-primary" />
    </div>
  );
}
