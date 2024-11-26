interface ResultTableProps {
  rows: { number: number; operator: string }[]
  result: number
}

export default function ResultTable({ rows, result }: ResultTableProps) {
  return (
    <table className="w-full border-collapse border border-gray-300 mt-4">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Number</th>
          <th className="border border-gray-300 px-4 py-2">Operator</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className="border border-gray-300 px-4 py-2 text-center">{row.number}</td>
            <td className="border border-gray-300 px-4 py-2 text-center">{row.operator}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={2} className="border border-gray-300 px-4 py-2 text-center font-bold">
            Result: {result}
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

