type ProjectImageModalProps = {
  imageUrl: string;
  imageName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function ProjectImageModal({ imageUrl, imageName, onClose, onPrev, onNext }: ProjectImageModalProps) {
  return <div
    className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center"
    onClick={onClose}
  >
    <button
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className="absolute right-3 sm:right-6 top-3 sm:top-6 h-10 w-10 rounded-full bg-white/90 text-2xl leading-none text-black hover:bg-white"
      aria-label="Закрыть"
    >
      ×
    </button>

    <button
      onClick={(event) => {
        event.stopPropagation();
        onPrev();
      }}
      className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 text-2xl sm:text-3xl leading-none text-black hover:bg-white"
      aria-label="Предыдущее изображение"
    >
      ‹
    </button>

    <div className="flex flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
      <img
        src={imageUrl}
        alt="Увеличенное изображение"
        className="!max-w-[95vw] max-h-[80vh] sm:max-h-[97.5vh] w-auto h-auto object-contain shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
      />
      <p className="m-0 max-w-[95vw] text-center text-white break-words">
        {imageName}
      </p>
    </div>

    <button
      onClick={(event) => {
        event.stopPropagation();
        onNext();
      }}
      className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/90 text-2xl sm:text-3xl leading-none text-black hover:bg-white"
      aria-label="Следующее изображение"
    >
      ›
    </button>
  </div>;
}
