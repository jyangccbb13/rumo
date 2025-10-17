import { makeScene2D } from '@motion-canvas/2d';
import { Txt, Layout, Rect } from '@motion-canvas/2d/lib/components';
import { all, createRef, waitFor } from '@motion-canvas/core';
import { easeInOutCubic } from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (view) {
  view.fill('#F8FAFC');

  const titleRef = createRef<Txt>();
  const descRef = createRef<Txt>();
  const progressBar = createRef<Rect>();
  const progressFill = createRef<Rect>();
  const stepContainer = createRef<Layout>();

  view.add(
    <Layout layout direction="column" alignItems="center" gap={40}>
      <Txt
        ref={titleRef}
        text="Student Onboarding"
        fontFamily="Geist Sans, sans-serif"
        fontSize={48}
        fontWeight={600}
        fill="#0F172A"
        opacity={0}
      />
      <Txt
        ref={descRef}
        text="3 quick screens to personalize your college journey"
        fontFamily="Geist Sans, sans-serif"
        fontSize={24}
        fill="#475569"
        opacity={0}
      />

      <Layout y={60} opacity={0} ref={stepContainer}>
        <Rect
          ref={progressBar}
          width={600}
          height={8}
          radius={4}
          fill="#E2E8F0"
        >
          <Rect
            ref={progressFill}
            width={0}
            height={8}
            radius={4}
            fill="#2563EB"
            x={-300}
          />
        </Rect>
      </Layout>
    </Layout>
  );

  yield* all(
    titleRef().opacity(1, 1, easeInOutCubic),
    descRef().opacity(1, 1, easeInOutCubic),
  );

  yield* waitFor(0.3);

  yield* stepContainer().opacity(1, 0.6, easeInOutCubic);

  const steps = [
    { progress: 200, label: 'Academic snapshot' },
    { progress: 400, label: 'Story + dreams' },
    { progress: 600, label: 'Preferences' },
  ];

  for (const step of steps) {
    yield* progressFill().width(step.progress, 1.2, easeInOutCubic);
    yield* waitFor(0.8);
  }

  yield* waitFor(1);

  yield* all(
    titleRef().opacity(0, 0.8, easeInOutCubic),
    descRef().opacity(0, 0.8, easeInOutCubic),
    stepContainer().opacity(0, 0.8, easeInOutCubic),
  );
});
