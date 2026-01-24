'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'object') return Object.values(value).filter(Boolean);
  return [];
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

export default function PageLinks({
  heading,
  items,
  LinkComponent,
  getLinkProps,
  onCopy,
  sx,
  ...other
}) {
  const links = asArray(items);

  const handleCopy = useCallback(
    (event) => {
      event.preventDefault();
      if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => onCopy?.())
          .catch(() => {});
      }
    },
    [onCopy]
  );

  if (!links.length) return null;

  return (
    <Box
      sx={[
        { width: '100%', my: { xs: 4, md: 4 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container sx={{ display: 'block' }}>
        <Box sx={{ mx: 'auto', maxWidth: 640, width: '100%' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {links.map((item, index) => {
              const key = item?.id ?? `${index}-${item?.ctaLabel ?? 'link'}`;
              const icon = item?.icon || item?.image || item?.media;
              const label = item?.ctaLabel || 'Link';
              const href = item?.ctaHref || item?.href || item?.link || '#';
              const external = isExternal(href);
              const isCopy = href === '#';
              const Component = isCopy ? 'button' : external ? 'a' : LinkComponent || 'a';
              const linkProps = isCopy
                ? { onClick: handleCopy }
                : resolveLinkProps({ href, external, getLinkProps });

              const button = (
                <IconButton
                  aria-label={label}
                  component={Component}
                  {...linkProps}
                  sx={(theme) => ({
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    p: 0,
                    bgcolor: theme.palette.common.white,
                    boxShadow: 'none',
                    transition: theme.transitions.create(['transform', 'box-shadow'], {
                      duration: theme.transitions.duration.shortest,
                    }),
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: theme.palette.common.white,
                      boxShadow:
                        theme.customShadows?.z8 ?? '0px 8px 16px rgba(145, 158, 171, 0.24)',
                    },
                  })}
                >
                  {icon ? (
                    <Box
                      component="img"
                      alt={label}
                      src={icon}
                      sx={{ width: 38, height: 38, objectFit: 'contain', display: 'block' }}
                    />
                  ) : null}
                </IconButton>
              );

              return (
                <Tooltip key={key} title={label} arrow>
                  {button}
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
