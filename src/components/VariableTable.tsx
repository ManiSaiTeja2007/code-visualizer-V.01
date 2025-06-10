import React, { memo } from "react";
export interface VariableState {
  variable: string;
  iteration: number | string;
  value: any;
}

interface VariableTableProps {
  variableTable: VariableState[];
}

const VariableTable: React.FC<VariableTableProps> = memo(
  ({ variableTable }) => (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Variable Value Flow</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Variable
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Iteration/Call
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {variableTable.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-300 px-4 py-2">
                  {row.variable}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {row.iteration}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
);

export default VariableTable;
