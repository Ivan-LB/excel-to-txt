import { CheckCircle2, XCircle, FileText } from "lucide-react"

export default function StatusAlert({
  message,
  isLoading,
  isSuccess,
  hasError,
}: {
  message: string
  isLoading: boolean
  isSuccess: boolean
  hasError: boolean
}) {
  if (isLoading || !message) return null

  let style = "bg-blue-50 border-blue-200 text-blue-700"
  let Icon = FileText

  if (isSuccess) {
    style = "bg-green-50 border-green-200 text-green-700"
    Icon = CheckCircle2
  } else if (hasError) {
    style = "bg-red-50 border-red-200 text-red-700"
    Icon = XCircle
  }

  return (
    <div className={`flex items-center p-3 rounded-md text-sm ${style}`}>
      <Icon className="w-5 h-5 mr-2 shrink-0" />
      {message}
    </div>
  )
}
