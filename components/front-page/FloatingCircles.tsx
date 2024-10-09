import React from 'react';
import { motion, MotionStyle, Variants } from 'framer-motion';

const FloatingCircles: React.FC = () => {
  const circleStyle: MotionStyle = {
    display: 'block',
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    position: 'absolute',
  };

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
  };

  const circleVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: ['-20px', '20px'],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 2,
          ease: 'easeInOut',
        },
      },
    },
  };

  return (
    <motion.div
      style={{
        // position: 'relative',
        width: '100%',
        // height: '100vh',
        overflow: 'hidden',
        background: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwNiIgaGVpZ2h0PSIxMjYwIiB2aWV3Qm94PSIwIDAgMTQwNiAxMjYwIiBmaWxsPSIjNEEzQUZGIi8+PGcgb3BhY2l0eT0iMC4zMlAiPjxjYXNlIGN4PSI2NTYuMjk4IiBjeT0iNjQ1Ljg1NSIgcj0iMzk5LjU5MyIgZmlsbD0iIzkyREZGIi8+PC9nPgogPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBmKSkiLz4KIDxncCBmaWx0ZXI9InVybChodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZykiPgogPGYgZmlsdGVyIHVybD0iI2ZpbHRlci0wXyI+CiAgPGNmZmxvdCBmbG93LW9wYWNpdHk9IjAiIHJlc3VsdCIiL0JhY2tncm91bmRJbWFnZUZpeCIvPgogIDxmZSBmbG93LWJsdXIgc3RkRGV2aWNlPSIxMDYuODYiIGV4ZT0iMC4zMlAiIGV4ZWFzeWxpbmU9ZmFsc2UiLz4KIDwvZz4KPC9zdmc+Cg==)',
        backgroundSize: 'cover',
      }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.span
        style={{
          ...circleStyle,
          background: 'rgba(255, 0, 0, 0.3)',
          top: '20%',
          left: '20%',
        }}
        variants={circleVariants}
      />
      <motion.span
        style={{
          ...circleStyle,
          background: 'rgba(0, 255, 0, 0.3)',
          top: '50%',
          left: '50%',
        }}
        variants={circleVariants}
      />
      <motion.span
        style={{
          ...circleStyle,
          background: 'rgba(0, 0, 255, 0.3)',
          bottom: '20%',
          right: '20%',
        }}
        variants={circleVariants}
      />
    </motion.div>
  );
};

export default FloatingCircles;
