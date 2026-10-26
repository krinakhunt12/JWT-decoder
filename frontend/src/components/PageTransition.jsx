export default function PageTransition({ children }) {
  return (
    <div className="w-full flex-1 flex flex-col animate-page-enter">
      {children}
    </div>
  );
}
