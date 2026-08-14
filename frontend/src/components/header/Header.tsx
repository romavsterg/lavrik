import { Link } from 'react-router-dom';

const Header = () => {
  return <header className="mt-3 px-3 sm:px-0">
    <div className="flex flex-col items-center gap-2">
      <Link to={'/'} className="no-underline">
        <span className="border-b-4 border-[#5e5e5e] block font-thin text-[28px] sm:text-[36px] text-center text-[#000] leading-tight pb-1">
          <span style={{ color: '#8b0000' }}>N</span>ATALIA<span style={{ color: 'rgb(139, 0, 0)' }}>L</span>AVRIK
        </span>
      </Link>
      <nav>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 list-none m-0 p-0">
          <li><Link to={'/'} className="text-[#000] no-underline text-[15px] sm:text-base hover:text-[#777] uppercase">Главная</Link></li>
          <li><Link to={'/cv'} className="text-[#000] no-underline text-[15px] sm:text-base hover:text-[#777] uppercase">Резюме</Link></li>
          <li className="relative group">
            <Link to={'/portfolio'} className="text-[#000] no-underline text-[15px] sm:text-base hover:text-[#777] uppercase">Интерьеры</Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>;
};

export default Header;
