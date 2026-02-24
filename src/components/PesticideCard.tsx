"use client";

import type { PesticideSearchResult, ApplicationDetail } from "@/types/maff";
import { useState } from "react";

const PURPOSE_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
    "殺虫剤": { bg: "#fef2f2", fg: "#dc2626", border: "#fecaca" },
    "殺菌剤": { bg: "#eff6ff", fg: "#2563eb", border: "#bfdbfe" },
    "除草剤": { bg: "#f0fdf4", fg: "#16a34a", border: "#bbf7d0" },
    "殺虫殺菌剤": { bg: "#faf5ff", fg: "#9333ea", border: "#e9d5ff" },
    "植物成長調整剤": { bg: "#fffbeb", fg: "#d97706", border: "#fde68a" },
    "殺そ剤": { bg: "#f9fafb", fg: "#6b7280", border: "#e5e7eb" },
};

const defaultColor = { bg: "#f9fafb", fg: "#6b7280", border: "#e5e7eb" };

interface Props {
    card: PesticideSearchResult;
    onClick?: () => void;
    actionLabel?: string;
}

export default function PesticideCard({ card, onClick, actionLabel }: Props) {
    const [expanded, setExpanded] = useState(false);
    const colors = PURPOSE_COLORS[card.purpose] || defaultColor;
    const visibleApps = expanded ? card.applications : card.applications.slice(0, 4);

    // Generate a deterministic "image" placeholder based on regNumber
    const hue = (parseInt(card.regNumber) * 37) % 360;

    return (
        <div
            className="card"
            style={{
                padding: 0, overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: onClick ? "pointer" : "default",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
            onClick={(e) => {
                // Ignore clicks on the expand/collapse button
                if ((e.target as HTMLElement).tagName !== 'BUTTON' && onClick) {
                    onClick();
                }
            }}
        >
            {/* Top color bar + image placeholder */}
            <div style={{ display: "flex" }}>
                {/* Image placeholder */}
                <div style={{
                    width: 100, minHeight: 100,
                    background: `linear-gradient(135deg, hsl(${hue}, 50%, 85%), hsl(${(hue + 60) % 360}, 40%, 75%))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem", flexShrink: 0,
                }}>
                    {card.purpose === "殺虫剤" ? "🐛" :
                        card.purpose === "殺菌剤" ? "🦠" :
                            card.purpose === "除草剤" ? "🌿" :
                                card.purpose === "殺虫殺菌剤" ? "🛡️" :
                                    card.purpose === "植物成長調整剤" ? "🌱" : "💊"}
                </div>

                {/* Card header */}
                <div style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary-dark)", margin: 0, lineHeight: 1.3 }}>
                                {card.name}
                            </h3>
                            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>
                                {card.company} ｜ No.{card.regNumber}
                            </div>
                        </div>
                        <span style={{
                            padding: "3px 10px", borderRadius: 100,
                            fontSize: "0.68rem", fontWeight: 700,
                            background: colors.bg, color: colors.fg,
                            border: `1px solid ${colors.border}`,
                            whiteSpace: "nowrap",
                        }}>
                            {card.purpose}
                        </span>
                    </div>

                    {/* Meta tags + optional action button */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: "auto", paddingTop: 10, alignItems: "center" }}>
                        <Tag icon="💊" text={card.formulation} />
                        <Tag icon="🧪" text={card.activeIngredient} />
                        {onClick && actionLabel && (
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{
                                    display: "inline-block", background: "var(--primary)", color: "white",
                                    padding: "6px 14px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                    {actionLabel}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Application table */}
            {card.applications.length > 0 && (
                <div style={{ padding: "0 18px 14px 18px" }}>
                    <div style={{
                        background: "#f8fafc", borderRadius: 10, padding: "10px 12px",
                        fontSize: "0.75rem",
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>作物</th>
                                    <th style={thStyle}>病害虫</th>
                                    <th style={thStyle}>希釈/量</th>
                                    <th style={thStyle}>使用方法</th>
                                    <th style={thStyle}>時期</th>
                                    <th style={thStyle}>回数</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleApps.map((app: ApplicationDetail, i: number) => (
                                    <tr key={i} style={{ borderTop: i > 0 ? "1px solid #f0f0f0" : "none" }}>
                                        <td style={tdStyle}>{app.cropName || "-"}</td>
                                        <td style={{ ...tdStyle, fontWeight: 600, color: "#92400e" }}>{app.pestName || "-"}</td>
                                        <td style={tdStyle}>{app.dilution || "-"}</td>
                                        <td style={tdStyle}>{app.method || "-"}</td>
                                        <td style={tdStyle}>{app.timing || "-"}</td>
                                        <td style={tdStyle}>{app.usageCount || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {card.applications.length > 4 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                style={{
                                    width: "100%", padding: "6px 0", border: "none",
                                    background: "transparent", cursor: "pointer",
                                    color: "var(--primary)", fontSize: "0.72rem", fontWeight: 700,
                                    marginTop: 4,
                                }}
                            >
                                {expanded ? "▲ 折りたたむ" : `▼ 他 ${card.applications.length - 4} 件を表示`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Tag({ icon, text }: { icon: string; text: string }) {
    if (!text) return null;
    return (
        <span style={{
            padding: "2px 7px", borderRadius: 5,
            fontSize: "0.68rem", fontWeight: 600,
            background: "#f0f4f8", color: "#4a5568",
        }}>
            {icon} {text}
        </span>
    );
}

const thStyle: React.CSSProperties = {
    textAlign: "left", padding: "5px 6px",
    fontSize: "0.65rem", fontWeight: 700, color: "#9ca3af",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
    padding: "5px 6px", fontSize: "0.72rem",
    maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis",
};
