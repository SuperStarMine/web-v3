export const globalSettings = {
  standardWidths: [
    {
      mediaQuery: 'min-aspect-ratio: 16/9',
      value: 70
    },
    {
      mediaQuery: 'default',
      value: 80
    },
    {
      mediaQuery: 'max-aspect-ratio: 3/4',
      value: 90
    },
  ],
  imageDirectory: '/img/',
  imageExtensionsShort: ['webp', 'png'],
  imageSizes: [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
  tinyImageSize: 15,
  tinyImageExtensionsShort: ['webp', 'jpg'],
  transitionDuration: 500, //ms
}