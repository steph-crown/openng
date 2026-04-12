export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "You know how you end up rebuilding a full docs site every time you start a new project?",
    author: "Anthony Shew",
    role: "Turbo DX at Vercel",
  },
  {
    quote: "fumadocs is the best Next.js docs framework",
    author: "Aiden Bai",
    role: "Creator of Million.js",
  },
  {
    quote:
      "Major shoutout for making a gorgeous documentation framework that composes beautifully.",
    author: "shadcn",
    role: "Creator of Shadcn UI",
  },
];
