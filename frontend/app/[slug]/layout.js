// frontend/app/[slug]/layout.js
export default function OrgLayout({ children, params }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}