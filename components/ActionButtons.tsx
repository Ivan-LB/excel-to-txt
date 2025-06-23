// components/ActionButtons.tsx
import { Button } from "@/components/ui/button"
import { PlayCircle, Download } from "lucide-react"

export default function ActionButtons({
  onProcess,
  onDownload,
  disableProcess,
  disableDownload,
}: {
  onProcess(): void
  onDownload(): void
  disableProcess: boolean
  disableDownload: boolean
}) {
  return (
    <div className="flex flex-col space-y-4 mt-4">
      <Button
        onClick={onProcess}
        disabled={disableProcess}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <PlayCircle className="mr-2 h-5 w-5" />
        Validar y Procesar Archivo
      </Button>
      <Button
        onClick={onDownload}
        disabled={disableDownload}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <Download className="mr-2 h-5 w-5" />
        Descargar Archivo TXT
      </Button>
    </div>
  )
}
