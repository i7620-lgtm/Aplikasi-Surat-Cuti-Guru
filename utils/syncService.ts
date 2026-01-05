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
      entries.forEach((e: any) => historyArray.push({ ...e, nip_owner: nip }));
    });

    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'syncAll',
        token,
        email: userEmail, // Menambahkan email untuk identifikasi user di GAS
        profiles: profilesArray,
        history: historyArray
      })
    });

    return { status: 'success' };
  } catch (error) {
    return { status: 'error', message: (error as Error).message };
  }
};

export const fetchFromCloud = async (url: string, token: string, userEmail?: string): Promise<SyncResponse> => {
  try {
    const response = await fetch(`${url}?action=fetchAll&token=${token}&email=${userEmail || ''}`, {
      method: 'POST',
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
