export default function PlaceContentRenderer({ content = [] }) {
  if (!content?.length) return null;

  // --- helper: lấy lat/lon an toàn từ block ---
  const pickLatLon = (b) => {
    if (Array.isArray(b.mapLocation) && b.mapLocation.length >= 2) {
      const lon = Number(b.mapLocation[0]);
      const lat = Number(b.mapLocation[1]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    }
    const lat = Number(b.mapLat);
    const lon = Number(b.mapLon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    return null;
  };

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert prose-h2:mt-0 [&>h2:first-of-type]:mt-4">
      {content.map((b, i) => {
        switch (b.type) {
          case "HEADING":
            return (
              <h2
                key={i}
                className="text-2xl md:text-3xl font-bold tracking-tight mt-10 mb-3"
              >
                {b.text}
              </h2>
            );

          case "PARAGRAPH": {
            const text = (b.text || "")
              .replace(/\s*\n\s*/g, " ")
              .replace(/\s{2,}/g, " ")
              .trim();

            return (
              <p key={i} className="leading-7 mt-0">
                {text}
              </p>
            );
          }

          case "IMAGE":
            return (
              <figure key={i} className="my-6">
                <img
                  src={b.image?.url}
                  alt={b.image?.caption || ""}
                  className="rounded-xl w-full object-cover shadow-md"
                  loading="lazy"
                />
                {b.image?.caption && (
                  <figcaption className="mt-2 text-sm text-gray-500 text-center italic">
                    {b.image.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "GALLERY":
            return (
              <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                {(b.gallery || []).map((g, j) => (
                  <figure key={j} className="w-full">
                    <img
                      src={g.url}
                      alt={g.caption || ""}
                      className="rounded-xl w-full aspect-[4/3] object-cover shadow"
                      loading="lazy"
                    />
                    {g.caption && (
                      <figcaption className="mt-2 text-xs text-gray-500 text-center italic">
                        {g.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            );

          case "QUOTE":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-gray-300 pl-4 italic text-gray-700 py-2 bg-gray-50 rounded-lg whitespace-pre-line"
              >
                {b.text}
              </blockquote>
            );

          case "DIVIDER":
            return <hr key={i} className="my-8 border-gray-200" />;

          case "INFOBOX":
            return <Infobox key={i} text={b.text} />;

          case "MAP": {
            const ll = pickLatLon(b);
            if (!ll) return null; // thiếu toạ độ thì bỏ block để tránh map toàn cầu
            const { lat, lon } = ll;

            return (
              <div key={i} className="rounded-xl border h-64 overflow-hidden my-6">
                <iframe
                  title={`map-${i}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}&z=14&output=embed&hl=vi`}
                />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </article>
  );
}

/** ----- Chỉ nâng cấp INFOBOX, các phần khác giữ nguyên ----- */
function Infobox({ text }) {
  // hỗ trợ **bold** đơn giản trong chuỗi text
  const html = (text || "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  return (
    <div className="relative p-4 my-4 rounded-2xl border border-blue-200/60 dark:border-blue-800/60
                    bg-gradient-to-r from-blue-50 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-800/10
                    ring-1 ring-inset ring-blue-200/40 dark:ring-blue-900/30 shadow-sm">
      {/* viền trái nhấn mạnh */}
      <div className="absolute inset-y-2 left-2 w-1 rounded-full bg-blue-400/80 dark:bg-blue-500/70" />
      <div className="flex items-start gap-3 pl-4">
        {/* icon */}
        <svg
          aria-hidden="true"
          className="mt-0.5 h-6 w-6 flex-none text-blue-500 dark:text-blue-400"
          viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 7.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zM10.75 11h2.5c.414 0 .75.336.75.75v6.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-6.5c0-.414.336-.75.75-.75z"/>
        </svg>
        {/* nội dung */}
        <p
          className="m-0 leading-7 text-blue-900/90 dark:text-blue-100/90"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}