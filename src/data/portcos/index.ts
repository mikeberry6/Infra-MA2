export type {
  PortCo,
  PortCoSector,
  PortCoRegion,
  PortCoStatus,
} from "./types";

export {
  PORTCO_SECTORS,
  PORTCO_REGIONS,
  PORTCO_STATUSES,
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getUniqueCountries,
  getUniqueFirms,
  getUniqueSubsectors,
  getUniqueVehicles,
} from "./types";

import { batch1 } from "./batch1";
import { batch2 } from "./batch2";
import { batch3 } from "./batch3";
import { batch4 } from "./batch4";
import { batch5 } from "./batch5";
import { batch6 } from "./batch6";
import { batch7 } from "./batch7";
import { batch8 } from "./batch8";
import { batch9 } from "./batch9";

import type { PortCo } from "./types";

export const portcos: PortCo[] = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
];
