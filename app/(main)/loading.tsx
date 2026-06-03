import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8 text-stone-400" />
        <p className="text-sm text-stone-500">Đang tải...</p>
      </div>
    </div>
  );
}
