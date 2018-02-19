import { SETTINGS_KEYS } from '../constants/config';

export const getSchedule = (value) => {
  const arr = [];
  const daily = value.split(';');

  daily.forEach((dai) => {
    const days = dai.split('>')[0].split('');
    const times = dai.split('>')[1];

    days.forEach((day) => {
      arr.push({
        id: day - 1,
        schedule: times,
      });
    });
  });

  return arr;
}

export const daysToTime = (days) => {
  return days.map(({ id, schedule }) => {
    const hours = [];
    const times = schedule.split(',');

    times.forEach(time => {
      const hour = parseInt(parseInt(time, 10) / 60, 10);
      const minute = time - hour * 60;
      const existHour = hours.find(({ hour: h }) => h === hour);

      if (hour) {
        if (existHour) {
          const hourIndex = hours.indexOf(existHour);
          const { minutes } = hours[hourIndex];
          minutes.push(minute);
          hours[hourIndex].minutes = minutes;
        } else {
          hours.push({
            hour,
            minutes: [minute],
          });
        }
      }
    });

    return ({
      id,
      hours,
    });
  });
}

export const getTransportColor = (type) => {
  switch (type) {
    case 0:
      return window.SETTINGS[SETTINGS_KEYS[1]];
    case 1:
      return window.SETTINGS[SETTINGS_KEYS[2]];
    case 2:
      return window.SETTINGS[SETTINGS_KEYS[3]];
    case 3:
      return window.SETTINGS[SETTINGS_KEYS[4]];
    default:
      return window.SETTINGS[SETTINGS_KEYS[1]];
  }
}

export const getTwinsDirections = ({ directions, r_id, d_id }) => {
  const block = directions.filter(({ r_id: itemsR_id }) => itemsR_id === r_id);

  if (block.length === 1 || block[0].id === d_id) {
    return block;
  }

  block.reverse();

  return block;
}

export const getTabCounts = (tab, items) => {
  if (items.length) {
    if (tab === 'bus') {
      return items.filter(({ type }) => type === 0).length;
    } else if (tab === 'trolley') {
      return items.filter(({ type }) => type === 1).length;
    } else if (tab === 'tramms') {
      return items.filter(({ type }) => type === 2).length;
    } else if (tab === 'metro') {
      return items.filter(({ type }) => type === 3).length;
    }
  }

  return 0;
}

export const parseAndSave = (response, isReturnScheme = false) =>
  new Promise((resolve, reject) => {
    console.log('-------');
    console.log('Parsing', new Date());
    if (!response || !Object.keys(response).length) {
      return reject();
    }

    const { routes: jsonRoutes, stops } = JSON.parse(response);

    const routes = jsonRoutes.map(({ id, name, type, active }) => ({ id, name, type, active }));
    
    const directions = jsonRoutes.reduce((total, next) => {
      const r_id = next.id;
      // const directions = next.directions.map(({ name }) => name);

      next.directions.forEach(({ id, name }) => {
        total.push({ id, r_id, name, isfavorite: 0 })
      });

      return total;
    }, []);

    // directions = directions.map((item, index) => ({ ...item, id: index }));

    const times = jsonRoutes.reduce((total, next) => {
      const reduceTimes = next.directions.reduce((t, n) => {
        n.dps.forEach(({ id_s, pos, tms }) => {
          t.push({ 
            id_s, 
            pos, 
            tms, 
            r_id: next.id, 
            d_id: directions.find(({ name, r_id }) => n.name === name && r_id === next.id).id, 
          });
        });

        return t;
      }, []);

      total.push(...reduceTimes);
      return total;
    }, []);

    if (isReturnScheme) {
      return resolve({
        stops,
        routes,
        directions,
        times,
      });
    }

    console.log('Saving', new Date());
    console.log(routes.length)

    new Promise.all([
      window.DB.insertSync({
        table: 'stops',
        values: stops.map(item => ({ ...item, isfavorite: 0 })),
      }),
      window.DB.insertSync({
        table: 'directions',
        values: directions.map(item => ({ ...item, isfavorite: 0 })),
      }),
    ])
      .then(() => {
        console.log('Saved, redirecting', new Date());

        window.DB.insertSync({
          table: 'times',
          values: times,
        });
    
        window.DB.insertSync({
          table: 'routes',
          values: routes,
        });
    
        resolve();
      });
  });