// src/components/RegisterLink.jsx
import { Link } from "react-router-dom";

const LinkCustom = ({ to, children}) => {
  return (
    <Link
      to={to}
      className={`font-semibold text-[#07689F] hover:text-[#FF7E67] transition-colors`}
    >
      {children}
    </Link>
  );
};
export default LinkCustom;
