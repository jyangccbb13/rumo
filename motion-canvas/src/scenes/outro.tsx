import { makeScene2D } from '@motion-canvas/2d';
import { Txt, Layout, Rect } from '@motion-canvas/2d/lib/components';
import { all, createRef, waitFor } from '@motion-canvas/core';
import { easeInOutCubic } from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (view) {
  view.fill('#0F172A');

  const container = createRef<Layout>();
  const titleRef = createRef<Txt>();
  const subtitleRef = createRef<Txt>();
  const ctaRef = createRef<Txt>();
  const accentRef = createRef<Rect>();

  view.add(
    <Layout
      ref={container}
      layout
      direction="column"
      alignItems="center"
      gap={40}
      opacity={0}
    >
      <Txt
        ref={titleRef}
        text="rumo"
        fontFamily="Geist Sans, sans-serif"
        fontSize={96}
        fontWeight={700}
        fill="#F8FAFC"
        letterSpacing={12}
      />

      <Rect
        ref={accentRef}
        width={160}
        height={5}
        radius={3}
        fill="#2563EB"
        scaleX={0}
      />

      <Txt
        ref={subtitleRef}
        text="Your direction. Your timeline. Your success."
        fontFamily="Geist Sans, sans-serif"
        fontSize={28}
        fill="#CBD5F5"
        y={40}
      />

      <Txt
        ref={ctaRef}
        text="Built for the 2025 hackathon sprint"
        fontFamily="Geist Sans, sans-serif"
        fontSize={18}
        fill="#93C5FD"
        y={100}
      />
    </Layout>
  );

  yield* container().opacity(1, 1, easeInOutCubic);

  yield* waitFor(0.3);

  yield* accentRef().scaleX(1, 0.8, easeInOutCubic);

  yield* waitFor(3);

  yield* container().opacity(0, 1.5, easeInOutCubic);
});
