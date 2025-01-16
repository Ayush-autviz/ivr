import { Maximize2, Minimize2 } from "lucide-react";
import React, { useState } from "react";

interface OptionData {
  strikePrice: number;
  side: "Call" | "Put";
  dfm: number;
  iv: number;
  npc: number;
}

const sampleData: OptionData[] = [
  { strikePrice: 100, side: "Call", dfm: 0.85, iv: 32, npc: 2.5 },
  { strikePrice: 105, side: "Put", dfm: 1.2, iv: 28, npc: 1.8 },
  { strikePrice: 110, side: "Call", dfm: 0.95, iv: 35, npc: 3.2 },
  { strikePrice: 115, side: "Put", dfm: 1.05, iv: 30, npc: 2.2 },
  { strikePrice: 120, side: "Call", dfm: 0.9, iv: 33, npc: 2.8 },
];

const OptionChainTable: React.FC = ({ stock }) => {
  const [isColapsed, setIsColapsed] = useState(false);

  const arr =
    stock?.ivData?.[stock.ivData.length - 1]?.timeframeData?.["1min"] || [];
  const data = stock?.ivData?.[stock.ivData.length - 1]?.optionDataTable?.map(
    (item, index) => {
      const npc = arr?.[index]?.value || "calculating...";
      // Handle undefined gracefully
      return { ...item, npc };
    }
  );

  console.log(data);
  return (
    <div className="container p-4 mt-5  rounded-lg  shadow-sm border border-grey-50">
      <div className="flex justify-between mb-3">
        <p className="text-xl font-bold text-gray-800">Net price table</p>
        <button
          onClick={() => setIsColapsed((s) => !s)}
          className="p-3.5 hover:bg-gray-100 rounded-lg transition-colors bg-[#8192aa29]"
        >
          {isColapsed ? (
            <Maximize2 className="w-4 h-4 text-gray-600" />
          ) : (
            <Minimize2 className="w-4 h-4 text-gray-600" />
          )}

          {/* */}
        </button>
      </div>

      <div
        className={`bg-white shadow-md rounded-lg overflow-hidden ${
          isColapsed ? "hidden" : "block"
        } `}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-500 to-purple-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Strike Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                DFM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                IV%
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                NPC%
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((option, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {option.strikePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      option.side === "Call"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {option.side}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.dfm}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.iv}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.npc}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionChainTable;
