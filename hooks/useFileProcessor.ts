// app/hooks/useFileProcessor.ts
import * as XLSX from "xlsx"
import { toast } from "sonner"
import saveAs from "file-saver"
import { Dispatch, SetStateAction } from "react"

// Mirror your ExcelRow shape here:
interface ExcelRow {
  "Numero de Cuenta": string | number
  Importe: string | number
  Nombre: string
  [key: string]: any
}

interface Props {
  file: File | null
  processedLines: string[]                                 // ← actual array
  setStatusMessage: Dispatch<SetStateAction<string>>
  setIsLoading: Dispatch<SetStateAction<boolean>>
  setIsFileValidAndProcessed: Dispatch<SetStateAction<boolean>>
  setProcessedLines: Dispatch<SetStateAction<string[]>>
}

export function useFileProcessor({
  file,
  processedLines,
  setStatusMessage,
  setIsLoading,
  setIsFileValidAndProcessed,
  setProcessedLines,
}: Props) {
  // 1) Accent‐strip + uppercase helper
  const stripAccents = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")
      .toUpperCase()

  // 2) Your existing formatter logic
  const formatLine = (idx: number, acct: string, amt: string, name: string): string => {
    const seq       = String(idx + 1).padStart(9, "0")
    const rfcField  = "".padEnd(16, " ")
    const typeField = "99"
    const acctField = acct.padEnd(20, " ").slice(0, 20)
    const amtFloat  = Number.parseFloat(amt.replace(",", "."))
    const amtField  = String(Math.round(amtFloat * 100)).padStart(15, "0")
    const nameField = stripAccents(name).padEnd(40, " ").slice(0, 40)

    return `${seq}${rfcField}${typeField}${acctField}${amtField}${nameField}001001`
  }

  // 3) File‐processing
  const processFile = async () => {
    if (!file) {
      toast.error("No hay archivo", { description: "Selecciona uno primero." })
      return
    }

    setIsLoading(true)
    setIsFileValidAndProcessed(false)
    setProcessedLines([])
    setStatusMessage("Validando archivo...")

    await new Promise((r) => setTimeout(r, 500))
    const reader = new FileReader()

    reader.onload = async (e) => {
      const buf = e.target?.result
      if (!buf) {
        const err = "No se pudo leer el archivo."
        setStatusMessage(`Error: ${err}`)
        toast.error("Error de Lectura", { description: err })
        setIsLoading(false)
        return
      }

      const wb = XLSX.read(buf, { type: "array" })
      const sheetName = wb.SheetNames[0]
      if (!sheetName) {
        const err = "No contiene hojas."
        setStatusMessage(`Error: ${err}`)
        toast.error("Error de Formato", { description: err })
        setIsLoading(false)
        return
      }

      const ws       = wb.Sheets[sheetName]
      const rawRows  = XLSX.utils.sheet_to_json<ExcelRow>(ws)
      if (rawRows.length === 0) {
        const err = "La hoja está vacía."
        setStatusMessage(`Error: ${err}`)
        toast.error("Archivo Vacío", { description: err })
        setIsLoading(false)
        return
      }

      // Required‐column check
      const required = ["Numero de Cuenta", "Importe", "Nombre"] as const
      const missing  = required.filter((c) => !(c in rawRows[0]))
      if (missing.length > 0) {
        const err = `Faltan columnas: ${missing.join(", ")}`
        setStatusMessage(`Error: ${err}`)
        toast.error("Columnas Faltantes", { description: err })
        setIsLoading(false)
        return
      }

      // Build formatted lines
      const lines: string[] = []
      let skipped = 0

      rawRows.forEach((row, idx) => {
        const acct = String(row["Numero de Cuenta"] ?? "")
        const amt  = String(row["Importe"] ?? "")
        const name = String(row["Nombre"] ?? "")

        if (!acct || !amt || !name) {
          skipped++
          console.warn(`Fila ${idx + 2} omitida.`)
          return
        }

        lines.push(formatLine(idx, acct, amt, name))
      })

      if (lines.length === 0) {
        const err = "No se generaron líneas."
        setStatusMessage(`Error: ${err}`)
        toast.error("Sin Datos Válidos", { description: err })
        setIsLoading(false)
        return
      }

      const msg =
        `Procesado: ${lines.length} líneas.` +
        (skipped > 0 ? ` Se omitieron ${skipped} filas.` : "")

      setProcessedLines(lines)
      setIsFileValidAndProcessed(true)
      setStatusMessage(msg)
      toast.success("Procesamiento Exitoso", { description: msg })
      setIsLoading(false)
    }

    reader.onerror = () => {
      const err = "Error crítico de lectura."
      setStatusMessage(`Error: ${err}`)
      toast.error("Error de Lectura", {
        description: "Verifica que no esté corrupto o en uso.",
      })
      setIsLoading(false)
    }

    reader.readAsArrayBuffer(file)
  }

  // 4) Download uses the real array
  const downloadTxt = () => {
    if (processedLines.length === 0) {
      toast.error("Sin datos para descargar", {
        description: "Valida y procesa primero.",
      })
      return
    }
    const txt = processedLines.join("\r\n") + "\r\n"
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
    saveAs(blob, `LOTE_BANCARIO_${new Date().toISOString().slice(0,10)}.txt`)
    toast.info("Descarga iniciada")
  }

  return { processFile, downloadTxt }
}
