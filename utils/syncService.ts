
export interface SyncResponse {
  status: 'success' | 'error';
  message?: string;
  profiles?: any[];
  history?: any;
}

export const syncToCloud = async (url: string, token: string, profiles: any, history: any, userEmail?: string): Promise<SyncResponse> => {
  try {
    const profilesArray = Object.values(profiles);
    const historyArray: any[] = [];
    Object.entries(history).forEach(([nip, entries]: [string, any]) => {
      // Pastikan entries adalah array sebelum melakukan forEach
      if (Array.isArray(entries)) {
          entries.forEach((e: any) => historyArray.push({ ...e, nip_owner: nip }));
      }
    });

    // PENTING: Menggunakan 'text/plain' agar browser tidak mengirim request OPTIONS (Preflight)
    // yang sering gagal di Google Apps Script Web App.
    // Google Apps Script harus memparse konten ini dengan JSON.parse(e.postData.contents)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify({
        action: 'syncAll',
        token,
        email: userEmail,
        profiles: profilesArray,
        history: historyArray
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Sync Error:", error);
    // Jika fetch gagal (misal network error), return error
    return { status: 'error', message: (error as Error).message };
  }
};

export const fetchFromCloud = async (url: string, token: string, userEmail?: string): Promise<SyncResponse> => {
  try {
    // Menggunakan text/plain untuk konsistensi, meskipun GET/POST query string biasanya aman.
    const response = await fetch(`${url}?action=fetchAll&token=${token}&email=${userEmail || ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        action: 'fetchAll', 
        token,
        email: userEmail 
      })
    });
    return await response.json();
  } catch (error) {
    return { status: 'error', message: (error as Error).message };
  }
};
