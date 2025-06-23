// app/components/DropZone.tsx
import { UploadCloud } from "lucide-react"
import { type DragEvent } from "react"

export default function DropZone({
  disabled,
  onDrop,
  onDragOver,
  isLoading,
}: {
  disabled: boolean
  onDrop(e: DragEvent<HTMLDivElement>): void
  onDragOver(e: DragEvent<HTMLDivElement>): void
  isLoading: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
        isLoading
          ? "border-slate-200 bg-slate-50 cursor-not-allowed"
          : "border-slate-300 hover:border-slate-400 cursor-pointer"
      }`}
      onDrop={!disabled ? onDrop : undefined}
      onDragOver={!disabled ? onDragOver : undefined}
    >
      <UploadCloud
        className={`w-16 h-16 mb-3 ${isLoading ? "text-slate-400" : "text-slate-500"}`}
      />
      <p className={`${isLoading ? "text-slate-500" : "text-slate-600"}`}>
        {isLoading ? "Procesando archivo..." : "Arrastra y suelta un archivo Excel aquí"}
      </p>
      <p className={`text-sm ${isLoading ? "text-slate-400" : "text-slate-500"}`}>
        {isLoading ? "Por favor espera." : "o haz clic para seleccionar"}
      </p>
    </div>
  )
}
