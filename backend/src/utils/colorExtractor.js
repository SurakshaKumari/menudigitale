const { Vibrant } = require('node-vibrant/node');

async function extractColorsFromImage(imageUrl) {
  const palette = await Vibrant.from(imageUrl).getPalette();

  return {
    primary: palette.Vibrant?.hex || null,
    secondary: palette.Muted?.hex || null,
    accent: palette.DarkVibrant?.hex || null,
    light: palette.LightVibrant?.hex || null,
    dark: palette.DarkMuted?.hex || null
  };
}

module.exports = { extractColorsFromImage };
