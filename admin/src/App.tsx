import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from './components/login-form/LoginForm';
import ProjectsManager from './components/projects-manager/ProjectsManager';
import ProjectDetail from './components/project-detail/ProjectDetail';
import { me } from './api';

const App = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const checkAuth = async () => {
    try {
      const data = await me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const effect = async () => checkAuth();
    effect()
  }, []);

  if (loading) return <p>Загрузка...</p>;

  if (!user) {
    return <div>
      <h1 className="text-2xl font-semibold mb-6">Админ</h1>
      <LoginForm onLogin={checkAuth} />
    </div>;
  }

  const projectId = searchParams.get('id');

  return <div>
    <h1 className="text-2xl font-semibold mb-6">Админ</h1>
    {projectId ? (
      <ProjectDetail projectId={Number(projectId)} />
    ) : (
      <ProjectsManager />
    )}
  </div>;
};

export default App;
