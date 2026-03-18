import Link from "next/link";

interface ProductCatalogHeaderProps {
    search?: string;
}

export function ProductCatalogHeader({ search = "" }: ProductCatalogHeaderProps) {
    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                backdropFilter: "blur(18px)",
                background: "rgba(10, 16, 22, 0.72)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <Link
                        href="/products"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            fontSize: 20,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                        }}
                    >
                        CATALOG
                    </Link>
                    <Link
                        href="/"
                        style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}
                    >
                        Home
                    </Link>
                </div>

                <form action="/products" style={{ display: "flex", gap: 10, flex: "1 1 360px", maxWidth: 480 }}>
                    <input
                        type="search"
                        name="search"
                        defaultValue={search}
                        placeholder="Search jackets, denim, knitwear..."
                        style={{
                            flex: 1,
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(255,255,255,0.04)",
                            color: "white",
                            padding: "12px 18px",
                            outline: "none",
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            borderRadius: 999,
                            border: "none",
                            background: "#f25f4c",
                            color: "#111",
                            padding: "12px 18px",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Search
                    </button>
                </form>
            </div>
        </header>
    );
}
