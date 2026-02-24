"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SharedPesticideSearch from "@/components/SharedPesticideSearch";

function SearchPageFallback() {
    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
            <SharedPesticideSearch />
        </div>
    );
}

function SearchPageInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
            <SharedPesticideSearch
                initialFilters={{
                    keyword: searchParams.get("q") || "",
                    crops: searchParams.get("crops")?.split(",").filter(Boolean) || [],
                    purposes: searchParams.get("purposes")?.split(",").filter(Boolean) || [],
                }}
                onSelect={(pesticide) => router.push(`/pesticides/${pesticide.regNumber}`)}
                actionLabel="詳細を見る"
            />
        </div>
    );
}

export default function PesticideSearchPage() {
    return (
        <Suspense fallback={<SearchPageFallback />}>
            <SearchPageInner />
        </Suspense>
    );
}

