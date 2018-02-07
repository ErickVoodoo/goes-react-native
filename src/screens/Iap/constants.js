import { ANALYTIC_EVENTS } from '../../constants/config';

export const PRODUCTS = [
  'org.euanpa.goes.map',
  'org.euanpa.goes.schedule',
  'org.euanpa.goes.trial',
];

export const MARKET_ITEMS = [{
  identifier: PRODUCTS[0],
  icon: 'map-o',
  analytic: {
    info: ANALYTIC_EVENTS.IAP_INFO_MAP,
    buy: ANALYTIC_EVENTS.IAP_BUY_MAP,
  },
}, {
  identifier: PRODUCTS[1],
  icon: 'heart-o',
  analytic: {
    info: ANALYTIC_EVENTS.IAP_INFO_SCHEDULE,
    buy: ANALYTIC_EVENTS.IAP_BUY_SCHEDULE,
  },
}, {
  identifier: PRODUCTS[2],
  icon: 'gift',
}];

export const INFO = [{
  identifier: PRODUCTS[0],
  images: [
    require('../../../assets/iap/map1.png'),
    require('../../../assets/iap/map2.png'),
    require('../../../assets/iap/map3.png'),
    require('../../../assets/iap/map4.png'),
    require('../../../assets/iap/map5.png'),
  ],
  // description: 'Предоставляет доступ к карте с остановками и геопозицией. Позволяет строить маршрут до нужной остановки пешком. Включает остановки всех районных центров.',
}, {
  identifier: PRODUCTS[1],
  images: [
    require('../../../assets/iap/schedule-1.png'),
    require('../../../assets/iap/schedule-2.png'),
    require('../../../assets/iap/schedule-3.png'),
  ],
  // description: 'Предоставляет доступ к быстрым сохраненным остановкам определенного маршрута. Выбранные остановки сохраняются при смене городов. Лимит на количество не присутствует.',
}]