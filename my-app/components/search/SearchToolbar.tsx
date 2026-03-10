"use client";

import { Input, Select, Typography, Space } from "antd";
import { SortOption } from "../../lib/search/types";

const { Search } = Input;
const { Text } = Typography;

interface SearchToolbarProps {
    query: string;
    sort: SortOption;
    resultCount: number;
    onQueryChange: (query: string) => void;
    onSortChange: (sort: SortOption) => void;
}

const sortOptions = [
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
];

export function SearchToolbar({ query, sort, resultCount, onQueryChange, onSortChange }: SearchToolbarProps) {
    const handleSearch = (value: string) => {
        onQueryChange(value);
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
                <Search
                    placeholder="Search products..."
                    allowClear
                    enterButton="Search"
                    size="large"
                    defaultValue={query}
                    onSearch={handleSearch}
                    style={{ maxWidth: 400, flex: 1 }}
                />

                <Space align="center">
                    <Text type="secondary">Sort by:</Text>
                    <Select
                        size="large"
                        value={sort}
                        options={sortOptions}
                        onChange={(val) => onSortChange(val as SortOption)}
                        style={{ width: 180 }}
                    />
                </Space>
            </div>

            <div style={{ marginTop: 16 }}>
                <Text strong>
                    {resultCount} {resultCount === 1 ? "result" : "results"}
                </Text>
                {query && (
                    <Text>
                        {" for \""}
                        <Text strong>{query}</Text>
                        {"\""}
                    </Text>
                )}
            </div>
        </div>
    );
}
