import { makeScene2D } from '@motion-canvas/2d';
import { Txt, Layout, Rect } from '@motion-canvas/2d/lib/components';
import { all, createRef, waitFor } from '@motion-canvas/core';
import { easeInOutCubic } from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (view) {
  view.fill('#F8FAFC');

  const titleRef = createRef<Txt>();
  const subtitleRef = createRef<Txt>();
  const accentRef = createRef<Rect>();

  view.add(
    <Layout layout direction="column" alignItems="center" gap={60}>
      <Txt
        ref={titleRef}
        text="rumo"
        fontFamily="Geist Sans, sans-serif"
        fontSize={120}
        fontWeight={700}
        fill="#0F172A"
        letterSpacing={12}
        opacity={0}
        scale={0.9}
      />

      <Rect
        ref={accentRef}
        width={200}
        height={6}
        radius={3}
        fill="#2563EB"
        opacity={0}
        scaleX={0}
      />

      <Txt
        ref={subtitleRef}
        text="Your college journey in one place"
        fontFamily="Geist Sans, sans-serif"
        fontSize={32}
        fill="#475569"
        opacity={0}
        y={40}
      />
    </Layout>
  );

  yield* all(
    titleRef().opacity(1, 1.5, easeInOutCubic),
    titleRef().scale(1, 1.5, easeInOutCubic),
  );

  yield* all(
    accentRef().opacity(1, 0.6, easeInOutCubic),
    accentRef().scale.x(1, 0.8, easeInOutCubic),
  );

  yield* subtitleRef().opacity(1, 1, easeInOutCubic);

  yield* waitFor(2);

  yield* all(
    titleRef().opacity(0, 1, easeInOutCubic),
    accentRef().opacity(0, 1, easeInOutCubic),
    subtitleRef().opacity(0, 1, easeInOutCubic),
  );
});
