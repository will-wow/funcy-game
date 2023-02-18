export interface CenterProps {
  className?: string;
  children: React.ReactNode;
}

export function Center({ className, children }: CenterProps) {
  return (
    <div className={`${className} flex flex-col justify-center items-center`}>
      {children}
    </div>
  );
}
