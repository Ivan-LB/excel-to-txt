import { useState, type DragEvent } from "react"
import { toast } from "sonner"

export function useFileHandler() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [processedLines, setProcessedLines] = useState<string[]>([])
  const [isFileValidAndProcessed, setIsFileValidAndProcessed] = useState(false)

  const validateFileType = (f: File) =>
    f.type === "application/vnd.ms-excel" ||
    f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

  const handleFileSelection = (selected: File | null) => {
    setProcessedLines([])
    setIsFileValidAndProcessed(false)

    if (!selected) {
      setFile(null)
      setStatusMessage("")
      return
    }

    if (!validateFileType(selected)) {
      toast.error("Tipo de archivo no válido", {
        description: "Por favor, selecciona un archivo Excel (.xls o .xlsx).",
      })
      setFile(null)
      setStatusMessage("Selecciona un archivo Excel válido.")
      return
    }

    setFile(selected)
    setStatusMessage("Archivo cargado. Haz clic en 'Validar y Procesar'.")
  }

  const onFileSelect = (f: File | null) => handleFileSelection(f)
  const onFileRemove = () => handleFileSelection(null)

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelection(e.dataTransfer.files[0] ?? null)
  }

  return {
    file,
    isLoading,
    statusMessage,
    processedLines,
    isFileValidAndProcessed,
    onFileSelect,
    onFileRemove,
    onDragOver,
    onDrop,
    // expose setters for processor
    setIsLoading,
    setStatusMessage,
    setProcessedLines,
    setIsFileValidAndProcessed,
  }
}
