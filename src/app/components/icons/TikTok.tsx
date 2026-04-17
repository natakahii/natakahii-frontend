import * as React from "react";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="#ffffff"
    width={800}
    height={800}
    viewBox="0 0 24 24"
    data-name="Line Color"
    xmlns="http://www.w3.org/2000/svg"
    className="icon line-color"
    {...props}
  >
    <path
      d="M21 7h-1a4 4 0 0 1-4-4h-4v11.5a2.5 2.5 0 1 1-4-2V8.18a6.5 6.5 0 1 0 8 6.32V9.92A8 8 0 0 0 20 11h1Z"
      style={{
        fill: "none",
        stroke: "#ffffff",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
      }}
    />
  </svg>
);

export default TikTokIcon;
