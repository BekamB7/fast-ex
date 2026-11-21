import OrganizationLoginForm from "@/components/public/OrganizationLoginForm";

export default async function DashboardLoginPage({ searchParams }) {
  const query = await searchParams;
  return <OrganizationLoginForm registered={query?.registered === "1"} />;
}
