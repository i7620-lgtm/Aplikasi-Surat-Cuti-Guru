
export interface SyncResponse {
  status: 'success' | 'error';
  message?: string;
  profiles?: any[];
  history?: any;
}

// Timeout 15 detik untuk mencegah loading selamanya
const FETCH_TIMEOUT = 15000;

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const syncToCloud = async (url: string, token: string, profiles: any, history: any, userEmail?: string): Promise<SyncResponse> => {
  try {
    const profilesArray = Object.values(profiles);
    const historyArray: any[] = [];
    Object.entries(history).forEach(([nip, entries]: [string, any]) => {
      if (Array.isArray(entries)) {
          entries.forEach((e: any) => historyArray.push({ ...e, nip_owner: nip }));
      }
    });

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify({
        action: 'syncAll',
        token,
        email: userEmail, // Email pengirim untuk log, tapi data dikirim semua
        profiles: profilesArray,
        history: historyArray
      })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Sync Error:", error);
    // Return error tapi jangan throw agar UI bisa handle gracefully
    return { status: 'error', message: (error as Error).message || 'Timeout or Network Error' };
  }
};

export const fetchFromCloud = async (url: string, token: string, userEmail?: string): Promise<SyncResponse> => {
  try {
    // Mengirim email kosong atau khusus agar GAS mengembalikan SEMUA data
    const response = await fetchWithTimeout(`${url}?action=fetchAll&token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ 
        action: 'fetchAll', 
        token,
        email: '' // Kosongkan email agar script GAS (jika disesuaikan) mengembalikan semua data global
      })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return { status: 'error', message: (error as Error).message || 'Timeout or Network Error' };
  }
};
