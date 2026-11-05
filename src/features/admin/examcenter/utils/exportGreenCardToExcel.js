export const exportGreenCardToExcel = async (serverUrl) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${serverUrl}/api/admitcards/export-excel`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Export failed');

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `admit-cards-${new Date().toISOString().slice(0, 10)}.xlsx`;

    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(error?.message || 'Failed to download admit cards Excel.');
  }
};
