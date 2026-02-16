'use client';

import { Children, isValidElement, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import rehypeSlug from 'rehype-slug';
import ReactMarkdown from 'react-markdown';

export const MARKDOWN_PRESETS = {
  BASE: 'base',
  FPS4_HOME: 'fps4-home',
  FPS4_PAGE: 'fps4-page',
};
const VALID_PRESETS = new Set(Object.values(MARKDOWN_PRESETS));
const YOUTUBE_VIDEO_ID_REGEX = /^[\w-]{11}$/;

const homeHeadingStyles = {
  h1: { margin: '2rem 0 1rem', fontSize: '2.25rem', fontWeight: 700, color: 'inherit' },
  h2: { margin: '2rem 0 1rem', fontSize: '1.5rem', fontWeight: 600, color: 'inherit' },
};

function hasNestedLink(children) {
  let found = false;

  Children.forEach(children, (child) => {
    if (found || child == null) {
      return;
    }

    if (!isValidElement(child)) {
      return;
    }

    if (child.type === 'a' || child.type === Link) {
      found = true;
      return;
    }

    if (child.props?.children && hasNestedLink(child.props.children)) {
      found = true;
    }
  });

  return found;
}

function getHomeComponents() {
  return {
    a: ({ href, children }) => (
      <Link href={href} underline="hover">
        {children}
      </Link>
    ),
    h1: ({ node, children, ...props }) => {
      const id = node?.properties?.id;
      const canWrapWithAnchor = id && !hasNestedLink(children);
      return (
        <h1 id={id} style={homeHeadingStyles.h1} {...props}>
          {canWrapWithAnchor ? (
            <a href={`#${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {children}
            </a>
          ) : (
            children
          )}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      const id = node?.properties?.id;
      const canWrapWithAnchor = id && !hasNestedLink(children);
      return (
        <h2 id={id} style={homeHeadingStyles.h2} {...props}>
          {canWrapWithAnchor ? (
            <a href={`#${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {children}
            </a>
          ) : (
            children
          )}
        </h2>
      );
    },
    ul: ({ children }) => (
      <ul style={{ paddingLeft: 24, marginBottom: 16, listStyleType: 'disc' }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: 24, marginBottom: 16, listStyleType: 'decimal' }}>{children}</ol>
    ),
    li: ({ children, ...props }) => (
      <li style={{ paddingLeft: 8, marginBottom: 4, display: 'list-item' }} {...props}>
        {children}
      </li>
    ),
  };
}

function resolveYouTubeId(src, lang, fallbackLang, youtubeMap) {
  if (!src || !youtubeMap) return null;

  const referenceName = String(src).trim();
  const entry = youtubeMap[referenceName];

  if (!entry) return null;
  if (typeof entry === 'string') return entry;

  const languageVideoId = entry?.[lang] || entry?.[fallbackLang];
  if (languageVideoId) return languageVideoId;

  const firstAvailableVideoId = Object.values(entry).find((value) => typeof value === 'string');
  return firstAvailableVideoId || null;
}

function getPageComponents({ lang, fallbackLang, youtubeMap }) {
  return {
    p: ({ node, children }) => {
      const onlyChildIsImage =
        node?.children &&
        node.children.length === 1 &&
        node.children[0]?.tagName === 'img';

      if (onlyChildIsImage) {
        // Avoid wrapping block-level media in paragraph tags.
        return <Box sx={{ my: 2 }}>{children}</Box>;
      }

      return (
        <Typography component="p" sx={{ mb: 2 }}>
          {children}
        </Typography>
      );
    },
    a: ({ href, children }) => (
      <Link href={href} underline="hover">
        {children}
      </Link>
    ),
    ul: ({ children }) => (
      <List sx={{ pl: 3, mb: 2, listStyleType: 'disc' }} component="ul">
        {children}
      </List>
    ),
    ol: ({ children }) => (
      <List sx={{ pl: 3, mb: 2, listStyleType: 'decimal' }} component="ol">
        {children}
      </List>
    ),
    li: ({ children, ...props }) => (
      <ListItem sx={{ pl: 1, py: 0, display: 'list-item' }} component="li" {...props}>
        {children}
      </ListItem>
    ),
    img: ({ src, alt }) => {
      const isYouTube = (alt || '').toLowerCase() === 'youtube';

      if (isYouTube) {
        const videoId = resolveYouTubeId(src || '', lang, fallbackLang, youtubeMap);
        if (!videoId) return null;
        if (!YOUTUBE_VIDEO_ID_REGEX.test(videoId)) return null;

        const videoSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
        const videoTitle = src ? `YouTube video: ${String(src)}` : 'YouTube video';
        return (
          <Box sx={{ my: 3 }}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 800, mx: 'auto', pt: '56.25%' }}>
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <Box
                  component="iframe"
                  src={videoSrc}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sx={{ border: 0, width: '100%', height: '100%' }}
                />
              </Box>
            </Box>
          </Box>
        );
      }

      return <Box component="img" alt={alt} src={src} />;
    },
  };
}

function getPresetConfig({ preset, lang, fallbackLang, youtubeMap }) {
  switch (preset) {
    case MARKDOWN_PRESETS.FPS4_HOME:
      return {
        rehypePlugins: [rehypeSlug],
        components: getHomeComponents(),
      };
    case MARKDOWN_PRESETS.FPS4_PAGE:
      return {
        rehypePlugins: [rehypeSlug],
        components: getPageComponents({ lang, fallbackLang, youtubeMap }),
      };
    default:
      return {
        rehypePlugins: undefined,
        components: undefined,
      };
  }
}

export function MarkdownRenderer({
  children = undefined,
  content = undefined,
  preset = MARKDOWN_PRESETS.BASE,
  components = undefined,
  rehypePlugins = undefined,
  lang = undefined,
  fallbackLang = 'en',
  youtubeMap = undefined,
  ...other
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    if (!VALID_PRESETS.has(preset)) {
      console.warn(
        `[MarkdownRenderer] Unknown preset "${preset}". Falling back to "${MARKDOWN_PRESETS.BASE}".`
      );
    }

    if (content !== undefined && children !== undefined) {
      console.warn(
        '[MarkdownRenderer] Both "content" and "children" were provided. "content" takes precedence.'
      );
    }
  }, [preset, content, children]);

  const presetConfig = useMemo(
    () => getPresetConfig({ preset, lang, fallbackLang, youtubeMap }),
    [preset, lang, fallbackLang, youtubeMap]
  );
  const resolvedContent = content ?? children ?? '';
  const mergedComponents = useMemo(() => {
    if (presetConfig.components && components) {
      return { ...presetConfig.components, ...components };
    }
    return components || presetConfig.components;
  }, [presetConfig.components, components]);

  return (
    <ReactMarkdown
      components={mergedComponents}
      rehypePlugins={rehypePlugins ?? presetConfig.rehypePlugins}
      {...other}
    >
      {resolvedContent}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
