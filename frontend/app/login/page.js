import OrganizationLoginForm from "@/components/public/OrganizationLoginForm";

export const metadata = {
  title: "Sign in | Fast-Ex",
  description: "Sign in to your Fast-Ex organization workspace.",
};

export default async function LoginPage({ searchParams }) {
  const query = await searchParams;
  return <OrganizationLoginForm registered={query?.registered === "1"} />;
}
