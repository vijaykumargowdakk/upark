import AuthButton from "@/components/AuthButton";
import UserNavbar from "@/components/UserNavbar";
import { TbParking } from "react-icons/tb";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full flex flex-row ">
      <div className="hidden md:block w-full max-w-[220px] fixed ">
        <nav className="w-full flex flex-col  border-r min-h-screen bg-[#1a1a1a] items-center justify-between  border-r-foreground/10 h-16">
          <div>
            <h1 className="text-2xl flex flex-row items-center gap-2 font-bold m-8">
             <TbParking />  UPARK 
            </h1>
            <UserNavbar />
          </div>
          <div className="mb-4">
            <AuthButton />
          </div>
        </nav>
      </div>
      <div className="md:ml-[220px] w-full">{children}</div>
    </div>
  );
}
