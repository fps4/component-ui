'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const AUTO_PLAY_INTERVAL = 6000;
const SWIPE_THRESHOLD = 50;
const IMAGE_DIMMING_COLOR = 'rgba(255,255,255,0.8)';
const IMAGE_ZOOM_SCALE = 1.2;
const IMAGE_ZOOM_ANIMATION = 'carouselImageZoom 16s ease-in-out infinite alternate';

function getItemKey(item, index) {
  if (item?.id) return String(item.id);
  if (item?.title) return `${index}-${item.title}`;
  return String(index);
}

function isExternal(href) {
  return typeof href === 'string' && /^(https?:)?\/\//i.test(href);
}

function resolveLinkProps({ href, external, getLinkProps }) {
  if (typeof getLinkProps === 'function') {
    return getLinkProps({ href, external }) || {};
  }
  return { href };
}

export function ContentCarousel({
  heading,
  items = [],
  LinkComponent,
  getLinkProps,
  sx,
  ...other
}) {
  const theme = useTheme();
  const slides = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items]);
  const slideCount = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchDeltaRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetAutoPlay = useCallback(() => {
    clearTimer();
    if (typeof window === 'undefined' || slideCount < 2) {
      return;
    }
    timerRef.current = window.setInterval(() => {
      setActiveIndex((prev) => ((prev + 1) % slideCount));
    }, AUTO_PLAY_INTERVAL);
  }, [clearTimer, slideCount]);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      clearTimer();
    };
  }, [resetAutoPlay, clearTimer]);

  useEffect(() => {
    if (slideCount > 0 && activeIndex > slideCount - 1) {
      setActiveIndex(0);
    }
  }, [slideCount, activeIndex]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1 >= slideCount ? 0 : prev + 1));
    resetAutoPlay();
  }, [resetAutoPlay, slideCount]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 < 0 ? Math.max(slideCount - 1, 0) : prev - 1));
    resetAutoPlay();
  }, [resetAutoPlay, slideCount]);

  const handleSelect = useCallback(
    (index) => {
      if (index === activeIndex) {
        resetAutoPlay();
        return;
      }

      if (index < 0 || index >= slideCount) {
        return;
      }

      setActiveIndex(index);
      resetAutoPlay();
    },
    [activeIndex, resetAutoPlay, slideCount]
  );

  const handleTouchStart = useCallback((event) => {
    if (!event.touches?.length) {
      return;
    }
    touchStartXRef.current = event.touches[0].clientX;
    touchDeltaRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (touchStartXRef.current === null || !event.touches?.length) {
      return;
    }
    touchDeltaRef.current = event.touches[0].clientX - touchStartXRef.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const delta = touchDeltaRef.current;
    touchStartXRef.current = null;
    touchDeltaRef.current = 0;

    if (Math.abs(delta) < SWIPE_THRESHOLD || slideCount < 2) {
      return;
    }

    if (delta > 0) {
      handlePrev();
    } else {
      handleNext();
    }
  }, [handleNext, handlePrev, slideCount]);

  const currentSlide = slides[activeIndex] ?? null;

  if (!slideCount || !currentSlide) {
    return null;
  }

  const {
    title,
    description,
    image,
    media,
    video,
    backgroundColor,
    href,
    link,
    ctaHref,
    ctaLink,
    ctaLabel,
    ctaText,
    eyebrow,
  } = currentSlide;

  const mediaIsObject = typeof media === 'object' && media !== null;
  const resolvedImage =
    image || (mediaIsObject ? media.image : undefined) || (!mediaIsObject ? media : undefined);
  const resolvedVideo = video || (mediaIsObject ? media.video : undefined);
  const resolvedBackgroundColor =
    backgroundColor || (mediaIsObject ? media.backgroundColor : undefined);
  const resolvedHref = href || link || ctaHref || ctaLink;
  const resolvedCtaLabel = ctaLabel || ctaText || (resolvedHref ? 'Learn more' : '');
  const hasMediaBackground = Boolean(resolvedImage || resolvedVideo);

  const external = isExternal(resolvedHref);
  const CtaComponent = external ? 'a' : LinkComponent || 'a';
  const linkProps = resolvedHref
    ? resolveLinkProps({ href: resolvedHref, external, getLinkProps })
    : {};

  return (
    <Box
      sx={[
        {
          width: '100%',
          my: 6,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container maxWidth="md">
        {heading ? (
          <Typography
            component="h2"
            variant="h4"
            sx={{ textAlign: 'center', mb: 3, fontWeight: 600, color: 'primary.dark' }}
          >
            {heading}
          </Typography>
        ) : null}
      </Container>

      <Container maxWidth={false} disableGutters sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <Fade key={getItemKey(currentSlide, activeIndex)} in timeout={{ enter: 400, exit: 200 }}>
            <Paper
              elevation={3}
              sx={{
                position: 'relative',
                width: '100%',
                px: { xs: 4, md: 10 },
                py: { xs: 8, md: 10 },
                display: 'flex',
                alignItems: 'center',
                minHeight: { xs: 360, md: 420 },
                overflow: 'hidden',
                bgcolor: 'transparent',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                }}
              >
                {resolvedVideo ? (
                  <Box
                    component="video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={resolvedImage}
                    src={resolvedVideo}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : null}

                {!resolvedVideo && resolvedImage ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${resolvedImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transformOrigin: 'center',
                      animation: IMAGE_ZOOM_ANIMATION,
                      willChange: 'transform',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: IMAGE_DIMMING_COLOR,
                      },
                      '@keyframes carouselImageZoom': {
                        '0%': { transform: 'scale(1)' },
                        '100%': { transform: `scale(${IMAGE_ZOOM_SCALE})` },
                      },
                    }}
                  />
                ) : null}

                {!hasMediaBackground ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: resolvedBackgroundColor || 'transparent',
                    }}
                  />
                ) : null}
              </Box>
              <Stack
                spacing={2}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  maxWidth: '100%',
                  textAlign: { xs: 'center', md: 'left' },
                  mx: { xs: 'auto', md: 0 },
                  px: { xs: 1.5, md: 3 },
                }}
              >
                {eyebrow ? (
                  <Typography
                    variant="overline"
                    color="grey.700"
                    sx={{ letterSpacing: 2, textTransform: 'uppercase' }}
                  >
                    {eyebrow}
                  </Typography>
                ) : null}

                {title ? (
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: theme.typography.fontSecondaryFamily,
                      ...theme.mixins.textGradient(
                        `300deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.warning.main} 25%, ${theme.vars.palette.primary.main} 50%, ${theme.vars.palette.warning.main} 75%, ${theme.vars.palette.primary.main} 100%`
                      ),
                      backgroundSize: '400%',
                      animation: 'carouselHeadingGradient 20s linear infinite alternate',
                      '@keyframes carouselHeadingGradient': {
                        '0%': { backgroundPosition: '0% center' },
                        '100%': { backgroundPosition: '200% center' },
                      },
                    }}
                  >
                    {title}
                  </Typography>
                ) : null}

                {description ? (
                  <Typography
                    variant="h4"
                    color="grey.700"
                    sx={{ opacity: hasMediaBackground ? 0.92 : 1 }}
                  >
                    {description}
                  </Typography>
                ) : null}

                {resolvedHref && resolvedCtaLabel ? (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent={{ xs: 'center', md: 'flex-start' }}
                  >
                    <Button
                      component={CtaComponent}
                      variant="contained"
                      sx={(muiTheme) => ({
                        color: muiTheme.palette.text.primary,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        border: `1px solid ${muiTheme.palette.grey[600]}`,
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          borderColor: muiTheme.palette.grey[600],
                          boxShadow: 'none',
                        },
                      })}
                      {...linkProps}
                    >
                      {resolvedCtaLabel}
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          </Fade>

          {slideCount > 1 ? (
            <>
              <IconButton
                aria-label="Previous slide"
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: { xs: 8, md: 16 },
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.1)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>

              <IconButton
                aria-label="Next slide"
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: { xs: 8, md: 16 },
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.1)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </>
          ) : null}
        </Box>

        {slideCount > 1 ? (
          <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mt: 2 }}>
            {slides.map((item, index) => (
              <IconButton
                key={getItemKey(item, index)}
                aria-label={`Go to slide ${index + 1}`}
                size="small"
                onClick={() => handleSelect(index)}
                sx={{
                  color: index === activeIndex ? 'text.primary' : 'text.disabled',
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
              >
                <FiberManualRecordIcon sx={{ fontSize: index === activeIndex ? 12 : 9 }} />
              </IconButton>
            ))}
          </Stack>
        ) : null}
      </Container>
    </Box>
  );
}

export default ContentCarousel;
