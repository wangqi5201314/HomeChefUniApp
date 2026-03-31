import { TENCENT_MAP_KEY } from './tencent-map'

const TENCENT_MAP_BASE_URL = 'https://apis.map.qq.com/ws'

let districtTreeCache = null
const districtChildrenCache = {}

function requestTencentDistrict(url, data = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${TENCENT_MAP_BASE_URL}${url}`,
      method: 'GET',
      data: {
        key: TENCENT_MAP_KEY,
        output: 'json',
        ...data
      },
      success: (res) => {
        const response = res && res.data ? res.data : {}

        if (res.statusCode >= 200 && res.statusCode < 300 && Number(response.status) === 0) {
          resolve(response)
          return
        }

        reject(response)
      },
      fail: reject
    })
  })
}

function normalizeRegionName(item) {
  return (item && (item.fullname || item.name) ? String(item.fullname || item.name) : '').trim()
}

function normalizeRegionItem(item) {
  return {
    code: item && item.id ? String(item.id) : '',
    name: normalizeRegionName(item)
  }
}

function buildDistrictTree() {
  return requestTencentDistrict('/district/v1/list').then((response) => {
    const result = Array.isArray(response.result) ? response.result : []
    const provincesRaw = Array.isArray(result[0]) ? result[0] : []
    const citiesRaw = Array.isArray(result[1]) ? result[1] : []
    const districtsRaw = Array.isArray(result[2]) ? result[2] : []

    const provinces = provincesRaw.map((provinceItem) => {
      const province = {
        ...normalizeRegionItem(provinceItem),
        cities: []
      }

      if (!Array.isArray(provinceItem.cidx) || provinceItem.cidx.length < 2) {
        return province
      }

      const [startIndex, endIndex] = provinceItem.cidx
      const provinceChildren = citiesRaw.slice(startIndex, endIndex + 1)
      const isDirectDistrictProvince = provinceChildren.every(
        (item) => !Array.isArray(item.cidx) || item.cidx.length < 2
      )

      if (isDirectDistrictProvince) {
        province.cities = [
          {
            code: province.code,
            name: province.name,
            districts: provinceChildren.map((districtItem) => ({
              ...normalizeRegionItem(districtItem),
              towns: [],
              _townsLoaded: false
            }))
          }
        ]
        return province
      }

      province.cities = provinceChildren.map((cityItem) => {
        const city = {
          ...normalizeRegionItem(cityItem),
          districts: []
        }

        if (Array.isArray(cityItem.cidx) && cityItem.cidx.length >= 2) {
          const [districtStart, districtEnd] = cityItem.cidx
          city.districts = districtsRaw.slice(districtStart, districtEnd + 1).map((districtItem) => ({
            ...normalizeRegionItem(districtItem),
            towns: [],
            _townsLoaded: false
          }))
        }

        return city
      })

      return province
    })

    districtTreeCache = {
      provinces
    }

    return districtTreeCache
  })
}

export function getDistrictTree() {
  if (districtTreeCache) {
    return Promise.resolve(districtTreeCache)
  }

  return buildDistrictTree()
}

export function getDistrictChildren(parentCode) {
  const normalizedCode = parentCode ? String(parentCode).trim() : ''

  if (!normalizedCode) {
    return Promise.resolve([])
  }

  if (districtChildrenCache[normalizedCode]) {
    return Promise.resolve(districtChildrenCache[normalizedCode])
  }

  return requestTencentDistrict('/district/v1/getchildren', {
    id: normalizedCode
  }).then((response) => {
    const groups = Array.isArray(response.result) ? response.result : []
    const firstGroup = Array.isArray(groups[0]) ? groups[0] : []
    const list = firstGroup.map(normalizeRegionItem).filter((item) => item.code && item.name)
    districtChildrenCache[normalizedCode] = list
    return list
  })
}

export default {
  getDistrictTree,
  getDistrictChildren
}
