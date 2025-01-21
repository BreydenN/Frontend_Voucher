"use client"

import * as React from "react"
import axios from "axios"
import { FileUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type ExtractedVoucher = {
  image_url: string
  amount: string
  date: string
  transaction_number: string
}

type Voucher = {
  image: string
  amount: number | string
  date: string
  transactionId: string
}

export default function VoucherManagement() {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [vouchers, setVouchers] = React.useState<Voucher[]>([])
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // Maneja cambios en el input tipo file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setSuccess(false)
      setError(null)

      // Crea una URL de vista previa
      const url = URL.createObjectURL(selected)
      setPreview(url)
    }
  }

  // Limpia la URL de vista previa al desmontar o cambiar de archivo
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  // Envía el archivo al backend y actualiza el estado con los datos extraídos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("image", file) // La clave "image" debe coincidir con tu backend

      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Suponiendo que response.data.data es un arreglo con tus vouchers extraídos
      const extractedData: ExtractedVoucher[] = response.data.data

      // Transformamos los datos para ajustarlos a la forma que usa la tabla
      const newVouchers = extractedData.map((item) => ({
        image: item.image_url,
        amount: parseFloat(item.amount) || item.amount,
        date: item.date,
        transactionId: item.transaction_number,
      }))

      // Agregamos los nuevos vouchers al estado
      setVouchers((prev) => [...prev, ...newVouchers])
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError("Hubo un error al subir o procesar el voucher.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Gestión de Vouchers</h1>

      <div className="grid lg:grid-cols-[30%_70%] gap-8">
        {/* Columna Izquierda - Sección para Subir Voucher */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Subir Voucher</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-32",
                    "border-2 border-dashed rounded-lg",
                    "cursor-pointer transition-colors duration-200",
                    "hover:bg-muted/50",
                    file ? "border-primary" : "border-muted-foreground/25",
                  )}
                >
                  {preview ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp
                        className={cn("h-6 w-6 mb-2", file ? "text-primary" : "text-muted-foreground")}
                      />
                      <p className="mb-2 text-sm text-muted-foreground">Subir archivo</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG hasta 10MB</p>
                    </div>
                  )}
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!file || loading}
                variant={file ? "default" : "outline"}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 animate-bounce" />
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Procesar archivo
                  </span>
                )}
              </Button>
            </form>

            {/* Mensajes de Éxito o Error */}
            {success && (
              <div className="mt-4 p-4 bg-primary/10 text-primary rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                ¡Voucher subido y procesado con éxito!
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10A8 8 0 11.002 10 8 8 0 0118 10zm-4.707-3.293a1 1 0 00-1.414 1.414L13.586 10l-1.707 1.707a1 1 0 001.414 1.414L15 11.414l1.707 1.707a1 1 0 001.414-1.414L16.414 10l1.707-1.707a1 1 0 00-1.414-1.414L15 8.586l-1.707-1.707z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha - Tabla de Vouchers */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Datos Extraídos</h2>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>No. de Transacción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No hay vouchers cargados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vouchers.map((voucher, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div
                            onClick={() => setSelectedImage(voucher.image)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={voucher.image || "/placeholder.svg"}
                              alt={`Voucher ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{voucher.amount}</TableCell>
                        <TableCell>{voucher.date}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {voucher.transactionId}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa de la Imagen */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista Previa del Voucher</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-square">
            {selectedImage && (
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Vista previa del voucher"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
