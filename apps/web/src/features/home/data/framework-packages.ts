export type FrameworkPackage = {
  name: string;
  description: string;
};

export const frameworkPackages: FrameworkPackage[] = [
  {
    name: "Public Holidays",
    description:
      "All Nigerian federal public holidays with source links and confirmation state.",
  },
  {
    name: "Fuel Prices",
    description: "Monthly PMS, diesel, and kerosene prices by state.",
  },
  {
    name: "Postal Codes",
    description: "NIPOST postal codes mapped to states and LGAs.",
  },
  {
    name: "Public Schools",
    description: "Primary and secondary schools by LGA from UBEC datasets.",
  },
];
