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
      className="bg-white border-2 border-blue-500 rounded-xl p-8 h-64 cursor-pointer hover:shadow-xl transition flex flex-col"
    >
      {image ? (
        <div className="flex-1 relative">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      ) : (
        <>
          <div className="flex-1">
            <h4 className="font-bold text-2xl mb-3">{title}</h4>
            <p className="text-gray-600 text-base mb-2">{company}</p>
            <p className="text-gray-500 text-sm">{location}</p>
          </div>
          <div className="pt-3 border-t-2 border-gray-200">
            <p className="text-blue-600 font-bold text-lg">{salary}</p>
          </div>
        </>
      )}
    </div>
  );
}
