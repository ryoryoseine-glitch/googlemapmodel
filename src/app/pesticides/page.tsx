import { redirect } from "next/navigation";

export default function PesticidesRedirectPage() {
    redirect("/pesticides/search");
}

