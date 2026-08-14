import Carousel from '../../components/carousel';

export default function Home() {
  return <main className="px-4 sm:px-6 max-w-[960px] mx-auto py-6">
    <section className="mt-3 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <Carousel />
    </section>
    <p className="mt-6 border-b-4 border-[#5e5e5e] w-fit ml-auto mr-auto block font-thin text-[28px] sm:text-[36px] text-center text-[#000] leading-tight pb-1">
      <span style={{ color: 'rgb(139, 0, 0)' }}>Н</span>АТАЛЬЯ <span style={{ color: 'rgb(139, 0, 0)' }}>Л</span>АВРИК
    </p>
  </main>;
}
