import { redirect } from "next/navigation";

export default function MasterNewListingRedirectPage() {
  redirect("/listings/create");
}
