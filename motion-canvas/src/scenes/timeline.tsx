import { makeScene2D } from '@motion-canvas/2d';
import { Txt, Layout, Circle, Rect } from '@motion-canvas/2d/lib/components';
import { all, createRef, waitFor, sequence } from '@motion-canvas/core';
import { easeInOutCubic, easeOutCubic } from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (view) {
  view.fill('#F8FAFC');

  const titleRef = createRef<Txt>();
  const timelineContainer = createRef<Layout>();
  const timelineLineRef = createRef<Rect>();

  view.add(
    <Layout layout direction="column" alignItems="center" gap={80}>
      <Txt
        ref={titleRef}
        text="Timeline — Visualize Your Journey"
        fontFamily="Geist Sans, sans-serif"
        fontSize={48}
        fontWeight={600}
        fill="#0F172A"
        opacity={0}
      />

      <Layout
        ref={timelineContainer}
        layout
        direction="row"
        alignItems="center"
        gap={120}
        opacity={0}
      >
        <Rect
          ref={timelineLineRef}
          width={0}
          height={3}
          fill="#2563EB"
          opacity={0.6}
          x={0}
          y={-180}
        />
      </Layout>
    </Layout>
  );

  yield* titleRef().opacity(1, 1, easeInOutCubic);
  yield* waitFor(0.5);

  yield* timelineContainer().opacity(1, 0.8, easeInOutCubic);

  yield* timelineLineRef().width(800, 1.5, easeOutCubic);

  const tasks = [
    { label: 'Personal Statement', color: '#EC4899', date: 'Apr 10' },
    { label: 'Teacher Rec', color: '#10B981', date: 'Apr 15' },
    { label: 'Common App', color: '#8B5CF6', date: 'Apr 24' },
    { label: 'Scholarships', color: '#F59E0B', date: 'May 1' },
  ];

  const taskNodes: Array<{ node: ReturnType<typeof createRef>, label: ReturnType<typeof createRef>, date: ReturnType<typeof createRef> }> = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const nodeRef = createRef<Circle>();
    const labelRef = createRef<Txt>();
    const dateRef = createRef<Txt>();

    const xPos = -360 + i * 240;

    timelineContainer().add(
      <>
        <Circle
          ref={nodeRef}
          width={48}
          height={48}
          fill={task.color}
          opacity={0}
          scale={0}
          x={xPos}
          y={-180}
        >
          <Txt
            text={`${i + 1}`}
            fontFamily="Geist Sans, sans-serif"
            fontSize={20}
            fontWeight={700}
            fill="#FFFFFF"
          />
        </Circle>
        <Txt
          ref={dateRef}
          text={task.date}
          fontFamily="Geist Sans, sans-serif"
          fontSize={14}
          fontWeight={600}
          fill="#475569"
          opacity={0}
          x={xPos}
          y={-260}
        />
        <Txt
          ref={labelRef}
          text={task.label}
          fontFamily="Geist Sans, sans-serif"
          fontSize={18}
          fontWeight={500}
          fill="#0F172A"
          opacity={0}
          x={xPos}
          y={-80}
        />
      </>
    );

    taskNodes.push({ node: nodeRef, label: labelRef, date: dateRef });
  }

  yield* sequence(
    0.2,
    ...taskNodes.map(({ node, label, date }) =>
      all(
        node().opacity(1, 0.4, easeInOutCubic),
        node().scale(1, 0.4, easeOutCubic),
        date().opacity(1, 0.4, easeInOutCubic),
        label().opacity(1, 0.4, easeInOutCubic),
      )
    )
  );

  yield* waitFor(2);

  yield* all(
    titleRef().opacity(0, 0.8, easeInOutCubic),
    timelineContainer().opacity(0, 0.8, easeInOutCubic),
  );
});
