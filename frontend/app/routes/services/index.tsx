import type { Route } from "../+types/services";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Мастерская" },
  ];
}

export default function Services() {
  return <div className="text-center mt-4">Мастерская</div>
}
