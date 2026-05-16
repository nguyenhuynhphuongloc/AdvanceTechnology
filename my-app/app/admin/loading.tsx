import { SkeletonBlock } from "@/components/ui/States";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-28" />
        ))}
      </div>
      <SkeletonBlock className="h-96" />
    </div>
  );
}
