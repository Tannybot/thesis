type AppLogoProps = {
  size?: number;
};

export default function AppLogo({ size = 46 }: AppLogoProps) {
  return (
    <img
      src="/app-logo.png"
      alt="HerdScan logo"
      className="brand-logo"
      style={{ width: size, height: size }}
    />
  );
}
