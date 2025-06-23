// app/components/BankTxtGenerator.tsx
"use client"

import { Toaster } from "sonner"
import { useFileHandler } from "@/hooks/useFileHandler"
import { useFileProcessor } from "@/hooks/useFileProcessor"
import { useRef } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import DropZone from "@/components/DropZone"
import FilePreview from "@/components/FilePreview"
import StatusAlert from "@/components/StatusAlert"
import ActionButtons from "@/components/ActionButtons"

export default function BankTxtGenerator() {
  const {
    file,
    isLoading,
    statusMessage,
    isFileValidAndProcessed,
    processedLines,

    onFileSelect,
    onFileRemove,
    onDragOver,
    onDrop,

    setStatusMessage,
    setIsLoading,
    setIsFileValidAndProcessed,
    setProcessedLines,
  } = useFileHandler()

  const { processFile, downloadTxt } = useFileProcessor({
    file,
    processedLines,
    setStatusMessage,
    setIsLoading,
    setIsFileValidAndProcessed,
    setProcessedLines,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRemove = () => {
    onFileRemove()
    // esto borra el “valor” del input para que onChange vuelva a saltar
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <Toaster richColors position="top-right" />

      <Card className="w-full max-w-lg shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Generador de TXT Bancario
          </CardTitle>
          <CardDescription>
            Sube un archivo Excel (.xls, .xlsx), valídalo y luego descarga el TXT.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ← DropZone wrapped in label for click-to-select */}
          <label
            htmlFor="fileInput"
            className={isLoading ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <DropZone
              disabled={isLoading}
              onDrop={onDrop}
              onDragOver={onDragOver}
              isLoading={isLoading}
            />
          </label>

          {/* hidden file input */}
          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            className="hidden"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={isLoading}
            onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
          />

          {/* only show once a file is selected */}
          {file && !isLoading && (
            <FilePreview file={file} onRemove={handleRemove} isLoading={isLoading} />
          )}

          {/* status message */}
          {statusMessage && !isLoading && (
            <StatusAlert
              message={statusMessage}
              isLoading={isLoading}
              isSuccess={isFileValidAndProcessed}
              hasError={Boolean(
                file &&
                  !isFileValidAndProcessed &&
                  /error/i.test(statusMessage)
              )}
            />
          )}

          {/* process + download buttons */}
          <ActionButtons
            onProcess={processFile}
            onDownload={downloadTxt}
            disableProcess={!file || isLoading}
            disableDownload={
              isLoading || !isFileValidAndProcessed || processedLines.length === 0
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
