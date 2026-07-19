import type { Route } from "../+types/contacts";
import './contacts.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Контакты" },
  ];
}

export default function Contacts() {
  return <main>
    <h1>Контакты</h1>
    <p>Свяжитесь со мной для обсуждения проекта.</p>

    <div className="contact-list">
      <div className="contact-item">
        <h2>Телефон</h2>
        <p>+7 (999) 123-45-67</p>
      </div>
      <div className="contact-item">
        <h2>Email</h2>
        <p>hello@lavrik-design.ru</p>
      </div>
      <div className="contact-item">
        <h2>Telegram</h2>
        <p>@lavrik_design</p>
      </div>
      <div className="contact-item">
        <h2>Instagram</h2>
        <p>@lavrik.interiors</p>
      </div>
    </div>
  </main>;
}
