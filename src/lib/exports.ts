export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const escaped = String(val ?? "").replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function downloadPDF(title: string, content: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
      h1 { color: #0055ff; border-bottom: 2px solid #0055ff; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 12px; }
      th { background: #f0f4ff; font-weight: 600; }
      tr:nth-child(even) { background: #fafafa; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .school-name { font-size: 18px; font-weight: 700; color: #0055ff; }
      .date { font-size: 11px; color: #666; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <div class="header">
      <div class="school-name">FFB Group of Schools</div>
      <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
    </div>
    <h1>${title}</h1>
    ${content}
    <script>window.onload=function(){window.print();}<\/script>
  </body></html>`);
  printWindow.document.close();
}
