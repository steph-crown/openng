export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "There's no API for Nigerian public data. Fuel prices live in NBS PDFs. School lists require visiting 3 ministries. Postal codes are in an Excel someone emailed you.",
    author: "@eldivine",
    role: "X · 300K impressions",
  },
  {
    quote:
      "We have a data problem in Nigeria. I've had to manually scrape and search for the data I want to use severally.",
    author: "@Ifihan_",
    role: "X · Builder of Iya Oloja",
  },
  {
    quote:
      "Finally. I've been copying NBS PDFs into a spreadsheet every month for two years. This changes everything.",
    author: "Early user",
    role: "Fintech engineer",
  },
];
