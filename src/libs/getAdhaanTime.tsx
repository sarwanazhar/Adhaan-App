import axios from "axios"
import { storage } from "./storage"

export const getAdhaanTime = async ({country, city}: {country: string, city: string}) => {
    const data = storage.getString('prayerTimes')
    const parsedData = JSON.parse(data || '[]')
    if (parsedData[0] != null || parsedData[0] != undefined) {
      if (parsedData[0]) {
        console.log("data found")
        const currentDayData = filterData(parsedData)
        return currentDayData
      }else if (parsedData[0] == null || parsedData == undefined){
        storage.delete('prayerTimes')
        const filteredData = await getFilteredData({country, city})
        storage.set('prayerTimes', JSON.stringify(filteredData))
        const currentDayData = filterData(filteredData)
        return currentDayData
      }
    }else{
        const filteredData = await getFilteredData({country, city})
        storage.set('prayerTimes', JSON.stringify(filteredData))
        const currentDayData = filterData(filteredData)
        return currentDayData
    }
    
}

const getFilteredData = async ({ country, city }: { country: string; city: string }) => {
  const date = new Date();
  if (city && city.trim() !== '') {
    try {
      console.log("API request made");
      const response = await axios.get('https://api.aladhan.com/v1/calendarByCity', {
        params: {
          city: city,
          country: country,
          method: 1,
          school: 1,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      });

      const filteredData = response.data.data.map((day: any) => ({
        date: day.date.readable,
        hijri: day.date.hijri.date, // e.g., "02-12-1446"
        fajr: day.timings.Fajr.split(' ')[0],
        sunrise: day.timings.Sunrise.split(' ')[0],
        dhuhr: day.timings.Dhuhr.split(' ')[0],
        asr: day.timings.Asr.split(' ')[0],
        maghrib: day.timings.Maghrib.split(' ')[0],
        isha: day.timings.Isha.split(' ')[0],
      }));

      return filteredData;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  } else {
    console.log('City is invalid');
  }
};

const filterData = (data: any) => {
  const date = new Date()
  // get the current date data
  const currentDateData = data.find((item: any) => item.date.split(' ')[0] === date.getDate().toString())
  console.log(currentDateData)
  return currentDateData
}