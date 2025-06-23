import { FileText, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FilePreview({
  file,
  onRemove,
  isLoading,
}: {
  file: File | null
  onRemove(): void
  isLoading: boolean
}) {
  if (!file || isLoading) return null
  return (
    <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md border border-slate-200 mt-4">
      <div className="flex items-center ">
        <FileText className="w-6 h-6 text-blue-600 mr-3 shrink-0" />
        <span className="text-sm text-slate-700 truncate" title={file.name}>
          {file.name}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove} title="Quitar archivo">
        <XCircle className="w-5 h-5 text-slate-500 hover:text-red-500" />
      </Button>
    </div>
  )
}
