import { createClient } from "@/utils/supabase/server";
import { Icon } from "@chakra-ui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      <form action={signOut}>
        <button className="py-2 px-4 text-red-400 flex flex-row items-center gap-2 rounded-md no-underline ">
          <FiLogOut />
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Login
    </Link>
  );
}
