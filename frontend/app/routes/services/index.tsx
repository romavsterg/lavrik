import type { Route } from "../+types/services";
import ServiceItem from '~/components/service-item';
import type { Service } from '~/components/service-item';

const services: Service[] = [
  { id: 1, title: "Полный дизайн-проект", description: "Разработка концепции, планировка, подбор материалов, авторский надзор." },
  { id: 2, title: "Планировочное решение", description: "Перепланировка, зонирование, расстановка мебели." },
  { id: 3, title: "3D-визуализация", description: "Фотореалистичные изображения будущего интерьера." },
  { id: 4, title: "Подбор материалов и мебели", description: "Работа с поставщиками, составление спецификаций." },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Услуги" },
  ];
}

export default function Services() {
  return <main className="px-6 max-w-[960px] mx-auto py-6">
    <h1 className="text-3xl font-medium m-0 mb-2">Услуги</h1>
    <p className="m-0 mb-4 text-[#333]">Что я предлагаю для создания идеального интерьера вашей квартиры.</p>

    <div className="grid gap-4 mt-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {services.map((service) => (
        <ServiceItem key={service.id} service={service} />
      ))}
    </div>
  </main>;
}
