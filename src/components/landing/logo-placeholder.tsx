interface LogoPlaceholderProps {
  name: string;
  className?: string;
}

export function LogoPlaceholder({ name, className }: LogoPlaceholderProps) {
  return (
    <span
      className={`inline-flex items-center text-base font-bold text-primary ${
        className ?? ''
      }`}
    >
      {name}
    </span>
  );
}
