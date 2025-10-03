export default function AdminTable({ columns, data }) {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
            <tr>
                {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 font-medium">{col}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.length > 0 ? (
                data.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                    {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3">{cell}</td>
                    ))}
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                    Không có dữ liệu
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
    );
}