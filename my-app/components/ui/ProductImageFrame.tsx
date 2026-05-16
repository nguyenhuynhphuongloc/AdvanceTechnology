const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%23f1f5f9'/%3E%3Cpath d='M230 500h340L465 365l-78 92-52-62-105 105Z' fill='%23cbd5e1'/%3E%3Ccircle cx='302' cy='285' r='44' fill='%23cbd5e1'/%3E%3C/svg%3E";

type ProductImageFrameProps = {
  src?: string | null;
  alt: string;
  aspect?: "square" | "portrait" | "wide";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const aspectClassName = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[4/3]",
};

export function ProductImageFrame({
  src,
  alt,
  aspect = "square",
  className = "",
  imageClassName = "",
  priority = false,
}: ProductImageFrameProps) {
  return (
    <div
      className={[
        "relative flex overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
        aspectClassName[aspect],
        className,
      ].join(" ")}
    >
      <img
        src={src || FALLBACK_IMAGE}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={[
          "h-full w-full object-contain p-3 transition duration-300",
          imageClassName,
        ].join(" ")}
      />
    </div>
  );
}
