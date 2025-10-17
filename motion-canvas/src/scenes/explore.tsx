import { makeScene2D } from '@motion-canvas/2d';
import { Txt, Layout, Rect } from '@motion-canvas/2d/lib/components';
import { all, createRef, waitFor, sequence } from '@motion-canvas/core';
import { easeInOutCubic, easeOutBack } from '@motion-canvas/core/lib/tweening';

export default makeScene2D(function* (view) {
  view.fill('#F8FAFC');

  const titleRef = createRef<Txt>();
  const descRef = createRef<Txt>();
  const cardsContainer = createRef<Layout>();

  view.add(
    <Layout layout direction="column" alignItems="center" gap={60}>
      <Txt
        ref={titleRef}
        text="Explore Schools"
        fontFamily="Geist Sans, sans-serif"
        fontSize={48}
        fontWeight={600}
        fill="#0F172A"
        opacity={0}
      />
      <Txt
        ref={descRef}
        text="Search like a college counselor — BigFuture-style data"
        fontFamily="Geist Sans, sans-serif"
        fontSize={24}
        fill="#475569"
        opacity={0}
      />

      <Layout
        ref={cardsContainer}
        layout
        direction="row"
        gap={40}
        y={80}
        opacity={0}
      />
    </Layout>
  );

  yield* all(
    titleRef().opacity(1, 1, easeInOutCubic),
    descRef().opacity(1, 1, easeInOutCubic),
  );

  yield* waitFor(0.5);

  yield* cardsContainer().opacity(1, 0.6, easeInOutCubic);

  const schools = [
    { name: 'Harvard', acceptance: '3.4%', color: '#DC2626' },
    { name: 'Stanford', acceptance: '3.7%', color: '#DC2626' },
    { name: 'MIT', acceptance: '4.0%', color: '#DC2626' },
  ];

  const cardRefs: ReturnType<typeof createRef>[] = [];

  for (const school of schools) {
    const cardRef = createRef<Rect>();

    cardsContainer().add(
      <Rect
        ref={cardRef}
        width={280}
        height={200}
        radius={24}
        fill="#FFFFFF"
        stroke="#E2E8F0"
        lineWidth={1}
        shadowColor="rgba(15, 23, 42, 0.12)"
        shadowBlur={24}
        opacity={0}
        scale={0.9}
        layout
        direction="column"
        padding={30}
        gap={20}
      >
        <Txt
          text={school.name}
          fontFamily="Geist Sans, sans-serif"
          fontSize={28}
          fontWeight={600}
          fill="#0F172A"
        />
        <Layout layout direction="column" gap={10}>
          <Txt
            text="Acceptance Rate"
            fontFamily="Geist Sans, sans-serif"
            fontSize={12}
            fill="#64748B"
            textTransform="uppercase"
            letterSpacing={2}
          />
          <Txt
            text={school.acceptance}
            fontFamily="Geist Sans, sans-serif"
            fontSize={24}
            fontWeight={700}
            fill={school.color}
          />
        </Layout>
      </Rect>
    );

    cardRefs.push(cardRef);
  }

  yield* sequence(
    0.15,
    ...cardRefs.map((card) =>
      all(
        card().opacity(1, 0.6, easeInOutCubic),
        card().scale(1, 0.6, easeOutBack),
      )
    )
  );

  yield* waitFor(2);

  yield* all(
    titleRef().opacity(0, 0.8, easeInOutCubic),
    descRef().opacity(0, 0.8, easeInOutCubic),
    cardsContainer().opacity(0, 0.8, easeInOutCubic),
  );
});
