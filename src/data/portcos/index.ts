export type {
  PortCo,
  PortCoSector,
  PortCoRegion,
  PortCoStatus,
  PortCoMilestone,
  MilestoneCategory,
} from "./types";

export {
  PORTCO_SECTORS,
  PORTCO_REGIONS,
  PORTCO_STATUSES,
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getMilestoneCategoryColor,
  getUniqueCountries,
  getUniqueFirms,
  getUniqueSubsectors,
  getUniqueVehicles,
} from "./types";

import { companies } from "./companies";

export const portcos = companies;
