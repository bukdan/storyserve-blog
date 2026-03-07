interface SpaceBannerProps {
  className?: string;
  label?: string;
}

const SpaceBanner = ({ className = '', label = 'AD SPACE' }: SpaceBannerProps) => {
  return (
    <div
      className={`w-full h-[100px] flex items-center justify-center bg-muted/50 border border-dashed border-border rounded-lg ${className}`}
    >
      <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  );
};

export default SpaceBanner;
