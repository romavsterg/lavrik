type ProjectImagesGridProps = {
  images: string[];
  projectTitle: string;
  getImgName: (url: string) => string;
  onSelect: (index: number) => void;
};

export default function ProjectImagesGrid({ images, projectTitle, getImgName, onSelect }: ProjectImagesGridProps) {
  return <div className="flex flex-wrap justify-center gap-5 mt-4">
    {images.map((url, index) => (
      <button
        key={index}
        type="button"
        className="group relative w-[380px] h-[220px] sm:h-[250px] overflow-hidden rounded-lg border border-[#e5e5e5] hover:border-[#8b0000] hover:shadow-md transition-colors transition-shadow cursor-pointer"
        onClick={() => onSelect(index)}
      >
        <img
          src={url}
          alt={`${projectTitle} ${index + 1}`}
          className="w-full h-full object-cover transition-shadow group-hover:shadow-md"
        />
        <span className="absolute inset-0 bg-gray-500/40 opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 bg-black/60 px-2 py-2 text-center text-sm leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100 break-words">
          {getImgName(url)}
        </span>
      </button>
    ))}
  </div>;
}
