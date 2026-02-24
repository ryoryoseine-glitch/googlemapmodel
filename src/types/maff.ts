/** MAFF-aligned pesticide data types */

export interface MaffPesticideInfo {
    regNumber: string;
    name: string;
    pesticideType: string;
    purpose: string;
    company: string;
    activeIngredient: string;
    formulation: string;
}

export interface ApplicationDetail {
    cropName: string;
    pestName: string;
    dilution: string;
    method: string;
    timing: string;
    usageCount: string;
}

export interface PesticideSearchResult extends MaffPesticideInfo {
    applications: ApplicationDetail[];
}

export interface FilterOption {
    name: string;
    count: number;
}

/** Hybrid search: checkboxes (arrays) + keyword text */
export interface SearchFiltersState {
    keyword: string;          // フリーテキスト（農薬名・メーカー等）
    crops: string[];          // 選択された作物名（OR）
    purposes: string[];       // 選択された用途（OR）
    pests: string[];          // 選択された適用病害虫（OR）
}
