"use client";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";
import * as XLSX from "xlsx";
import Probability from "./Probability";
import { Download } from "lucide-react";


export default function Home() {
  const leads = useQuery(api.leads.getAllLeads);

  // Función para manejar la exportación
  const handleExport = () => {
    if (!leads) return;

    // 1. Preparamos los datos para que se vean bien en Excel
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
        <div className="text-xl text-gray-600">Cargando....</div>
      </div>
    );
  }

  const totalWinners = leads.filter((lead) => lead.isWinner).length;
  const totallosers = leads.filter((lead) => lead.isWinner === false).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-lg md:text-3xl text-center md:text-left font-light text-gray-900 mb-6">
          Panel de configuración y metricas | <br className="md:hidden" /> <strong className="font-bold text-lg md:text-2xl">SOS JACKSPOT</strong>
        </h1>
        <Probability />
        <hr className="h-4 border-black my-10" />
        <div className="my-4 flex  items-center justify-between gap-6 text-xs md:text-lg font-bold text-gray-600">
          <p>
            Total de registrados:{" "}
            <span className="text-gray-900">{leads.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <p>
              Total de ganadores:{" "}
              <span className="text-green-600">{totalWinners}</span>
            </p>
            <p>
              Total de perdedores:{" "}
              <span className="text-red-600">{totallosers}</span>
            </p>
          </div>


        </div>
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="mb-2 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Descargar Excel
            <Download size={15} />
          </button>
        </div>
        {/* Tabla de leads */}
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
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
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