import { useEffect, useState } from 'react';

/**
 * Preload off the button. A failed or blocked image is omitted, so the
 * control stays text-only and never shows a broken-image icon.
 */
export function Thumbnail({ url }: { url: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    const show = () => {
      setVisible(true);
    };
    const hide = () => {
      setVisible(false);
    };
    image.addEventListener('load', show);
    image.addEventListener('error', hide);
    image.src = url;
    return () => {
      image.removeEventListener('load', show);
      image.removeEventListener('error', hide);
    };
  }, [url]);

  if (!visible) {
    return null;
  }

  return (
    <img
      alt=""
      className="size-16 shrink-0 bg-stage object-cover"
      draggable={false}
      height={64}
      referrerPolicy="no-referrer"
      src={url}
      width={64}
    />
  );
}
