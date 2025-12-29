// Untuk mencegah galat "Text length must not exceed 32767 characters" di beberapa lingkungan,
// string base64 dipecah menjadi sangat banyak bagian kecil dan digabungkan kembali saat runtime.

const logoDenpasarParts = [
  'iVBORw0K', 'GgoAAAAN', 'SUhEUgAA', 'ANOEAAAD', 'hCAMAAAA', 'JbSJIAAA', 'AbFBMVEX/', '///AAD/U',
  'QD/RQD7vA', 'D6twD/SQ', 'D/RAD9wQ', 'D4sgD/TQ', 'D3sAD6uQ', 'D8wgD+zA', 'D+xwC4lg', 'D0pgDGnQ',
  'ddsQDizw', 'CvpACMmQ', 'CpowDCmA', 'DXrgDGnA', 'CUjQCcpA', 'DryQCcfg', 'DgzgDNpQ', 'C9lwDQsQ',
  'CGgAB+dQ', 'CQiACqqB', 'CZAAAA/k', 'lEQVR4nO', '3QSQ7CMA', 'wEwYjLCp', 'bi2s7u/U', '81myfXsN',
  'eA0Q4AAA', 'AAAAAAAA', 'AAAAAAAA', 'AAAAAAAA', 'AAAAALjC', '3q592Lp9', 'm2kHMN3y', '+vBvP5h9',
  'hWk38Hj3', '68Pofph9', 'lWk3ME/3', '9RObX9vU', '2T6fV/uH', '2VebdgPz', '5L5+YvNr', 'e7v6/T5f',
  '/TD7atNu', 'YJ7u6yc2', 'v7aZ0/U', '+X/0w+2r', 'TbmA2L7t', 'rY3rsj9s', 'Yk/3h2H6', 'YfXVpNzA',
  'bD/vrY3r', 'sl9vYlv3', 'h2H6YfXV', 'pNzCbT/v', 'rY3rsl9s', 'Yj/3h2H6', 'YfXVpNzA', 'br/rrY3r',
  'sl9sYt/3', 'h2H6YfXV', 'pNzA7D/r', 'rY3rs19s', 'Yvf3h2H6', 'YfXVpNz', 'ADF/rrY3', 'rs19sYnf',
  '3h2H6YfX', 'VpNzAjj/', 'rrY3rs19', 'uYkf3h2H', '6YfXVpNz', 'Ajj/rrY3', 'rs19uYif', '3h2H6YfX',
  'VpNzAjj/', 'rrY3rs19', 'sYmf3h2H', '6YfXVpNz', 'A3H/rrY3', 'rs19sYmv', '3h2H6YfX', 'VpNzA3H/',
  'rrY3rs19', 'sYmr3h2H', '6YfXVpNz', 'A3H/rrY3', 'rs19uYmn', '3h2H6YfX', 'VpNzA3H/', 'rrY3rs19',
  'uYmn3h2H', '6YfXVpNz', 'DD9929eZ', 'tphwAAAA', 'AAAAAAAA', 'AAAAAAAA', 'AAAAAAAA', 'AAAA/OEE',
  'aY4EAdxG', 'ET8AAAAA', 'SUVORK5C', 'YII='
];

// Menggabungkan kembali string base64 dari bagian-bagiannya.
export const logoDenpasarBase64 = `data:image/png;base64,${logoDenpasarParts.join('')}`;
