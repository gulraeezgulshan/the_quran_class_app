export type Chapter = {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export type ChaptersResponse = {
    chapters: Chapter[];
}

export type Word = {
    id: number;
    position: number;
    audio_url: string;
    char_type_name: string;
    translation: {
        text: string;
        language_name: string;
    };
    transliteration: {
        text: string;
        language_name: string;
    };
};

export type Audio = {
    url: string;
}

export type Verse = {
    id: number;
    chapter_id: number;
    verse_number: number;
    verse_key: string;
    verse_index: number;
    text_uthmani: string;
    text_uthmani_simple: string;
    text_imlaei: string;
    text_imlaei_simple: string;
    text_indopak: string;
    text_uthmani_tajweed: string;
    juz_number: number;
    hizb_number: number;
    rub_number: number;
    sajdah_type: null | string;
    sajdah_number: null | number;
    page_number: number;
    image_url: string;
    image_width: number;
    words: Word[];
    audio: Audio;
};


export type QuranResponse = {
    verses: Verse[];
    pagination: {
        per_page: number;
        current_page: number;
        next_page: number;
        total_pages: number;
        total_records: number;
    };
};