// Prefecture + Area mappings
// Area labels are currently fixed but designed to be
// swappable per-prefecture in the future (e.g., 丹波/播磨 for Hyogo)

export const PREFECTURES: Record<string, string> = {
    "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県",
    "05": "秋田県", "06": "山形県", "07": "福島県", "08": "茨城県",
    "09": "栃木県", "10": "群馬県", "11": "埼玉県", "12": "千葉県",
    "13": "東京都", "14": "神奈川県", "15": "新潟県", "16": "富山県",
    "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
    "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県",
    "25": "滋賀県", "26": "京都府", "27": "大阪府", "28": "兵庫県",
    "29": "奈良県", "30": "和歌山県", "31": "鳥取県", "32": "島根県",
    "33": "岡山県", "34": "広島県", "35": "山口県", "36": "徳島県",
    "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
    "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県",
    "45": "宮崎県", "46": "鹿児島県", "47": "沖縄県",
};

/** Selection UI labels (県北, 県央, etc.) */
export const AREA_QUADRANT_LABELS: Record<string, string> = {
    north: "県北",
    central: "県央",
    south: "県南",
    east: "県東",
    west: "県西",
};

/** Display suffix for public profile/review (北部, 中部, etc.) */
const AREA_DISPLAY_SUFFIX: Record<string, string> = {
    north: "北部",
    central: "中部",
    south: "南部",
    east: "東部",
    west: "西部",
};

/**
 * Returns a human-readable region string like "千葉県北部"
 * Designed so that per-prefecture labels can be added later.
 */
export function getRegionDisplay(prefCode: string, areaQuadrant: string): string {
    const pref = PREFECTURES[prefCode] || "不明";
    const area = AREA_DISPLAY_SUFFIX[areaQuadrant] || "";
    return area ? `${pref}${area}` : pref;
}
