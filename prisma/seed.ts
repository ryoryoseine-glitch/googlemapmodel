import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPw(pw: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scryptAsync(pw, salt, 64)) as Buffer;
    return `${salt}:${derived.toString("hex")}`;
}

async function main() {
    // Clear all data
    await prisma.otpCode.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.report.deleteMany();
    await prisma.reviewLike.deleteMany();
    await prisma.reviewPhoto.deleteMany();
    await prisma.review.deleteMany();
    await prisma.userPesticide.deleteMany();
    await prisma.usageLog.deleteMany();
    await prisma.farmProfile.deleteMany();
    await prisma.cropItem.deleteMany();
    await prisma.cropCategory.deleteMany();
    await prisma.pesticide.deleteMany();
    await prisma.user.deleteMany();

    console.log("Cleared database.");

    // ============================================================
    // 1. CROP CATEGORIES & ITEMS (8 categories, ~160 items)
    // ============================================================
    const categories: { id: string; name: string; items: { id: string; nameJa: string; synonyms?: string[] }[] }[] = [
        {
            id: "cat_roji", name: "露地野菜",
            items: [
                { id: "roji_tomato", nameJa: "トマト", synonyms: ["大玉トマト", "ミニトマト"] },
                { id: "roji_nasu", nameJa: "ナス", synonyms: ["茄子", "長ナス"] },
                { id: "roji_kyuri", nameJa: "キュウリ", synonyms: ["胡瓜"] },
                { id: "roji_piman", nameJa: "ピーマン" },
                { id: "roji_paprika", nameJa: "パプリカ" },
                { id: "roji_tougarashi", nameJa: "トウガラシ", synonyms: ["唐辛子", "シシトウ"] },
                { id: "roji_kabocha", nameJa: "カボチャ", synonyms: ["南瓜"] },
                { id: "roji_suika", nameJa: "スイカ" },
                { id: "roji_melon", nameJa: "メロン" },
                { id: "roji_hourensou", nameJa: "ホウレンソウ", synonyms: ["ほうれん草"] },
                { id: "roji_komatsuna", nameJa: "コマツナ", synonyms: ["小松菜"] },
                { id: "roji_hakusai", nameJa: "ハクサイ", synonyms: ["白菜"] },
                { id: "roji_cabbage", nameJa: "キャベツ" },
                { id: "roji_broccoli", nameJa: "ブロッコリー" },
                { id: "roji_cauliflower", nameJa: "カリフラワー" },
                { id: "roji_lettuce", nameJa: "レタス" },
                { id: "roji_negi", nameJa: "ネギ", synonyms: ["長ネギ", "白ネギ"] },
                { id: "roji_tamanegi", nameJa: "タマネギ", synonyms: ["玉ねぎ"] },
                { id: "roji_ninjin", nameJa: "ニンジン", synonyms: ["人参"] },
                { id: "roji_daikon", nameJa: "ダイコン", synonyms: ["大根"] },
                { id: "roji_kabu", nameJa: "カブ", synonyms: ["蕪"] },
                { id: "roji_gobo", nameJa: "ゴボウ", synonyms: ["牛蒡"] },
                { id: "roji_renkon", nameJa: "レンコン", synonyms: ["蓮根"] },
                { id: "roji_satoimo", nameJa: "サトイモ", synonyms: ["里芋"] },
                { id: "roji_edamame", nameJa: "エダマメ", synonyms: ["枝豆"] },
                { id: "roji_soramame", nameJa: "ソラマメ", synonyms: ["空豆"] },
                { id: "roji_ingen", nameJa: "インゲン" },
                { id: "roji_okra", nameJa: "オクラ" },
                { id: "roji_shiso", nameJa: "シソ", synonyms: ["大葉", "紫蘇"] },
                { id: "roji_basil", nameJa: "バジル" },
                { id: "roji_parsley", nameJa: "パセリ" },
                { id: "roji_toumorokoshi", nameJa: "トウモロコシ", synonyms: ["スイートコーン"] },
                { id: "roji_asparagus", nameJa: "アスパラガス" },
            ]
        },
        {
            id: "cat_shisetsu", name: "施設園芸",
            items: [
                { id: "shi_tomato", nameJa: "トマト（施設）", synonyms: ["ハウストマト"] },
                { id: "shi_ichigo", nameJa: "イチゴ", synonyms: ["いちご", "苺"] },
                { id: "shi_kyuri", nameJa: "キュウリ（施設）", synonyms: ["ハウスキュウリ"] },
                { id: "shi_nasu", nameJa: "ナス（施設）" },
                { id: "shi_piman", nameJa: "ピーマン（施設）" },
                { id: "shi_melon", nameJa: "メロン（施設）" },
                { id: "shi_suika", nameJa: "スイカ（施設）" },
                { id: "shi_mitsuba", nameJa: "ミツバ" },
                { id: "shi_shungiku", nameJa: "シュンギク", synonyms: ["春菊"] },
                { id: "shi_nira", nameJa: "ニラ", synonyms: ["韮"] },
                { id: "shi_kiku", nameJa: "食用菊" },
                { id: "shi_kaiwaredaikon", nameJa: "カイワレダイコン" },
                { id: "shi_sprout", nameJa: "スプラウト", synonyms: ["もやし"] },
                { id: "shi_lettuce", nameJa: "レタス（施設）" },
                { id: "shi_hourensou", nameJa: "ホウレンソウ（施設）" },
                { id: "shi_paprika", nameJa: "パプリカ（施設）" },
                { id: "shi_herb", nameJa: "ハーブ類", synonyms: ["バジル", "ミント", "ローズマリー"] },
                { id: "shi_mango", nameJa: "マンゴー" },
                { id: "shi_banana", nameJa: "バナナ（施設）" },
            ]
        },
        {
            id: "cat_kajyu", name: "果樹",
            items: [
                { id: "kj_mikan", nameJa: "ミカン", synonyms: ["みかん", "温州みかん", "温州ミカン"] },
                { id: "kj_ringo", nameJa: "リンゴ", synonyms: ["りんご", "林檎"] },
                { id: "kj_nashi", nameJa: "ナシ", synonyms: ["梨", "和梨"] },
                { id: "kj_kaki", nameJa: "カキ", synonyms: ["柿"] },
                { id: "kj_budo", nameJa: "ブドウ", synonyms: ["葡萄", "デラウェア", "シャインマスカット"] },
                { id: "kj_momo", nameJa: "モモ", synonyms: ["桃"] },
                { id: "kj_ume", nameJa: "ウメ", synonyms: ["梅"] },
                { id: "kj_sakuranbo", nameJa: "サクランボ", synonyms: ["桜桃"] },
                { id: "kj_biwa", nameJa: "ビワ", synonyms: ["枇杷"] },
                { id: "kj_kiwi", nameJa: "キウイフルーツ" },
                { id: "kj_blueberry", nameJa: "ブルーベリー" },
                { id: "kj_yuzu", nameJa: "ユズ", synonyms: ["柚子"] },
                { id: "kj_lemon", nameJa: "レモン" },
                { id: "kj_sudachi", nameJa: "スダチ" },
                { id: "kj_iyokan", nameJa: "伊予柑" },
                { id: "kj_dekopon", nameJa: "デコポン", synonyms: ["不知火"] },
                { id: "kj_hassaku", nameJa: "ハッサク" },
                { id: "kj_natsumikan", nameJa: "ナツミカン" },
                { id: "kj_olive", nameJa: "オリーブ" },
                { id: "kj_ichijiku", nameJa: "イチジク", synonyms: ["無花果"] },
                { id: "kj_kuri", nameJa: "クリ", synonyms: ["栗"] },
            ]
        },
        {
            id: "cat_suito", name: "水稲",
            items: [
                { id: "su_koshihikari", nameJa: "コシヒカリ" },
                { id: "su_akitakomachi", nameJa: "あきたこまち" },
                { id: "su_hitomebore", nameJa: "ひとめぼれ" },
                { id: "su_hinohikari", nameJa: "ヒノヒカリ" },
                { id: "su_nanatsuboshi", nameJa: "ななつぼし" },
                { id: "su_yumepirika", nameJa: "ゆめぴりか" },
                { id: "su_tsuyahime", nameJa: "つや姫" },
                { id: "su_haenuki", nameJa: "はえぬき" },
                { id: "su_milky_queen", nameJa: "ミルキークイーン" },
                { id: "su_sassanishiki", nameJa: "ササニシキ" },
                { id: "su_kinuhikari", nameJa: "キヌヒカリ" },
                { id: "su_nikomaru", nameJa: "にこまる" },
                { id: "su_mochigome", nameJa: "もち米", synonyms: ["餅米", "もちごめ"] },
                { id: "su_sakamai", nameJa: "酒米", synonyms: ["山田錦", "五百万石"] },
                { id: "su_shuushoku", nameJa: "飼料用米" },
                { id: "su_other", nameJa: "その他品種" },
            ]
        },
        {
            id: "cat_hataku", name: "畑作",
            items: [
                { id: "ht_komugi", nameJa: "小麦" },
                { id: "ht_oomugi", nameJa: "大麦" },
                { id: "ht_hadakamugi", nameJa: "裸麦" },
                { id: "ht_soba", nameJa: "ソバ", synonyms: ["蕎麦"] },
                { id: "ht_daizu", nameJa: "大豆" },
                { id: "ht_azuki", nameJa: "小豆", synonyms: ["アズキ"] },
                { id: "ht_rakkasei", nameJa: "ラッカセイ", synonyms: ["落花生", "ピーナッツ"] },
                { id: "ht_jagaimo", nameJa: "ジャガイモ", synonyms: ["馬鈴薯", "ばれいしょ"] },
                { id: "ht_satsumaimo", nameJa: "サツマイモ", synonyms: ["甘藷", "さつまいも"] },
                { id: "ht_nagaimo", nameJa: "ナガイモ", synonyms: ["長芋"] },
                { id: "ht_satoukibi", nameJa: "サトウキビ" },
                { id: "ht_tensai", nameJa: "テンサイ", synonyms: ["甜菜", "ビート"] },
                { id: "ht_natane", nameJa: "ナタネ", synonyms: ["菜種"] },
                { id: "ht_goma", nameJa: "ゴマ", synonyms: ["胡麻"] },
                { id: "ht_toumorokoshi_shiryou", nameJa: "飼料用トウモロコシ", synonyms: ["デントコーン"] },
                { id: "ht_hayato", nameJa: "ハヤトイモ" },
                { id: "ht_konnyaku", nameJa: "コンニャク", synonyms: ["蒟蒻"] },
            ]
        },
        {
            id: "cat_cha", name: "茶",
            items: [
                { id: "ch_sencha", nameJa: "煎茶" },
                { id: "ch_gyokuro", nameJa: "玉露" },
                { id: "ch_matcha", nameJa: "抹茶", synonyms: ["てん茶"] },
                { id: "ch_bancha", nameJa: "番茶" },
                { id: "ch_houjicha", nameJa: "ほうじ茶" },
                { id: "ch_uroncha", nameJa: "ウーロン茶" },
                { id: "ch_kocha", nameJa: "紅茶" },
                { id: "ch_other", nameJa: "その他茶種" },
            ]
        },
        {
            id: "cat_kaki", name: "花き",
            items: [
                { id: "hk_kiku", nameJa: "キク", synonyms: ["菊", "輪菊", "小菊"] },
                { id: "hk_bara", nameJa: "バラ", synonyms: ["薔薇"] },
                { id: "hk_carnation", nameJa: "カーネーション" },
                { id: "hk_yuri", nameJa: "ユリ", synonyms: ["百合"] },
                { id: "hk_tulip", nameJa: "チューリップ" },
                { id: "hk_gerbera", nameJa: "ガーベラ" },
                { id: "hk_toruko", nameJa: "トルコギキョウ" },
                { id: "hk_ran", nameJa: "ラン", synonyms: ["洋ラン", "シンビジウム", "胡蝶蘭"] },
                { id: "hk_himawari", nameJa: "ヒマワリ", synonyms: ["向日葵"] },
                { id: "hk_cosmos", nameJa: "コスモス" },
                { id: "hk_shibafuki", nameJa: "芝・グランドカバー" },
                { id: "hk_kanou", nameJa: "観葉植物" },
                { id: "hk_other", nameJa: "その他花き" },
            ]
        },
        {
            id: "cat_sonota", name: "その他",
            items: [
                { id: "so_shiitake", nameJa: "シイタケ", synonyms: ["椎茸"] },
                { id: "so_enoki", nameJa: "エノキダケ" },
                { id: "so_shimeji", nameJa: "シメジ" },
                { id: "so_maitake", nameJa: "マイタケ" },
                { id: "so_eringi", nameJa: "エリンギ" },
                { id: "so_nameko", nameJa: "ナメコ" },
                { id: "so_wasabi", nameJa: "ワサビ", synonyms: ["山葵"] },
                { id: "so_sansei", nameJa: "山菜類" },
                { id: "so_yakuyou", nameJa: "薬用作物" },
                { id: "so_shiryou", nameJa: "飼料作物" },
                { id: "so_ryokuhi", nameJa: "緑肥作物", synonyms: ["ヘアリーベッチ", "レンゲ"] },
                { id: "so_other", nameJa: "その他" },
            ]
        },
    ];

    // Insert categories and items
    for (const cat of categories) {
        await prisma.cropCategory.create({ data: { id: cat.id, name: cat.name } });
        for (const item of cat.items) {
            await prisma.cropItem.create({
                data: {
                    id: item.id,
                    categoryId: cat.id,
                    nameJa: item.nameJa,
                    synonyms: item.synonyms ? JSON.stringify(item.synonyms) : null,
                }
            });
        }
    }
    const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
    console.log(`Created ${categories.length} categories, ${totalItems} items.`);

    // ============================================================
    // 2. DEMO USERS
    // ============================================================
    // Demo password: "demo1234"
    const demoHash = await hashPw("demo1234");

    const users = [
        {
            id: "user_1", name: "山田 健一", email: "yamada@example.com", phoneNumber: "090-1111-2222",
            profile: {
                cropCategoryIds: JSON.stringify(["cat_suito", "cat_hataku"]),
                cropItemIds: JSON.stringify(["su_koshihikari", "su_akitakomachi", "ht_daizu"]),
                primaryCropItemId: "su_koshihikari",
                prefCode: "15", areaQuadrant: "central", areaScale: "30-50"
            }
        },
        {
            id: "user_2", name: "佐藤 美紀", email: "sato@example.com", phoneNumber: "090-3333-4444",
            profile: {
                cropCategoryIds: JSON.stringify(["cat_shisetsu"]),
                cropItemIds: JSON.stringify(["shi_ichigo", "shi_tomato"]),
                primaryCropItemId: "shi_ichigo",
                prefCode: "43", areaQuadrant: "central", areaScale: "1-5"
            }
        },
        {
            id: "user_3", name: "田中 義男", email: "tanaka@example.com", phoneNumber: "090-5555-6666",
            profile: {
                cropCategoryIds: JSON.stringify(["cat_kajyu"]),
                cropItemIds: JSON.stringify(["kj_mikan", "kj_dekopon", "kj_iyokan"]),
                primaryCropItemId: "kj_mikan",
                prefCode: "38", areaQuadrant: "north", areaScale: "5-10"
            }
        },
        {
            id: "user_4", name: "鈴木 浩二", email: "suzuki@example.com", phoneNumber: "090-7777-8888",
            profile: {
                cropCategoryIds: JSON.stringify(["cat_roji"]),
                cropItemIds: JSON.stringify(["roji_tomato", "roji_nasu", "roji_kyuri", "roji_lettuce"]),
                primaryCropItemId: "roji_tomato",
                prefCode: "13", areaQuadrant: "west", areaScale: "1-5"
            }
        }
    ];

    for (const u of users) {
        await prisma.user.create({
            data: {
                id: u.id, name: u.name, email: u.email, phoneNumber: u.phoneNumber,
                passwordHash: demoHash,
                emailVerified: true,
                phoneVerified: true,
                profileComplete: true,
                farmProfile: { create: u.profile }
            }
        });
    }

    console.log("Created demo users (password: demo1234).");

    // ============================================================
    // 3. BADGES
    // ============================================================
    const badgeData = [
        { key: "first_review", name: "初投稿", description: "最初のレビュー", iconEmoji: "🌱" },
        { key: "pioneer", name: "開拓者", description: "3件以上のレビュー", iconEmoji: "🚜" },
        { key: "gold", name: "ゴールド", description: "10件以上のレビュー", iconEmoji: "🏆" },
    ];
    for (const b of badgeData) { await prisma.badge.create({ data: b }); }

    // ============================================================
    // 4. PESTICIDES (reuse existing)
    // ============================================================
    const pests = [
        { id: "pest_1", name: "スタークル顆粒水溶剤", maker: "三井化学アグロ", category: "殺虫剤" },
        { id: "pest_2", name: "トレボン乳剤", maker: "三井化学アグロ", category: "殺虫剤" },
        { id: "pest_3", name: "ダントツ水溶剤", maker: "住友化学", category: "殺虫剤" },
        { id: "pest_4", name: "オリゼメート顆粒水和剤", maker: "Meiji Seika ファルマ", category: "殺菌剤" },
    ];
    for (const p of pests) { await prisma.pesticide.create({ data: p }); }

    console.log("Seeding complete!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
