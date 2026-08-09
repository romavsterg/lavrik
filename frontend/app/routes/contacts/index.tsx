import type { Route } from "../+types/contacts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Контакты" },
  ];
}

export default function Contacts() {
  return <main className="px-6 max-w-[960px] mx-auto py-6">
    <h1 className="text-3xl font-medium m-0 mb-2">Контакты</h1>
    <p className="m-0 mb-4 text-[#333]">Свяжитесь со мной для обсуждения проекта.</p>

    <div className="grid gap-4 mt-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      <div className="border border-[#e5e5e5] rounded-lg p-5">
        <h2 className="m-0 mb-1 text-base">Телефон</h2>
        <p className="m-0 text-sm text-[#1a1a1a]">+7 (999) 123-45-67</p>
      </div>
      <div className="border border-[#e5e5e5] rounded-lg p-5">
        <h2 className="m-0 mb-1 text-base">Email</h2>
        <p className="m-0 text-sm text-[#1a1a1a]">hello@lavrik-design.ru</p>
      </div>
      <div className="border border-[#e5e5e5] rounded-lg p-5">
        <h2 className="m-0 mb-1 text-base">Telegram</h2>
        <p className="m-0 text-sm text-[#1a1a1a]">@lavrik_design</p>
      </div>
      <div className="border border-[#e5e5e5] rounded-lg p-5">
        <h2 className="m-0 mb-1 text-base">Instagram</h2>
        <p className="m-0 text-sm text-[#1a1a1a]">@lavrik.interiors</p>
      </div>
    </div>
  </main>;
}
