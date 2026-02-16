'use client';

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

const homeHeadingStyles = {
  h1: { margin: '2rem 0 1rem', fontSize: '2.25rem', fontWeight: 700, color: 'inherit' },
  h2: { margin: '2rem 0 1rem', fontSize: '1.5rem', fontWeight: 600, color: 'inherit' },
};

function getHomeComponents() {
  return {
    a: ({ href, children }) => (
      <Link href={href} underline="hover">
        {children}
      </Link>
    ),
    h1: ({ node, children, ...props }) => {
      const id = node?.properties?.id;
      return (
        <h1 id={id} style={homeHeadingStyles.h1} {...props}>
          {id ? (
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
      return (
        <h2 id={id} style={homeHeadingStyles.h2} {...props}>
          {id ? (
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

        const videoSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
        return (
          <Box sx={{ my: 3 }}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 800, mx: 'auto', pt: '56.25%' }}>
              <Box sx={{ position: 'absolute', inset: 0 }}>
                <Box
                  component="iframe"
                  src={videoSrc}
                  title="YouTube video"
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
  const presetConfig = getPresetConfig({ preset, lang, fallbackLang, youtubeMap });
  const resolvedContent = content ?? children ?? '';

  return (
    <ReactMarkdown
      components={presetConfig.components ? { ...presetConfig.components, ...components } : components}
      rehypePlugins={rehypePlugins ?? presetConfig.rehypePlugins}
      {...other}
    >
      {resolvedContent}
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
