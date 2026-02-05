export default function StickerGrid() {
  const stickers = [
    "/stickers/star.svg",
    "/stickers/heart.svg",
    "/stickers/crown.svg",
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stickers.map((s) => (
        <img
          key={s}
          src={s}
          className="border rounded-lg p-2 cursor-pointer hover:shadow"
        />
      ))}
    </div>
  );
}
