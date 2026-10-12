import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}
