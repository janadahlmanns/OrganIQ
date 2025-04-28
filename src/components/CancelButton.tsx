import { Link } from 'react-router-dom';
import cancelIcon from '../assets/images/icons/cancel_icon.png';

type CancelButtonProps = {
  to?: string;          // default target route ("/")
  className?: string;   // extra styling
  onClick?: () => void; // 🆕 optional cancel handler
};

export default function CancelButton({ to = "/", className = "", onClick }: CancelButtonProps) {
  return (
    <Link
      to={to}
      className={`btn-utility w-10 h-10 p-1 hover:drop-shadow-inner-glowWhite transition ${className}`}
      onClick={onClick}
    >
      <img src={cancelIcon} alt="Cancel" className="w-full h-full object-contain" />
    </Link>
  );
}
