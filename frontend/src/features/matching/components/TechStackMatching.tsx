interface TechSkill {
  name: string;
  match: number;
}

interface TechStackMatchingProps {
  skills: TechSkill[];
}

export default function TechStackMatching({ skills }: TechStackMatchingProps) {
  return (
    <div className="p-6 bg-white border-2 border-blue-400 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💻</span>
        <h3 className="text-xl font-bold text-blue-600">기술 스택 매칭률</h3>
      </div>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{skill.name}</span>
              <span className="font-bold text-blue-600">{skill.match}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className={`h-3 rounded-full transition-all ${
                  skill.match >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${skill.match}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { TechSkill };
