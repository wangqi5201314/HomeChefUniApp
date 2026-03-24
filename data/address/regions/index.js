import provinceList from './province-list.json'
import province11 from './provinces/11.json'
import province12 from './provinces/12.json'
import province13 from './provinces/13.json'
import province14 from './provinces/14.json'
import province15 from './provinces/15.json'
import province21 from './provinces/21.json'
import province22 from './provinces/22.json'
import province23 from './provinces/23.json'
import province31 from './provinces/31.json'
import province32 from './provinces/32.json'
import province33 from './provinces/33.json'
import province34 from './provinces/34.json'
import province35 from './provinces/35.json'
import province36 from './provinces/36.json'
import province37 from './provinces/37.json'
import province41 from './provinces/41.json'
import province42 from './provinces/42.json'
import province43 from './provinces/43.json'
import province44 from './provinces/44.json'
import province45 from './provinces/45.json'
import province46 from './provinces/46.json'
import province50 from './provinces/50.json'
import province51 from './provinces/51.json'
import province52 from './provinces/52.json'
import province53 from './provinces/53.json'
import province54 from './provinces/54.json'
import province61 from './provinces/61.json'
import province62 from './provinces/62.json'
import province63 from './provinces/63.json'
import province64 from './provinces/64.json'
import province65 from './provinces/65.json'
import province71 from './provinces/71.json'
import province81 from './provinces/81.json'
import province82 from './provinces/82.json'

export { provinceList }

export const provinceRegionMap = {
  '11': province11,
  '12': province12,
  '13': province13,
  '14': province14,
  '15': province15,
  '21': province21,
  '22': province22,
  '23': province23,
  '31': province31,
  '32': province32,
  '33': province33,
  '34': province34,
  '35': province35,
  '36': province36,
  '37': province37,
  '41': province41,
  '42': province42,
  '43': province43,
  '44': province44,
  '45': province45,
  '46': province46,
  '50': province50,
  '51': province51,
  '52': province52,
  '53': province53,
  '54': province54,
  '61': province61,
  '62': province62,
  '63': province63,
  '64': province64,
  '65': province65,
  '71': province71,
  '81': province81,
  '82': province82,
}

export function loadProvinceRegion(code) {
  return provinceRegionMap[String(code)] || null
}

export default {
  provinceList,
  provinceRegionMap,
  loadProvinceRegion
}
