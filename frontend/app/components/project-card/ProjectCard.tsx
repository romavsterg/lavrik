import { Link } from 'react-router';

export interface Project {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  firstImage: { url: string } | null;
}

export default function ProjectCard({ project }: { project: Project }) {
  return <Link to={`/project/${project.id}`} className="project-card">
    {project.firstImage ? (
      <img src={project.firstImage.url} alt={project.title} />
    ) : (
      <div className="project-image-placeholder">Нет фото</div>
    )}
    <div className="project-info">
      <h2>{project.title}</h2>
    </div>
  </Link>;
}
