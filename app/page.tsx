"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

type VoucherData = {
  image_url: string;
  amount: string;
  date: string;
  transaction_number: string;
};

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<VoucherData[]>([]);
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<"success" | "error" | "">("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      console.error("No se seleccionó ningún archivo.");
    }
  };
  

  const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor selecciona un archivo.");
      setStatus("error");
      return;
    }
  
    const formData = new FormData();
    formData.append("image", file); // La clave debe ser "image", igual que en Postman
  
    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const extractedData = response.data.data; // Datos devueltos por el backend
      setData((prevData) => [...prevData, ...extractedData]); // Agregar a la lista dinámica
      setMessage("¡Voucher subido y procesado con éxito!");
      setStatus("success");
    } catch (error) {
      setMessage("Hubo un error al subir o procesar el voucher.");
      setStatus("error");
    }
  };
  
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Gestión de Vouchers</h1>

      {/* Formulario para subir vouchers */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Subir Voucher</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Input type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} className="bg-blue-500 hover:bg-blue-600 text-white">
              Subir y Procesar
            </Button>
            {status && (
              <Alert variant={status === "success" ? "default" : "destructive"}>
                {message}
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de datos extraídos */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Datos Extraídos</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>No. de Transacción</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.image_url}
                        alt="Voucher"
                        className="w-20 h-20 object-cover"
                      />
                    </TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.transaction_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;