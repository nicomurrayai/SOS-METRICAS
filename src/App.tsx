"use client";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";
import * as XLSX from "xlsx"; // Importamos la librería

export default function Home() {
  const leads = useQuery(api.leads.getAllLeads);

  // Función para manejar la exportación
  const handleExport = () => {
    if (!leads) return;

    // 1. Preparamos los datos para que se vean bien en Excel
    // Mapeamos los datos para traducir booleanos y formatear fechas
    const dataToExport = leads.map((lead) => ({
      Email: lead.email,
      Ganador: lead.isWinner ? "Sí" : "No",
      Premio: lead.prize || "-",
      "Fecha de Creación": new Date(lead._creationTime).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    }));

    // 2. Crear una hoja de trabajo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Crear un libro de trabajo (Workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    // 4. Descargar el archivo
    XLSX.writeFile(workbook, "Lista_de_Leads.xlsx");
  };


  if (leads === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  const totalWinners = leads.filter((lead) => lead.isWinner).length;


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* --- CAMBIO AQUÍ: Contenedor Flex para Título y Botón --- */}
        <div className="flex flex-col md:flex-row gap-4 md:gap:0 justify-between items-center mb-6">
          <h1 className="text-lg md:text-3xl font-bold text-gray-900">
            Base de datos - SOS JACKSPOT
          </h1>

          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            {/* Icono de descarga opcional */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar Excel
          </button>
        </div>


        <div className="my-4 flex gap-6 text-sm md:text-lg font-bold text-gray-600">
          <p>
            Total de registrados:{" "}
            <span className="text-gray-900">{leads.length}</span>
          </p>

          <p>
            Total de ganadores:{" "}
            <span className="text-green-600">{totalWinners}</span>
          </p>
        </div>
        {/* -------------------------------------------------------- */}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No hay leads registrados
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lead.isWinner ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.prize || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead._creationTime).toLocaleString("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}