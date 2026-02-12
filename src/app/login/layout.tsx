export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`nav, footer { display: none !important; } main { padding-top: 0 !important; }`}</style>
      {children}
    </>
  );
}
