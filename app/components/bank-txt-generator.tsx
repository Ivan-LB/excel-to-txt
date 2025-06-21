"use client"

import { useState, useCallback, type ChangeEvent, type DragEvent } from "react"
import * as XLSX from "xlsx"
import saveAs from "file-saver"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toaster, toast } from "sonner"
import { UploadCloud, FileText, Loader2, CheckCircle2, XCircle, Download, PlayCircle } from "lucide-react"

interface ExcelRow {
  "Numero de Cuenta": string | number
  Importe: string | number
  Nombre: string
  [key: string]: any
}

export default function BankTxtGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [processedLines, setProcessedLines] = useState<string[]>([])
  const [isFileValidAndProcessed, setIsFileValidAndProcessed] = useState(false)

  const stripAccents = (s: string): string =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")

  const formatLine = (idx: number, acct: string, amt: string, name: string): string => {
    const seq = String(idx + 1).padStart(9, "0")
    const rfcField = "".padEnd(16, " ")
    const typeField = "99"
    const acctRaw = String(acct)
    const acctField = acctRaw.padEnd(20, " ").slice(0, 20)
    const amtRaw = String(amt)
    const amtFloat = Number.parseFloat(amtRaw.replace(",", "."))
    const amtInt = Math.round(amtFloat * 100)
    const amtField = String(amtInt).padStart(15, "0")
    const cleanName = stripAccents(name).toUpperCase()
    const nameField = cleanName.padEnd(40, " ").slice(0, 40)
    return `${seq}${rfcField}${typeField}${acctField}${amtField}${nameField}001001`
  }

  const handleFileSelection = (selectedFile: File | null) => {
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile)
        setStatusMessage("Archivo cargado. Haz clic en 'Validar y Procesar'.")
        setIsFileValidAndProcessed(false)
        setProcessedLines([])
      } else {
        toast.error("Tipo de archivo no válido", {
          description: "Por favor, selecciona un archivo Excel (.xls o .xlsx).",
        })
        setFile(null)
        setStatusMessage("Selecciona un archivo Excel válido.")
        setIsFileValidAndProcessed(false)
      }
    } else {
      setFile(null)
      setStatusMessage("")
      setIsFileValidAndProcessed(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(event.target.files?.[0] || null)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    handleFileSelection(event.dataTransfer.files?.[0] || null)
  }

  const processAndValidateFile = useCallback(async () => {
    if (!file) {
      toast.error("No hay archivo", {
        description: "Por favor, selecciona un archivo primero.",
      })
      return
    }

    setIsLoading(true)
    setStatusMessage("Validando archivo...")
    setIsFileValidAndProcessed(false)
    setProcessedLines([])

    await new Promise((resolve) => setTimeout(resolve, 500))

    const reader = new FileReader()
    reader.onload = async (event) => {
      // No usamos try...catch aquí para evitar el throw, manejaremos errores directamente
      const arrayBuffer = event.target?.result
      if (!arrayBuffer) {
        const errorMsg = "No se pudo leer el archivo. Intenta cargarlo de nuevo."
        setStatusMessage(`Error: ${errorMsg}`)
        toast.error("Error de Lectura", { description: errorMsg })
        setIsLoading(false)
        return
      }

      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        const errorMsg = "El archivo Excel no contiene hojas."
        setStatusMessage(`Error: ${errorMsg}`)
        toast.error("Error de Formato", { description: errorMsg })
        setIsLoading(false)
        return
      }
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

      if (jsonData.length === 0) {
        const errorMsg = "El archivo Excel está vacío o la primera hoja no contiene datos."
        setStatusMessage(`Error: ${errorMsg}`)
        toast.error("Archivo Vacío", { description: errorMsg })
        setIsLoading(false)
        return
      }

      const firstRow = jsonData[0]
      const requiredColumns: (keyof ExcelRow)[] = ["Numero de Cuenta", "Importe", "Nombre"]
      const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

      if (missingColumns.length > 0) {
        const errorMsg = `Columnas requeridas faltantes: ${missingColumns.join(", ")}. Asegúrate de que el archivo Excel las incluya en la primera hoja.`
        setStatusMessage(`Error: ${errorMsg}`)
        toast.error("Columnas Faltantes", { description: errorMsg })
        setIsLoading(false)
        return
      }

      setStatusMessage("Generando líneas de texto...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      const lines: string[] = []
      let rowsWithMissingData = 0
      jsonData.forEach((row, index) => {
        const accountNumber = row["Numero de Cuenta"] ? String(row["Numero de Cuenta"]) : ""
        const amount = row["Importe"] ? String(row["Importe"]) : ""
        const name = row["Nombre"] ? String(row["Nombre"]) : ""

        if (!accountNumber || !amount || !name) {
          rowsWithMissingData++
          console.warn(
            `Fila ${index + 2} (Excel) omitida por datos faltantes en 'Numero de Cuenta', 'Importe' o 'Nombre'.`,
          )
          return
        }
        lines.push(formatLine(index, accountNumber, amount, name))
      })

      if (lines.length === 0) {
        const errorMsg =
          "No se pudieron generar líneas válidas. Verifica que las columnas 'Numero de Cuenta', 'Importe' y 'Nombre' tengan datos en las filas."
        setStatusMessage(`Error: ${errorMsg}`)
        toast.error("Sin Datos Válidos", { description: errorMsg })
        setIsLoading(false)
        return
      }

      let successMessage = `Archivo validado y procesado exitosamente. Se generaron ${lines.length} líneas.`
      if (rowsWithMissingData > 0) {
        successMessage += ` Se omitieron ${rowsWithMissingData} filas por datos faltantes.`
      }

      setProcessedLines(lines)
      setIsFileValidAndProcessed(true)
      setStatusMessage(successMessage)
      toast.success("Procesamiento Exitoso", { description: successMessage })
      setIsLoading(false)
    }

    reader.onerror = () => {
      const errorMsg = "Error crítico al leer el archivo. Intenta cargarlo de nuevo."
      setStatusMessage(`Error: ${errorMsg}`)
      toast.error("Error de Lectura", {
        description: "No se pudo leer el archivo seleccionado. Verifica que no esté corrupto o en uso.",
      })
      setIsLoading(false)
      setIsFileValidAndProcessed(false) // Asegurarse de resetear
    }

    reader.readAsArrayBuffer(file)
  }, [file])

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDownload = () => {
    if (!isFileValidAndProcessed || processedLines.length === 0) {
      toast.error("Sin datos para descargar", {
        description: "Valida y procesa un archivo primero.",
      })
      return
    }
    const textData = processedLines.join("\r\n") + "\r\n"
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" })
    saveAs(blob, `LOTE_BANCARIO_${new Date().toISOString().split("T")[0]}.txt`)
    toast.info("Descarga Iniciada", {
      description: "El archivo TXT se está descargando.",
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <Toaster richColors position="top-right" />
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Generador de TXT Bancario</CardTitle>
          <CardDescription>Sube un archivo Excel (.xls, .xlsx), valídalo y luego descarga el TXT.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${isLoading ? "border-slate-200 bg-slate-50 cursor-not-allowed" : "border-slate-300 hover:border-slate-400 cursor-pointer"}`}
            onDrop={!isLoading ? handleDrop : undefined}
            onDragOver={!isLoading ? handleDragOver : undefined}
            onClick={!isLoading ? () => document.getElementById("fileInput")?.click() : undefined}
          >
            <UploadCloud className={`w-16 h-16 mb-3 ${isLoading ? "text-slate-400" : "text-slate-500"}`} />
            <p className={`${isLoading ? "text-slate-500" : "text-slate-600"}`}>
              {isLoading ? "Procesando archivo..." : "Arrastra y suelta un archivo Excel aquí"}
            </p>
            <p className={`text-sm ${isLoading ? "text-slate-400" : "text-slate-500"}`}>
              {isLoading ? "Por favor espera." : "o haz clic para seleccionar"}
            </p>
            <Input
              id="fileInput"
              type="file"
              className="hidden"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          {file && !isLoading && (
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md border border-slate-200">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-blue-600 mr-3 shrink-0" />
                <span className="text-sm text-slate-700 truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileSelection(null)}
                title="Quitar archivo"
                disabled={isLoading}
              >
                <XCircle className="w-5 h-5 text-slate-500 hover:text-red-500" />
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-blue-600 text-sm">{statusMessage || "Procesando..."}</p>
            </div>
          )}

          {statusMessage && !isLoading && (
            <div
              className={`flex items-center p-3 rounded-md text-sm ${isFileValidAndProcessed ? "bg-green-50 border-green-200 text-green-700" : file && !isFileValidAndProcessed && statusMessage.toLowerCase().includes("error") ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}
            >
              {isFileValidAndProcessed ? (
                <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
              ) : file && !isFileValidAndProcessed && statusMessage.toLowerCase().includes("error") ? (
                <XCircle className="w-5 h-5 mr-2 shrink-0" />
              ) : (
                <FileText className="w-5 h-5 mr-2 shrink-0" />
              )}
              {statusMessage}
            </div>
          )}

          <Button
            onClick={processAndValidateFile}
            disabled={!file || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Validar y Procesar Archivo
          </Button>

          <Button
            onClick={handleDownload}
            disabled={isLoading || !isFileValidAndProcessed || processedLines.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="mr-2 h-5 w-5" />
            Descargar Archivo TXT
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
