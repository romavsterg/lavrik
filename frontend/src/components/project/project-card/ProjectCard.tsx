import { Link } from 'react-router-dom';

export interface Project {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  firstImage: { url: string } | null;
}

export default function ProjectCard({ project }: { project: Project }) {
  return <Link to={`/project/${project.id}`} className="block border border-[#e5e5e5] max-w-111 w-full rounded-lg overflow-hidden bg-white no-underline text-inherit hover:no-underline">
    {project.firstImage ? (
      <img src={project.firstImage.url} alt={project.title} className="w-full h-[200px] sm:h-[220px] object-cover block" />
    ) : (
      <div className="w-full h-[200px] sm:h-[220px] flex items-center justify-center bg-[#f5f5f5] text-[#999] text-xl sm:text-2xl">Нет фото</div>
    )}
    <div className="px-3 py-2.5 sm:p-3">
      <h2 className="m-0 text-[17px] sm:text-lg leading-snug">{project.title}</h2>
    </div>
  </Link>;
}
