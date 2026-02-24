"use client";

import { toggleLike } from "@/app/actions/likes";
import { useState } from "react";

export function LikeButton({ reviewId, initialLiked, initialCount }: { reviewId: string; initialLiked: boolean; initialCount: number }) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        const result = await toggleLike(reviewId);
        if ("liked" in result && typeof result.liked === "boolean") {
            setLiked(result.liked);
            setCount((c) => (result.liked ? c + 1 : (c > 0 ? c - 1 : 0)));
        }
        setLoading(false);
    };

    return (
        <button className={`action-btn ${liked ? "active" : ""}`} onClick={handleClick} disabled={loading}>
            {liked ? "👍" : "👍🏻"} 参考になった{count > 0 ? ` ${count}` : ""}
        </button>
    );
}
