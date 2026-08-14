import { Link } from 'react-router-dom';

const Header = () => {
  return <header className="mt-3">
    <div className="flex flex-col items-center gap-2">
      <Link to={'/'} className="no-underline">
        <span className='border-b-4 border-[#5e5e5e] h-12 block font-thin' style={{ fontSize: '36px', textAlign: 'center', color: '#000' }}>
          <span style={{ color: '#8b0000' }}>N</span>ATALIA<span style={{ color: 'rgb(139, 0, 0)' }}>L</span>AVRIK
        </span>
      </Link>
      <nav>
        <ul className="flex gap-6 list-none m-0 p-0">
          <li><Link to={'/'} className="text-[#000] no-underline text-sm hover:text-[#777] uppercase">Главная</Link></li>
          <li><Link to={'/cv'} className="text-[#000] no-underline text-sm hover:text-[#777] uppercase">Резюме</Link></li>
          <li className="relative group">
            <Link to={'/portfolio'} className="text-[#000] no-underline text-sm hover:text-[#777] uppercase">Интерьеры</Link>
          </li>
          <li><Link to={'/services'} className="text-[#000] no-underline text-sm hover:text-[#777] uppercase">Мастерская</Link></li>
          <li><Link to={'/contacts'} className="text-[#000] no-underline text-sm hover:text-[#777] uppercase">Контакты</Link></li>
        </ul>
      </nav>
    </div>
  </header>;
};

export default Header;
