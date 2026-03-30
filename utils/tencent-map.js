export const TENCENT_MAP_KEY = 'HYKBZ-UPUCM-HJX6V-6V7I3-577BT-B7BZD'

const TENCENT_MAP_BASE_URL = 'https://apis.map.qq.com/ws'

function requestTencentMap(url, data = {}) {
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

export function searchAddress(keyword, options = {}) {
  const normalizedKeyword = keyword ? String(keyword).trim() : ''

  if (!normalizedKeyword) {
    return Promise.resolve([])
  }

  const requestData = {
    keyword: normalizedKeyword,
    page_size: options.pageSize || 10,
    page_index: options.pageIndex || 1
  }

  if (options.region) {
    requestData.boundary = `region(${options.region},${typeof options.autoExtend === 'number' ? options.autoExtend : 1})`
  } else if (options.location && options.location.latitude && options.location.longitude) {
    requestData.boundary = `nearby(${Number(options.location.latitude)},${Number(options.location.longitude)},1000,1)`
  }

  return requestTencentMap('/place/v1/search', requestData).then((response) => {
    const list = Array.isArray(response.data) ? response.data : []

    return list
      .map((item, index) => {
        const latitude = item.location ? Number(item.location.lat) : Number(item.latitude || 0)
        const longitude = item.location ? Number(item.location.lng) : Number(item.longitude || 0)

        return {
          id: item.id || `${item.title || 'poi'}-${index}`,
          title: item.title || '',
          address: item.address || '',
          latitude,
          longitude,
          province: item.ad_info ? item.ad_info.province || '' : '',
          city: item.ad_info ? item.ad_info.city || '' : '',
          district: item.ad_info ? item.ad_info.district || '' : '',
          raw: item
        }
      })
      .filter((item) => item.latitude && item.longitude)
  })
}

export function reverseGeocoder(latitude, longitude) {
  return requestTencentMap('/geocoder/v1', {
    location: `${Number(latitude)},${Number(longitude)}`,
    get_poi: 0
  }).then((response) => {
    const raw = response.result || {}
    const addressComponent = raw.address_component || {}
    const formattedAddresses = raw.formatted_addresses || {}
    const town =
      (raw.address_reference &&
        raw.address_reference.town &&
        (raw.address_reference.town.title || raw.address_reference.town.name)) ||
      addressComponent.street ||
      ''

    const simplify = {
      latitude: raw.location ? Number(raw.location.lat) : Number(latitude),
      longitude: raw.location ? Number(raw.location.lng) : Number(longitude),
      province: addressComponent.province || '',
      city: addressComponent.city || '',
      district: addressComponent.district || '',
      street: addressComponent.street || '',
      street_number: addressComponent.street_number || '',
      address: raw.address || '',
      recommend: formattedAddresses.recommend || '',
      rough: formattedAddresses.rough || ''
    }

    return {
      latitude: simplify.latitude,
      longitude: simplify.longitude,
      province: simplify.province,
      city: simplify.city,
      district: simplify.district,
      town,
      address: simplify.address,
      street: simplify.street,
      streetNumber: simplify.street_number,
      recommend: simplify.recommend,
      rough: simplify.rough,
      raw,
      simplify
    }
  })
}

export function buildLocationPayloadByGeocoder(result, options = {}) {
  const preferredDetailAddress = options.detailAddress ? String(options.detailAddress).trim() : ''
  const detailAddress =
    preferredDetailAddress ||
    [result.street, result.streetNumber].filter(Boolean).join('') ||
    result.recommend ||
    result.rough ||
    result.address ||
    ''

  return {
    province: result.province || '',
    city: result.city || '',
    district: result.district || '',
    town: result.town || '',
    detailAddress,
    longitude: Number(result.longitude || options.longitude || 0),
    latitude: Number(result.latitude || options.latitude || 0)
  }
}

export default {
  TENCENT_MAP_KEY,
  searchAddress,
  reverseGeocoder,
  buildLocationPayloadByGeocoder
}
