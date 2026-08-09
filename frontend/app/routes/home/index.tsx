import type { Route } from "../+types/home";
import Carousel from '~/components/carousel';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Наталия Лаврик" },
  ];
}

export default function Home() {
  return <main className="px-6 max-w-[960px] mx-auto py-6">
    <section className="mt-8 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <Carousel />
    </section>
    <p className="mt-6 border-b-4 border-[#5e5e5e] h-12 w-fit ml-auto mr-auto block font-thin" style={{ fontSize: '36px', textAlign: 'center', color: '#000' }}>
      <span style={{ color: 'rgb(139, 0, 0)' }}>Н</span>АТАЛЬЯ <span style={{ color: 'rgb(139, 0, 0)' }}>Л</span>АВРИК
    </p>
  </main>;
}
