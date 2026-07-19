export interface Service {
  id: number;
  title: string;
  description: string;
}

export default function ServiceItem({ service }: { service: Service }) {
  return <div className="service-item">
    <h2>{service.title}</h2>
    <p>{service.description}</p>
  </div>;
}
