/**
 * Utilitas transliterasi Latin ke Aksara Bali.
 * Menangani suku kata, gugus konsonan, vokal berurutan, 
 * dan aturan fonetik kompleks untuk kop surat resmi.
 */

const officialPhrases: Record<string, string> = {
  'dinas': 'ᬤᬶᬦᬲ᭄',
  'pendidikan': 'ᬧᭂᬦ᭄ᬤᬶᬤᬶᬓᬦ᭄',
  'kepemudaan': 'ᬓᭂᬧᭂᬫᬸᬤᬵᬦ᭄',
  'dan': 'ᬤᬦ᭄',
  'olahraga': 'ᬳᭀᬮᬄᬭᬕ',
  'kota': 'ᬓᭀᬢ',
  'denpasar': 'ᬤᬾᬦ᭄ᬧᬲᬃ',
  'bali': 'ᬩᬮᬶ',
  'simbar': 'ᬲᬶᬫ᭄ᬩᬃ',
};

// Dibagi menjadi beberapa bagian untuk menghindari galat "Text length must not exceed..." pada beberapa environment.
const pepetCorrections_part1: Record<string, string> = {
    'sebagai': 'sĕbagai', 'semua': 'sĕmua', 'sekolah': 'sĕkolah', 'selamat': 'sĕlamat', 
    'semester': 'sĕmĕster', 'sembilan': 'sĕmbilan', 'sepuluh': 'sĕpuluh', 'sehingga': 'sĕhingga',
    'seperti': 'sĕpĕrti', 'sederhana': 'sĕdĕrhana', 'selalu': 'sĕlalu', 'sekar': 'sĕkar', 'setia': 'sĕtia',
};
const pepetCorrections_part2: Record<string, string> = {
    'benar': 'bĕnar', 'besar': 'bĕsar', 'bekerja': 'bĕkĕrja', 'belajar': 'bĕlajar', 'besi': 'bĕsi',
    'ke': 'kĕ', 'kelas': 'kĕlas', 'kepala': 'kĕpala', 'kertas': 'kĕrtas', 'kesehatan': 'kĕsĕhatan',
    'kebo': 'kĕbo', 'kembali': 'kĕmbali', 'kemampuan': 'kĕmampuan',
};
const pepetCorrections_part3: Record<string, string> = {
    'kepemudaan': 'kĕpĕmudaan', 'perlu': 'pĕrlu', 'perkembangan': 'pĕrkĕmbangan', 'pengetahuan': 'pĕngĕtahuan',
    'penilaian': 'pĕnilaian', 'perhatian': 'pĕrhatian', 'peserta': 'pĕsĕrta', 'pemerintah': 'pĕmĕrintah',
    'pendidikan': 'pĕndidikan', 'memberi': 'mĕmbĕri', 'membuat': 'mĕmbuat', 'membaca': 'mĕmbaca', 
    'menulis': 'mĕnulis', 'memiliki': 'mĕmiliki',
};
const pepetCorrections_part4: Record<string, string> = {
    'mereka': 'mĕreka', 'memerlukan': 'mĕmĕrlukan', 'memperbaiki': 'mĕmpĕrbaiki', 'menjelaskan': 'mĕnjelaskan', 
    'menyebutkan': 'mĕnyĕbutkan', 'menunjukkan': 'mĕnunjukkan', 'mengikuti': 'mĕngikuti', 'mengembangkan': 'mĕngĕmbangkan', 
    'meningkatkan': 'mĕningkatkan', 'negeri': 'nĕgĕri', 'tersebut': 'tĕrsĕbut', 'terpadu': 'tĕrpadu', 
    'teman': 'tĕman', 'tempat': 'tĕmpat', 'telah': 'tĕlah', 'delapan': 'dĕlapan', 'dengan': 'dĕngan', 
    'depan': 'dĕpan', 'gelas': 'gĕlas',
};

const pepetCorrections: Record<string, string> = {
    ...pepetCorrections_part1,
    ...pepetCorrections_part2,
    ...pepetCorrections_part3,
    ...pepetCorrections_part4,
};


const INDEPENDENT_VOWELS: Record<string, string> = { 'a': 'ᬅ', 'i': 'ᬇ', 'u': 'ᬉ', 'e': 'ᬏ', 'o': 'ᬑ', 'ĕ': 'ᬅᭂ' };

const CONSONANTS: Record<string, string> = {
    'h': 'ᬳ', 'n': 'ᬦ', 'c': 'ᬘ', 'r': 'ᬭ', 'k': 'ᬓ', 'd': 'ᬤ', 't': 'ᬢ', 's': 'ᬲ', 'w': 'ᬯ', 'l': 'ᬮ',
    'm': 'ᬫ', 'g': 'ᬕ', 'b': 'ᬩ', 'p': 'ᬧ', 'j': 'ᬚ', 'y': 'ᬬ', 'ny': 'ᬜ', 'ng': 'ᬗ',
    'kh': 'ᬔ', 'gh': 'ᬖ', 'ṭ': 'ᬝ', 'ḍ': 'ᬟ', 'dh': 'ᬥ', 'th': 'ᬣ', 'bh': 'ᬪ', 'ph': 'ᬨ',
    'z': 'ᬚ', 'f': 'ᬧ', 'v': 'ᬯ',
};

const VOWEL_DIACRITICS: Record<string, string> = { 
    'i': 'ᬶ', 'u': 'ᬸ', 'ĕ': 'ᭂ', 'e': 'ᬾ', 'tedung': 'ᬵ' 
};

const FINALS: Record<string, string> = { 'r': 'ᬃ', 'ng': 'ᬂ', 'h': 'ᬄ' };

const BALINESE_NUMBERS_PUNCTUATION: Record<string, string> = {
  '0': '᭐', '1': '᭑', '2': '᭒', '3': '᭓', '4': '᭔', '5': '᭕', '6': '᭖', '7': '᭗', '8': '᭘', '9': '᭙',
  '(': '₍', ')': '₎', ',': '᭞', '.': '᭟', ':': ':',
};

const ADEG_ADEG = '᭄';
const VOWELS = 'aiueoĕ';

const ALL_CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);

function isVowel(char: string) { return VOWELS.includes(char.toLowerCase()); }

function applyCorrections(text: string) {
    let correctedText = text;
    Object.entries(pepetCorrections).forEach(([latin, corrected]) => {
        const regex = new RegExp(`\\b${latin}\\b`, 'gi');
        correctedText = correctedText.replace(regex, (match) => {
            const firstChar = match.charAt(0);
            return (firstChar === firstChar.toUpperCase() && corrected.length > 0)
                ? corrected.charAt(0).toUpperCase() + corrected.slice(1)
                : corrected;
        });
    });
    return correctedText;
}

function _transliterateWord(latin: string) {
    if (!latin) return '';
    let text = applyCorrections(latin);

    text = text.replace(/([bcdfghjklmnpqrstvwxyz])ia/gi, '$1ya');
    text = text.replace(/nc/gi, 'nyc');
    text = text.replace(/nj/gi, 'nyj');
    text = text.replace(/dny/gi, 'jny');

    let result = '';
    let i = 0;

    const findConsonant = (pos: number) => ALL_CONSONANT_KEYS.find(key => text.substring(pos, pos + key.length).toLowerCase() === key);

    while (i < text.length) {
        if (isVowel(text[i])) {
            result += INDEPENDENT_VOWELS[text[i].toLowerCase()] || text[i];
            i++;
            continue;
        }

        let c1 = findConsonant(i);
        if (!c1) {
            result += text[i];
            i++;
            continue;
        }

        let c1_len = c1.length;
        let c1_base = CONSONANTS[c1];
        let next_pos = i + c1_len;

        if (next_pos >= text.length) {
            result += (FINALS[c1] || c1_base + ADEG_ADEG);
            break;
        }

        let c2 = findConsonant(next_pos);
        if (c2 && (c2 === 'r' || c2 === 'y')) {
            let after_c2_pos = next_pos + c2.length;
            if (after_c2_pos < text.length && isVowel(text[after_c2_pos])) {
                let vowel = text[after_c2_pos].toLowerCase();
                let pangangge = c2 === 'r' ? '᭄ᬭ' : '᭄ᬬ';
                
                let syllable = c1_base + pangangge;
                if (vowel !== 'a') {
                    if (vowel === 'o') {
                        syllable += VOWEL_DIACRITICS.e + VOWEL_DIACRITICS.tedung;
                    } else {
                        syllable += VOWEL_DIACRITICS[vowel] || '';
                    }
                }
                result += syllable;
                i = after_c2_pos + 1;
                continue;
            }
        }

        if (isVowel(text[next_pos])) {
            let vowel = text[next_pos].toLowerCase();
            let syllable = c1_base;
            if (vowel !== 'a') {
                if (vowel === 'o') {
                    syllable += VOWEL_DIACRITICS.e + VOWEL_DIACRITICS.tedung;
                } else {
                    syllable += VOWEL_DIACRITICS[vowel] || '';
                }
            }
            result += syllable;
            i = next_pos + 1;
            continue;
        }

        if (c2) {
            if (c1 === 'r') {
                result += FINALS.r;
                i = next_pos;
                continue;
            }
            result += c1_base + ADEG_ADEG;
            i = next_pos;
            continue;
        }

        result += (FINALS[c1] || c1_base + ADEG_ADEG);
        i = next_pos;
    }
    
    let finalResult = result;
    finalResult = finalResult.replace(/ᬭᭂ/g, 'ᬋ');
    finalResult = finalResult.replace(/ᬮᭂ/g, 'ᬍ');
    
    return finalResult;
}

export function transliterate(latin: string) {
    if (!latin) return '';
    const textToProcess = latin.trim();
    const parts = textToProcess.split(/(\s|[.,:()?!])/g).filter(Boolean);

    return parts.map(part => {
        const lowerPart = part.toLowerCase();
        if (officialPhrases[lowerPart]) return officialPhrases[lowerPart];
        if (part.match(/^(\s|[.,:()?!])$/)) return BALINESE_NUMBERS_PUNCTUATION[part] || part;
        if (part.match(/^[0-9]+$/)) {
            return part.split('').map(digit => BALINESE_NUMBERS_PUNCTUATION[digit] || digit).join('');
        }
        return _transliterateWord(part);
    }).join('');
}

export function expandAndCapitalizeSchoolName(name: string) {
    if (!name || !name.trim()) return '';
    let processedName = name.trim().toLowerCase();
    processedName = processedName.replace(/\b(sdn|sd n)\b/g, 'sekolah dasar negeri');
    processedName = processedName.replace(/\bsd\b/g, 'sekolah dasar');
    return processedName.toUpperCase();
}
