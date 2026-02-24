"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Mock database to convert any barcode to a demo pesticide
const DEMO_KEYWORDS = ["ラウンドアップ", "ダコニール", "サンフーロン", "プレバソン", "アディオン", "オルトラン", "トレボン"];

export default function BarcodeScannerModal({
    onClose,
    onScan
}: {
    onClose: () => void;
    onScan: (keyword: string) => void;
}) {
    const defaultText = "バーコードをかざしてください";
    const [status, setStatus] = useState(defaultText);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const config = { fps: 10, qrbox: { width: 250, height: 100 } };

        scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                setStatus(`読み取り成功: ${decodedText}`);
                scanner.stop().then(() => {
                    // Create a pseudo keyword based on the barcode string
                    const hash = decodedText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const keyword = DEMO_KEYWORDS[hash % DEMO_KEYWORDS.length];

                    setTimeout(() => {
                        onScan(keyword);
                    }, 500); // slight delay for user to read success message
                });
            },
            (error) => {
                // Ignore continuous scanning frame errors
            }
        ).catch(err => {
            console.error(err);
            setStatus("カメラの起動に失敗しました。カメラの権限を許可してください。");
        });

        return () => {
            if (scanner.isScanning) {
                scanner.stop().catch(console.error);
            }
        };
    }, [onScan]);

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.8)", zIndex: 99999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
        }}>
            <div className="card animate-in" style={{
                background: "white", padding: 24, borderRadius: 16,
                width: "90%", maxWidth: 400, textAlign: "center"
            }}>
                <h3 style={{ margin: "0 0 16px", fontWeight: 800 }}>📷 農薬バーコード（デモ）</h3>
                <div id="reader" style={{ width: "100%", minHeight: 250, background: "#f8fafc", borderRadius: 8, overflow: "hidden" }}></div>
                <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--primary-dark)", fontWeight: 700 }}>{status}</p>
                <button
                    onClick={onClose}
                    className="btn-ghost"
                    style={{ width: "100%", marginTop: 12, justifyContent: "center", background: "#f1f5f9" }}
                >
                    キャンセルして戻る
                </button>
            </div>
        </div>
    );
}
