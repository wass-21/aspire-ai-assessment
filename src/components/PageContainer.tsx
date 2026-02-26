"use client";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 ${className}`}
    >
      {children}
    </div>
  );
}
