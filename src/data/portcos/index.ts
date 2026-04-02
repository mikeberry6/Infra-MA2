export type {
  PortCo,
  PortCoSector,
  PortCoRegion,
  PortCoStatus,
  PortCoCountryTag,
  PortCoMilestone,
  PortCoExecutive,
  PortCoSource,
  MilestoneCategory,
} from "./types";

export {
  PORTCO_SECTORS,
  PORTCO_REGIONS,
  PORTCO_STATUSES,
  PORTCO_COUNTRY_TAGS,
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getPortCoCountryTagColor,
  getMilestoneCategoryColor,
  getUniqueCountries,
  getUniqueFirms,
  getUniqueSubsectors,
  getUniqueVehicles,
} from "./types";

import { companies } from "./companies";

export const portcos = companies;
