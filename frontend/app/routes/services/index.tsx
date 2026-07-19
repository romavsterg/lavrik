import type { Route } from "../+types/services";
import ServiceItem from '~/components/service-item';
import type { Service } from '~/components/service-item';
import './services.css';

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
  return <main>
    <h1>Услуги</h1>
    <p>Что я предлагаю для создания идеального интерьера вашей квартиры.</p>

    <div className="service-list">
      {services.map((service) => (
        <ServiceItem key={service.id} service={service} />
      ))}
    </div>
  </main>;
}
