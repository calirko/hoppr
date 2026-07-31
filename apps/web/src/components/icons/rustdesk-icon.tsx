import type { SVGProps } from 'react';
import rustdeskSvgRaw from '../../../public/rustdesk.svg?raw';

const RUSTDESK_SVG_INNER = rustdeskSvgRaw
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

interface RustDeskIconProps
  extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number | string;
}

export function RustDeskIcon({ size = '1em', ...props }: RustDeskIconProps) {
  return (
    <svg
      viewBox="0 0 700 700"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static, locally-owned SVG asset
      dangerouslySetInnerHTML={{ __html: RUSTDESK_SVG_INNER }}
    />
  );
}
