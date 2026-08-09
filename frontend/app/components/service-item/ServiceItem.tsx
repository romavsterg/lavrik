export interface Service {
  id: number;
  title: string;
  description: string;
}

export default function ServiceItem({ service }: { service: Service }) {
  return <div className="border border-[#e5e5e5] rounded-lg p-5">
    <h2 className="m-0 mb-1 text-base">{service.title}</h2>
    <p className="m-0 text-sm text-[#444]">{service.description}</p>
  </div>;
}
