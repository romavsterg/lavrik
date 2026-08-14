import type { Route } from "../+types/contacts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Контакты" },
  ];
}

export default function Contacts() {
  return <div className="text-center mt-4">Контакты</div>
}
