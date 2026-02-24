"use client";

import { useRouter } from "next/navigation";
import SharedPesticideSearch from "@/components/SharedPesticideSearch";

export default function HomeSearchWrapper() {
    const router = useRouter();

    return (
        <SharedPesticideSearch
            hideHeader
            onSelect={(p) => {
                router.push(`/pesticides/${p.regNumber}`);
            }}
            actionLabel="詳細を見る"
        />
    );
}
