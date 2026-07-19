import { Link } from 'react-router';
import './header.css'

const Header = () => {
  return <header>
    <nav>
      <ul className='flex gap-2 list-none'>
        <li><Link to={'/'}>Главная</Link></li>
        <li><Link to={'/portfolio'}>Портфолио</Link></li>
        <li><Link to={'/services'}>Услуги</Link></li>
        <li><Link to={'/contacts'}>Контакты</Link></li>
      </ul>
    </nav>
  </header>;
};

export default Header;
