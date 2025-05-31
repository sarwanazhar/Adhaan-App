import { storage } from "./storage"
import { getAdhaanTime } from "./getAdhaanTime"
import notifee, { AndroidStyle, AuthorizationStatus, TimestampTrigger, TriggerType } from '@notifee/react-native';
import TrackPlayer from "react-native-track-player";
import { tracks } from "../constants";
import { NativeModules, Platform } from 'react-native';
const { AdhaanModule } = NativeModules;

type Data = {
    Date: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
}

export const setNotificationTest = async () => {
    const channelId = await notifee.createChannel({
        id: 'adhaan',
        name: 'Default Channel',
        sound: 'default',
      });
      
      const date = new Date(Date.now() + 10 * 1000); // 10 seconds ahead

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        alarmManager: true, // optional but more reliable on Android
      };
    
      await notifee.createTriggerNotification(
        {
          title: 'Test Notification',
          body: 'This is scheduled 10 seconds ahead',
          android: {
            channelId: channelId,
          },
        },
        trigger
      );
    
      console.log('Notification scheduled for:', date);
}

export const scheduleNotification = async ({hour, minute, title, second}: {hour: number, minute: number, title: string, second?: number}) => {
  console.log('Scheduling notification', hour, minute, title, title)
    const date = new Date()
    date.setHours(hour)
    date.setMinutes(minute)
    date.setSeconds(second || 0)
    date.setMilliseconds(0)
    const now = new Date()
    if (date <= now) {
        return;
    }
    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
    }
    await notifee.createTriggerNotification(
        {
        id: 'adhaan',
        title,
        body: 'Adhaan Time is here',
        android: {
            channelId: 'default',
            smallIcon: 'ic_stat_name',
            color: '#00FF00',
            largeIcon: 'ic_stat_name',
            style: {
                type: AndroidStyle.BIGTEXT,
                text: 'Adhaan Time is here',
            }
        },
    }, trigger)
}


export const setNotification = async () => {
    const data = await storage.getString('data')
    const parsedData: Data = JSON.parse(data || '{}')
    if(Object.keys(parsedData).length > 0){
        const isFajr = await storage.getBoolean('fajr')
        const isDuhr = await storage.getBoolean('zuhr')
        const isAsr = await storage.getBoolean('asr')
        const isMaghrib = await storage.getBoolean('maghrib')
        const isIsha = await storage.getBoolean('isha')
        const fajr = parsedData.fajr.split(':')
        const duhr = parsedData.dhuhr.split(':')
        const asr = parsedData.asr.split(':')
        const maghrib = parsedData.maghrib.split(':')
        const isha = parsedData.isha.split(':')
        const fajrHour = parseInt(fajr[0])
        const fajrMinute = parseInt(fajr[1])
        const duhrHour = parseInt(duhr[0])
        const duhrMinute = parseInt(duhr[1])
        const asrHour = parseInt(asr[0])
        const asrMinute = parseInt(asr[1])
        const maghribHour = parseInt(maghrib[0])
        const maghribMinute = parseInt(maghrib[1])
        const ishaHour = parseInt(isha[0])
        const ishaMinute = parseInt(isha[1])
        if(isFajr) scheduleNotification({hour: fajrHour, minute: fajrMinute, title: 'Fajr'})
        if(isDuhr) scheduleNotification({hour: duhrHour, minute: duhrMinute, title: 'Duhr'})
        if(isAsr) scheduleNotification({hour: asrHour, minute: asrMinute, title: 'Asr'})
        if(isMaghrib) scheduleNotification({hour: maghribHour, minute: maghribMinute, title: 'Maghrib'})
        if(isIsha) scheduleNotification({hour: ishaHour, minute: ishaMinute, title: 'Isha'})
        console.log('Notifications scheduled')
        return;
    }else {
        const location = await storage.getString('location')
        const parsedLocation = JSON.parse(location || '{}')
        if(Object.keys(parsedLocation).length > 0){
            const { country, city } = parsedLocation;
            const data: Data = await getAdhaanTime({country, city})
            storage.set('data', JSON.stringify(data))
            const isFajr = await storage.getBoolean('fajr')
            const isDuhr = await storage.getBoolean('zuhr')
            const isAsr = await storage.getBoolean('asr')
            const isMaghrib = await storage.getBoolean('maghrib')
            const isIsha = await storage.getBoolean('isha')
            const fajr = data.fajr.split(':')
            const duhr = data.dhuhr.split(':')
            const asr = data.asr.split(':')
            const maghrib = data.maghrib.split(':')
            const isha = data.isha.split(':')
            const fajrHour = parseInt(fajr[0])
            const fajrMinute = parseInt(fajr[1])
            const duhrHour = parseInt(duhr[0])
            const duhrMinute = parseInt(duhr[1])
            const asrHour = parseInt(asr[0])
            const asrMinute = parseInt(asr[1])
            const maghribHour = parseInt(maghrib[0])
            const maghribMinute = parseInt(maghrib[1])
            const ishaHour = parseInt(isha[0])
            const ishaMinute = parseInt(isha[1])
            if(isFajr) scheduleNotification({hour: fajrHour, minute: fajrMinute, title: 'Fajr'})
            if(isDuhr) scheduleNotification({hour: duhrHour, minute: duhrMinute, title: 'Duhr'})
            if(isAsr) scheduleNotification({hour: asrHour, minute: asrMinute, title: 'Asr'})
            if(isMaghrib) scheduleNotification({hour: maghribHour, minute: maghribMinute, title: 'Maghrib'})
            if(isIsha) scheduleNotification({hour: ishaHour, minute: ishaMinute, title: 'Isha'})
            console.log('Notifications scheduled')
            return;
        }
    }
}


export const requestPermissionNotification = async () => {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      // do nothing
    } else {
      console.log('User declined permissions');
    }
}

export const startNativeAdhaanService = () => {
  if (Platform.OS === 'android' && AdhaanModule && AdhaanModule.startAdhaanService) {
    AdhaanModule.startAdhaanService();
  }
};


