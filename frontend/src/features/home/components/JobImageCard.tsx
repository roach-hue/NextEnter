interface JobImageCardProps {
  image?: string;
  isFavorite?: boolean;
  onClick?: () => void;
}

export default function JobImageCard({ 
  image,
  isFavorite = false,
  onClick 
}: JobImageCardProps) {
  return (
    <div 
      onClick={onClick}
      className="relative bg-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition h-48"
    >
      {image ? (
        <img 
          src={image} 
          alt="Job posting"
          className="w-full h-full object-cover blur-sm"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-base">
          이미지를 추가하세요
        </div>
      )}
      
      {isFavorite && (
        <div className="absolute top-3 right-3">
          <svg 
            className="w-10 h-10 text-yellow-400 fill-current drop-shadow-lg" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}
