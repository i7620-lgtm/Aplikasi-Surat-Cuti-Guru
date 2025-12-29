
// Siklus 7 harian (Saptawara/Dina)
const saptawara = ['Redite', 'Soma', 'Anggara', 'Buda', 'Wraspati', 'Sukra', 'Saniscara']; // Minggu/Redite = 0

// Siklus 5 harian (Pancawara)
const pancawara = ['Umanis', 'Paing', 'Pon', 'Wage', 'Kliwon'];

// Siklus 210 harian (30 Wuku x 7 hari)
const wuku = [
  'Sinta', 'Landep', 'Ukir', 'Kulantir', 'Tolu', 'Gumbreg', 'Wariga', 'Warigadian', 'Julungwangi', 'Sungsang',
  'Dungulan', 'Kuningan', 'Langkir', 'Medangsia', 'Pujut', 'Pahang', 'Krulut', 'Merakih', 'Tambir', 'Medangkungan',
  'Matal', 'Uye', 'Menail', 'Prangbakat', 'Bale', 'Ugu', 'Wayang', 'Kelau', 'Dukut', 'Watugunung'
];

// TITIK REFERENSI FINAL DAN TERKUNCI (SESUAI INSTRUKSI PENGGUNA)
// 25 Desember 2025 adalah Wraspati Umanis Pahang.
const refDate = new Date(Date.UTC(2025, 11, 25)); // Bulan di JS adalah 0-indexed, jadi 11 = Desember.

// Indeks berdasarkan tanggal referensi di atas:
const refPancawaraIndex = 0; // Umanis adalah indeks ke-0
const refWukuIndex = 15; // Pahang adalah wuku ke-16 (indeks 15)
const refSaptawaraIndex = 4; // Wraspati adalah hari ke-5 (indeks 4, Redite=0)

// Menghitung hari ke berapa dalam siklus wuku 210 hari untuk tanggal referensi.
// (15 wuku penuh * 7 hari/wuku) + 4 hari dalam wuku Pahang = hari ke-109 (indeks)
const refDayInWukuCycle = (refWukuIndex * 7) + refSaptawaraIndex;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateBalineseDate = (gregorianDate: Date): string => {
  // Membuat tanggal target menjadi UTC untuk konsistensi dan menghindari masalah zona waktu.
  const targetDate = new Date(Date.UTC(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate()));

  // Menghitung total selisih hari dari tanggal referensi yang sudah pasti benar.
  const diffInDays = Math.round((targetDate.getTime() - refDate.getTime()) / MS_PER_DAY);

  // 1. Hitung Saptawara (Dina)
  // Cara paling andal adalah langsung dari metode getUTCDay() pada objek Date.
  const saptawaraName = saptawara[targetDate.getUTCDay()];

  // 2. Hitung Pancawara
  // Gunakan selisih hari dari referensi. Modulo `(x % n + n) % n` memastikan hasil selalu positif, bahkan untuk tanggal sebelum referensi.
  const pancawaraIndex = ((refPancawaraIndex + diffInDays) % 5 + 5) % 5;
  const pancawaraName = pancawara[pancawaraIndex];

  // 3. Hitung Wuku
  // Gunakan selisih hari dari referensi hari dalam siklus wuku.
  const dayInWukuCycle = ((refDayInWukuCycle + diffInDays) % 210 + 210) % 210;
  const wukuIndex = Math.floor(dayInWukuCycle / 7);
  const wukuName = wuku[wukuIndex];

  return `${saptawaraName} ${pancawaraName} ${wukuName}`;
};
