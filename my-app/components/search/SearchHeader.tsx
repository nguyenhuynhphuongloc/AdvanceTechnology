"use client";

import { Input, Badge, Button } from "antd";
import { ShoppingCartOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchHeader({ initialQuery = "" }: { initialQuery?: string }) {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState(initialQuery);

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        router.push(`/search?${params.toString()}`);
    };

    return (
        <header style={{
            height: 60,
            background: "#0b0b0b",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: 18, fontWeight: "bold", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, border: "1px solid white", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12 }}>▲</span>
                    </div>
                    ACME STORE
                </Link>
                <nav style={{ display: "none", gap: 16 }} className="md-flex">
                    <Link href="/search" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none", fontSize: 14 }}>All</Link>
                    <Link href="/search?collection=shirts" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none", fontSize: 14 }}>Shirts</Link>
                    <Link href="/search?collection=stickers" style={{ color: "rgba(255, 255, 255, 0.7)", textDecoration: "none", fontSize: 14 }}>Stickers</Link>
                </nav>
            </div>

            <div style={{ flex: 1, maxWidth: 400, margin: "0 24px" }}>
                <Input
                    placeholder="Search for products..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                    prefix={<SearchOutlined style={{ color: "rgba(255, 255, 255, 0.5)" }} />}
                    style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        borderRadius: 6
                    }}
                />
            </div>

            <div>
                <Button
                    type="text"
                    icon={
                        <Badge count={0} showZero color="#1677ff" size="small">
                            <ShoppingCartOutlined style={{ fontSize: 20, color: "white" }} />
                        </Badge>
                    }
                />
            </div>
            <style jsx global>{`
                .md-flex {
                    display: none !important;
                }
                @media (min-width: 768px) {
                    .md-flex {
                        display: flex !important;
                    }
                }
                .ant-input {
                    background-color: transparent !important;
                    color: white !important;
                }
                .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .ant-input-affix-wrapper {
                   background-color: transparent !important;
                }
            `}</style>
        </header>
    );
}
