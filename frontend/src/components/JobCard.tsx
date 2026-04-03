interface JobCardProps {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  image?: string;
  onClick?: () => void;
}

export default function JobCard({ 
  title = "공고 제목", 
  company = "회사명",
  location = "지역",
  salary = "급여",
  image,
  onClick 
}: JobCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border-2 border-blue-500 rounded-lg p-6 h-48 cursor-pointer hover:shadow-lg transition flex flex-col"
    >
      {image ? (
        <div className="flex-1 relative">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover rounded"
          />
        </div>
      ) : (
        <>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-2">{title}</h4>
            <p className="text-gray-600 text-sm mb-1">{company}</p>
            <p className="text-gray-500 text-xs">{location}</p>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-blue-600 font-semibold">{salary}</p>
          </div>
        </>
      )}
    </div>
  );
}
