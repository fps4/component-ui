export function resolveCarousel(frontMatter) {
  if (!frontMatter) {
    return { heading: undefined, items: [] };
  }

  const directArray = Array.isArray(frontMatter.carousel)
    ? frontMatter.carousel
    : Array.isArray(frontMatter.carouselItems)
      ? frontMatter.carouselItems
      : null;

  const items = directArray
    ? directArray.filter(Boolean)
    : Object.keys(frontMatter)
        .filter((key) => /^carousel-\d+$/i.test(key))
        .sort()
        .map((key) => {
          const value = frontMatter[key];

          if (!value) {
            return null;
          }

          if (typeof value === 'string') {
            return { description: value };
          }

          if (typeof value === 'object') {
            return value;
          }

          return null;
        })
        .filter(Boolean);

  const heading =
    frontMatter?.carouselHeading ||
    frontMatter?.carouselTitle ||
    (typeof frontMatter?.carousel === 'object' && !Array.isArray(frontMatter.carousel)
      ? frontMatter?.carousel?.heading
      : undefined);

  return { heading, items };
}

export function resolveTiles(frontMatter) {
  if (!frontMatter) {
    return { heading: undefined, items: [] };
  }

  const result = {
    heading:
      frontMatter.tilesHeading ||
      frontMatter.tilesTitle ||
      undefined,
    items: [],
  };

  const tilesField = frontMatter.tiles;

  if (Array.isArray(tilesField)) {
    result.items = tilesField.filter(Boolean);
  } else if (tilesField && typeof tilesField === 'object') {
    if (Array.isArray(tilesField.items)) {
      result.items = tilesField.items.filter(Boolean);
    }
    if (!result.heading) {
      result.heading = tilesField.heading || tilesField.title || result.heading;
    }
  }

  if (!result.items.length && Array.isArray(frontMatter.tileItems)) {
    result.items = frontMatter.tileItems.filter(Boolean);
  }

  if (!result.items.length) {
    const numberedKeys = Object.keys(frontMatter).filter((key) => /^tile-\d+$/i.test(key));

    if (numberedKeys.length) {
      result.items = numberedKeys
        .sort()
        .map((key) => {
          const value = frontMatter[key];

          if (!value) {
            return null;
          }

          if (typeof value === 'string') {
            return { description: value };
          }

          if (typeof value === 'object') {
            return value;
          }

          return null;
        })
        .filter(Boolean);
    }
  }

  return result;
}
