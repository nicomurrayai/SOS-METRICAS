"use client";

import { useQuery } from "convex/react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { api } from "../convex/_generated/api";
import {
  normalizeSlotPrizesFromProbabilities,
  normalizeSlotPrizes,
  type SlotPrizeConfig,
} from "./shared/slotConfig";
import Probability from "./Probability";

function getLeadPrizeLabel(lead: {
  prize?: string | null;
  prizeLabel?: string | null;
}) {
  return lead.prizeLabel || lead.prize || "-";
}

function leadMatchesPrize(
  lead: {
    prize?: string | null;
    prizeId?: string | null;
    prizeLabel?: string | null;
  },
  prize: SlotPrizeConfig,
) {
  return (
    lead.prizeId === prize.id ||
    lead.prizeLabel === prize.label ||
    lead.prize === prize.label
  );
}

export default function Home() {
  const leads = useQuery(api.leads.getAllLeads);
  const probabilities = useQuery(api.leads.getProbabilities);
  const prizes =
    probabilities === undefined
      ? normalizeSlotPrizes(null)
      : normalizeSlotPrizesFromProbabilities(probabilities);

  const handleExport = () => {
    if (!leads) return;

    const dataToExport = leads.map((lead) => ({
      Email: lead.email,
      Ganador: lead.isWinner ? "Si" : "No",
      Juego: lead.game || "slotmachine",
      Premio: getLeadPrizeLabel(lead),
      "Fecha de creacion": new Date(
        lead.createdAt ?? lead._creationTime,
      ).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "Leads_SOS_Slot.xlsx");
  };

  if (leads === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  const totalLosers = leads.filter((lead) => lead.isWinner === false).length;
  const totalWinners = leads.filter((lead) => lead.isWinner).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-center text-lg font-light text-gray-900 md:text-left md:text-3xl">
          Panel de configuracion y metricas |{" "}
          <br className="md:hidden" />{" "}
          <strong className="text-lg font-bold md:text-2xl">
            SOS SLOT MACHINE
          </strong>
        </h1>

        <Probability />

        <hr className="my-10 h-4 border-black" />

        <div className="my-4 flex flex-col gap-3 text-sm font-bold text-gray-600 md:flex-row md:items-center md:justify-between md:text-lg">
          <p>
            Total de registrados:{" "}
            <span className="text-gray-900">{leads.length}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <p>
              Total de ganadores:{" "}
              <span className="text-green-600">{totalWinners}</span>
            </p>
            <p>
              Total de perdedores:{" "}
              <span className="text-red-600">{totalLosers}</span>
            </p>
          </div>
        </div>

        <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {prizes.map((prize) => {
            const total = leads.filter((lead) =>
              leadMatchesPrize(lead, prize),
            ).length;

            return (
              <div
                key={prize.id}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <strong className="truncate text-gray-800">
                    {prize.label}
                  </strong>
                  <span className="font-bold text-green-600">{total}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExport}
            className="mb-2 inline-flex items-center gap-2 rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Descargar Excel
            <Download size={15} />
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ganador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Premio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha de creacion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
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
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {lead.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {lead.isWinner ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Si
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {getLeadPrizeLabel(lead)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          lead.createdAt ?? lead._creationTime,
                        ).toLocaleString("es-AR", {
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
