import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/index.tsx"),
  route('/cv', 'routes/cv/index.tsx'),
  route('/portfolio', 'routes/portfolio/index.tsx'),
  route('/services', 'routes/services/index.tsx'),
  route('/contacts', 'routes/contacts/index.tsx'),
  route('/project/:id', 'routes/project/index.tsx')
] satisfies RouteConfig;
