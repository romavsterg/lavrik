import { Link } from 'react-router-dom';

export interface Project {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  firstImage: { url: string } | null;
}

export default function ProjectCard({ project }: { project: Project }) {
  return <Link to={`/project/${project.id}`} className="block border border-[#e5e5e5] rounded-lg overflow-hidden bg-white no-underline text-inherit hover:no-underline">
    {project.firstImage ? (
      <img src={project.firstImage.url} alt={project.title} className="w-full h-[220px] object-cover block" />
    ) : (
      <div className="w-full h-[220px] flex items-center justify-center bg-[#f5f5f5] text-[#999] text-sm">Нет фото</div>
    )}
    <div className="p-4">
      <h2 className="m-0 mb-2 text-lg">{project.title}</h2>
    </div>
  </Link>;
}
