import moment from 'moment';
import { isNil } from 'lodash';
import { getSchedule } from './parser';

export const getCurrentDayOfWeek = () => moment().isoWeekday() - 1;

export const getCurrentHour = () => moment().hour();

export const getCurrentMinutes = () => moment().minute();

export const getSummOfTime = (hour, minute) => hour * 60 + minute;

// 320 => 6 ч. 20 м.
export const makeTimeToReadableFormat = time => {
  const hours = Math.floor(time / 60);
  const minutes = time - (hours * 60);

  if (hours) {
    return `${hours}ч ${addZeroPrefix(minutes.toString())}м`;
  }

  return `${minutes}м`;
}

// 1 => 01
export const addZeroPrefix = number => number.length === 1 ? `0${number}` : number;

// 24 => 0, 25 => 1
export const getCorrectHours = hour => {
  if (hour >= 24) {
    return hour - 24;
  }

  return hour;
}

export const getHourMinutes = time =>
  ({ hours: Math.floor(time / 60), minutes: time - (Math.floor(time / 60) * 60) });

// 1320 => 15:30
export const makeStringFromTime = (time: number) => {
  const { hours, minutes } = getHourMinutes(time);

  return `${addZeroPrefix((getCorrectHours(hours)).toString())}:${addZeroPrefix(minutes.toString())}`;
}

// [{ hour: 5, minutes: [1, 10, 20, 30]}] => [301, 310, 320, 330]
export const makeArrayFromTime = (hours) => {
  let newArray = [];

  hours.forEach(({ hour, minutes }) => {
    const tempArray = minutes.map((minute) => getSummOfTime(hour, minute));

    newArray = newArray.concat(tempArray);
  });

  return newArray;
}

// "300, 400, ..." => [300, 400, ...];
export const makeArrayFromSchedule = str => str.split(',');

// --------------------------------HARD LOGIC----------------------------------------

// Возвращает увеличенный на 24 часа время если сейчас с 12 до 3 ночи, 3 ночи = 27 часа
export const getCorrectHour = () => {
  const currentHour = getCurrentHour();
  if (currentHour >= 0 && currentHour <= 3) {
    return 24 + currentHour;
  }

  return currentHour;
}

// На основании расписания возвращаем следующее время транспорта
export const getNextTime = (tms) => {
  if (!tms) {
    return null;
  }
  let nextTransport = null;
  let properDay = null;

  const sch = getSchedule(tms); // [{ id: 0, schedule: "390, 401,..." }, ...]

  const currentDay = getCurrentDayOfWeek();
  const previousDay = currentDay === 0 ? 6 : currentDay - 1;
  const nextDay = currentDay === 6 ? 0 : currentDay + 1;

  const previousDaySchedule = sch.find(i => i.id === previousDay) ? makeArrayFromSchedule(sch.find(i => i.id === previousDay).schedule).filter(i => i > 0) : null; // [300, 400, ...]
  const currentDaySchedule = sch.find(i => i.id === currentDay) ? makeArrayFromSchedule(sch.find(i => i.id === currentDay).schedule).filter(i => i > 0) : null; // [300, 400, ...]
  const nextDaySchedule = sch.find(i => i.id === nextDay) ? makeArrayFromSchedule(sch.find(i => i.id === nextDay).schedule).filter(i => i > 0) : null; // [300, 400, ...]

  let summOfCorrectTime = getSummOfTime(getCorrectHour(), getCurrentMinutes()); // 1340
  let summOfCurrentTime = getSummOfTime(getCurrentHour(), getCurrentMinutes()); // 1340

  if (previousDaySchedule && summOfCorrectTime <= previousDaySchedule[previousDaySchedule.length - 1] && getCurrentHour() >= 0 && getCurrentHour() <= 3) {
    // В предыдущем дне еще есть время
    const nextTransports = previousDaySchedule.filter(i => i >= summOfCorrectTime);
    properDay = previousDay;

    if (nextTransports.length) {
      nextTransport = nextTransports[0] - summOfCorrectTime;
    }
  } else if (currentDaySchedule && summOfCurrentTime <= currentDaySchedule[currentDaySchedule.length - 1]) {
    // В предыдущем дне нет доступного времени
    const nextTransports = currentDaySchedule.filter(i => i >= summOfCurrentTime);
    properDay = currentDay;

    if (nextTransports.length) {
      nextTransport = nextTransports[0] - summOfCurrentTime;
    }
  } else if (nextDaySchedule) {
    properDay = nextDay;
    nextTransport = (24 * 60) + Number(nextDaySchedule[0]) - summOfCurrentTime;
  }

  if (isNil(nextTransport)) {
    return ({ properDay: sch[0].id });
  }

  return ({ minutes: Number(nextTransport), time: makeStringFromTime(summOfCurrentTime + nextTransport), properDay, isPrevious: properDay === previousDay });
}

export const getNextTransport = (isPrevious: boolean, dayId: number, properDay: number, schedule: Array<Object>): number => {
  if (dayId === properDay) {
    const currentTimeSum = getSummOfTime(isPrevious ? getCorrectHour() : getCurrentHour(), getCurrentMinutes());

    const nextTransport = schedule.filter(i => i >= currentTimeSum);

    if (properDay !== getCurrentDayOfWeek() && !isPrevious) {
      return schedule[0];
    }

    if (nextTransport.length) {
      return nextTransport[0];
    }
  }

  return null;
}

// IF SCHEDULE HAS A TIME ARRIVAL > 24H => CHANGE HOURS TO 24, 25, etc. FROM 0, 1, 2 etc.
// export const getCorrectDayOfSchedule = (sch) => {
//   const currentDay = getCurrentDayOfWeek(); // 1 ...
//   const lastDay = currentDay === 0 ? 6 : currentDay - 1; // 0
//
//   const currentDaySchedule = sch.find(({ id }) => id === currentDay);
//   const lastDaySchedule = sch.find(({ id }) => id === lastDay);
//
//   const lastDayArray = lastDaySchedule ? lastDaySchedule.schedule.split(',') : [];
//
//   // window.LOGGER(`${META}`, lastDaySchedule, lastDayArray[lastDayArray.length - 1] - (24 * 60), getSummOfTime(getCurrentHour(), getCurrentMinutes()));
//
//   if (lastDayArray.length &&
//     lastDayArray[lastDayArray.length - 1] >= (24 * 60) &&
//     lastDayArray[lastDayArray.length - 1] - (24 * 60) >= getSummOfTime(getCurrentHour(), getCurrentMinutes())
//   ) {
//     return lastDay;
//   }
//
//   if (!currentDaySchedule && !lastDaySchedule) {
//     return sch[0].id;
//   }
//
//   return currentDay;
// }
//
// export const getNextTime = (tms: string): number => {
//   if (!tms) {
//     return null;
//   }
//
//   const sch = getSchedule(tms); // [{ id: 0, schedule: "390, 401,..." }, ...]
//   const days = daysToTime(sch); // [{ id: 0, hours: [{ hour: 6, minutes: [20, 10, ...]}]}]
//
//   const getCorrectDay = getCorrectDayOfSchedule(sch); // correct day, if currect day has time and now is >= 24 hour
//
//   if (!sch && !days || !days.find(({ id }) => id === getCorrectDay)) {
//     return null;
//   }
//
//   const schedule = makeArrayFromTime(days.find(({ id }) => id === getCorrectDay).hours); // [300, 400, 500, ...]
//
//   if (schedule) {
//     let nextTransport = null;
//
//     const currentTimeSum = getSummOfTime(get24FormatHour(schedule), getCurrentMinutes());
//
//     const nextTransports = schedule.filter(i => i >= currentTimeSum);
// // разобраться почему дата брется текущая(понедельник) но время берется ночное и соответсвенно не берется с утра понедельника а берет вечер понедельника
//     if (nextTransports.length) {
//       nextTransport = nextTransports[0];
//     }
//
//     if (!nextTransport) {
//       return null;
//     }
//
//     return ({ minutes: nextTransport - currentTimeSum, time: makeStringFromTime(nextTransport) });
//   }
//
//   return null;
// }

// if schedule [300, ..., 1300] contains time > 24 hour => return correct hour in
// export const get24FormatHour = (schedule) => {
//   const currentHour = getCurrentHour();
//
//   if (!schedule) {
//     return currentHour;
//   }
//
//   const lastDayTime = schedule[schedule.length - 1];
//
//   const maxHours = Math.floor(lastDayTime / 60);
//
//   if (maxHours >= 24 && currentHour >= 0 && currentHour < 4 && (lastDayTime - (24 * 60) >= getSummOfTime(currentHour, getCurrentMinutes()))) {
//     return currentHour + 24;
//   }
//
//   return currentHour;
// }
