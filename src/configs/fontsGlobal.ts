import localFont from "next/font/local";

export const notoSans = localFont({
  src: [
    {
      path: "../fonts/PlayfairDisplay-VariableFont_wght.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf",
      weight: "600",
      style: "Italic",
    },
    {
      path: "../fonts/static/PlayfairDisplay-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/static/PlayfairDisplay-ExtraBoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});
