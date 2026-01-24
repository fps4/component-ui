'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'object') return Object.values(value).filter(Boolean);
  return [];
}

function isExternal(href) {
  return typeof href === 'string' && /^(https?:)?\/\//i.test(href);
}

function resolveHref(rawHref, lang) {
  if (!rawHref) return null;

  const href = String(rawHref).trim();
  if (!href) return null;

  if (href.startsWith('#')) return href;
  if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }

  if (href.startsWith('/')) {
    if (/^\/[a-z]{2}\//i.test(href)) {
      return href;
    }
    if (lang) {
      return `/${lang}${href}`.replace(/\/{2,}/g, '/');
    }
    return href.replace(/\/{2,}/g, '/');
  }

  const prefix = lang ? `/${lang}/` : '/';
  return `${prefix}${href}`.replace(/\/{2,}/g, '/');
}

function resolveLinkProps({ href, external, getLinkProps }) {
  if (typeof getLinkProps === 'function') {
    return getLinkProps({ href, external }) || {};
  }
  return { href };
}

export default function CtaButtons({
  items,
  lang,
  LinkComponent,
  getLinkProps,
  onAction,
  isActionDisabled,
  sx,
  ...other
}) {
  const buttons = asArray(items)
    .map((item, index) => {
      const label = item?.label || item?.ctaLabel;
      const href = resolveHref(item?.href || item?.ctaHref || item?.link, lang);

      if (!label || !href) {
        return null;
      }

      return {
        key: item?.id ?? `${index}-${label}`,
        label,
        href,
        external: isExternal(href),
        action: item?.action || item?.type,
        categoryId: item?.categoryId,
      };
    })
    .filter(Boolean);

  if (!buttons.length) return null;

  const shouldTriggerAction = (button) => Boolean(onAction && button.action);

  const handleClick = (button) => (event) => {
    if (!shouldTriggerAction(button)) return;
    event.preventDefault();
    onAction?.(button);
  };

  return (
    <Box
      sx={[
        { width: '100%', my: { xs: 4, md: 6 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container sx={{ display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center">
          {buttons.map((button) => {
            const disabled = isActionDisabled?.(button) ?? false;
            const Component = shouldTriggerAction(button)
              ? 'button'
              : button.external
                ? 'a'
                : LinkComponent || 'a';
            const linkProps = shouldTriggerAction(button)
              ? {}
              : resolveLinkProps({
                  href: button.href,
                  external: button.external,
                  getLinkProps,
                });

            return (
              <Button
                key={button.key}
                variant="contained"
                color="primary"
                component={Component}
                sx={{ borderRadius: 999 }}
                {...(shouldTriggerAction(button)
                  ? { onClick: handleClick(button) }
                  : linkProps)}
                disabled={disabled}
                size="large"
              >
                {button.label}
              </Button>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
}
