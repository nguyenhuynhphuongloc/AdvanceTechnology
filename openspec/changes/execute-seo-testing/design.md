## Approach

SEO testing should focus on indexable public pages first.

```text
Public SEO targets
  -> /
  -> /HomePage
  -> /products
  -> /products/[slug]
  -> /product
  -> /product/[slug]
  -> /search
```

## Checks

- Title and meta description.
- H1/H2/H3 structure.
- Canonical and duplicate route behavior.
- Open Graph tags.
- robots.txt and sitemap.xml.
- Image alt text.
- Structured data.
- Mobile friendliness and page speed.
- Private route indexability.

## Risks

- Duplicate `/product` and `/products` routes may create duplicate content.
- Product detail metadata appears global rather than product-specific.
- robots/sitemap/Open Graph/structured data were not found in current source.
