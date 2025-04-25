import { Link } from 'react-router-dom';
import cancelIcon from '../assets/images/icons/cancel_icon.png';

type CancelButtonProps = {
  to?: string; // target route
  className?: string; // optional extra styling
};

export default function CancelButton({ to = "/", className = "" }: CancelButtonProps) {
  return (
    <Link
      to={to}
      className={`btn-utility w-10 h-10 p-1 hover:drop-shadow-[0_0_4px_white] transition ${className}`}
    >
      <img src={cancelIcon} alt="Cancel" className="w-full h-full object-contain" />
    </Link>
  );
}
