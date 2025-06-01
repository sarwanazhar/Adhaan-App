import axios from "axios"
import { storage } from "./storage"

export const getAdhaanTime = async ({country, city}: {country: string, city: string}) => {
    const data = storage.getString('prayerTimes')
    const parsedData = JSON.parse(data || '[]')
    const date = new Date()
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      if(parseInt(parsedData[0].date.split('-')[1]) != date.getMonth() + 1){
        storage.delete('prayerTimes')
        storage.delete('data')
        storage.delete('currentDayData')
        const filteredData = await getFilteredData({country, city})
        storage.set('prayerTimes', JSON.stringify(filteredData))
        const currentDayData = filterData(filteredData)
        storage.set('currentDayData', JSON.stringify(currentDayData))
        return currentDayData
      }
      if (parsedData[0]) {
        console.log("data found")
        const currentDayData = filterData(parsedData)
        storage.set('currentDayData', JSON.stringify(currentDayData))
        return currentDayData
      }else if (parsedData[0] == null || parsedData == undefined){
        storage.delete('prayerTimes')
        const filteredData = await getFilteredData({country, city})
        storage.set('prayerTimes', JSON.stringify(filteredData))
        console.log(filteredData[0], "filteredData")
        const currentDayData = filterData(filteredData)
        console.log(currentDayData, "currentDayData")
        storage.set('currentDayData', JSON.stringify(currentDayData))
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
      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth() + 1;
      const encodedCity = encodeURIComponent(city);
      const encodedCountry = encodeURIComponent(country);
      const response = await axios.get(`https://api.aladhan.com/v1/calendarByCity/${currentYear}/${currentMonth}?city=${encodedCity}&country=${encodedCountry}&method=1&school=1`);
      console.log(response.data.code,"response")
      console.log(response.data.data[0].date.gregorian.date, "date")


      const filteredData = response.data.data.map((day: any) => ({
        date: day.date.gregorian.date,
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
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0'); // "01", "02", ..., "31"
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // "01", ..., "12"
  const year = date.getFullYear().toString();

  // Now match the full date string
  const todayStr = `${day}-${month}-${year}`;
  const currentDateData = data.find((item: any) => item.date === todayStr);
  console.log(currentDateData);
  return currentDateData;
}