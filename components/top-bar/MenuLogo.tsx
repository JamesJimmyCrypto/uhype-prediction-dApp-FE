import Logo from "../icons/ZeitgeistIcon";
import Link from "next/link";

const MenuLogo = () => {
  return (
    <div className="flex items-center gap-4">
      <Logo variant={"light"} />
      <>
        <div className="hidden flex-col md:flex">
          <h1 className={`font-kanit text-xl text-white `}>Dehype</h1>
        </div>
      </>
    </div>
  );
};

export default MenuLogo;
