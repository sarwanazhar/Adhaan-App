import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Checkbox from '../component/checkbox'
import { getAdhaanTime } from '../libs/getAdhaanTime'
import { storage } from '../libs/storage'
import TrackPlayer from 'react-native-track-player'
import { tracks } from '../constants'
import notifee from '@notifee/react-native'
import { setNotification, startNativeAdhaanService } from '../libs/setNotification'

const HomeScreen = ({ country, city }: { country: string, city: string }) => {
  const [islamicDate, setIslamicDate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: false,
    zuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  })
  const [prayerTime, setPrayerTime] = useState({
    fajr: [],
    zuhr: [],
    asr: [],
    maghrib: [],
    isha: []
  })

  useEffect(() => {

  }, [])


  useEffect(() => {
    const getTime = async () => {
      try {
        const data = await getAdhaanTime({ country, city });
        setPrayerTime({
          fajr: data.fajr ? data.fajr.split(':') : [],
          zuhr: data.duhr ? data.duhr.split(':') : [],
          asr: data.asr ? data.asr.split(':') : [],
          maghrib: data.maghrib ? data.maghrib.split(':') : [],
          isha: data.isha ? data.isha.split(':') : []
        });
        setIslamicDate(data.hijri)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setPrayerTime({
          fajr: [],
          zuhr: [],
          asr: [],
          maghrib: [],
          isha: []
        });
      }
    };

    if (city && city.trim() !== '' && country && country.trim() !== '') {
      getTime();
    }
  }, [country, city]);

  useEffect(() => {
    const fajr = storage.getBoolean('fajr') || false
    const zuhr = storage.getBoolean('zuhr') || false
    const asr = storage.getBoolean('asr') || false
    const maghrib = storage.getBoolean('maghrib') || false
    const isha = storage.getBoolean('isha') || false
    setPrayerTimes({ fajr: fajr, zuhr: zuhr, asr: asr, maghrib: maghrib, isha: isha })
  }, [])

  useEffect(() => {
    // Setup TrackPlayer only once
    const setup = async () => {
      try {
        await TrackPlayer.add(tracks);
      } catch (e) {
        // Already setup or error
      }
    };
    setup();
  }, []);
  useEffect(() => {
    if (!isLoading) {
      setNotification(); // Schedule the notification after loading is complete
    }
  }, [isLoading]);

  if(isLoading){
    return <View className='flex-1 justify-center items-center bg-[#000]'>
      <Text className='text-white text-2xl font-bold'>Loading...</Text>
    </View>
  } else {
  return (
    <SafeAreaView className='bg-[#d5f2e3] h-full w-full'>
      <ScrollView>
        {/* Header */}
        <View className='w-full h-[50px] items-center justify-between'>
          <TouchableOpacity className='w-36 h-8 mt-3 bg-[#73BA9B] rounded-full items-center justify-center' onPress={async () => {
            startNativeAdhaanService();
          }}>
            <Text className='text-center text-white font-semibold text-sm'>
              {city}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Body */}
        <View className='w-full px-5 pt-3'>
          <Text className='text-7xl font-black text-black leading-none'>
            As-salamu alaykum
          </Text>
          <Text className='text-black/60 text-xl font-medium'>
            Never miss a prayer again. Let the call to prayer reach your heart, on time, every time.
          </Text>
          {/* Card 1 Islamic Date */}
          <View className='w-full bg-[#003E1F] h-[240px] mt-8 rounded-xl p-4'>
            <View className='w-full h-[18%] '>
              <Text className='text-[#AEAEAE] text-[22px] font-normal flex-1 flex-row justify-between'>
                Current Islamic Date
              </Text>
            </View>
            <View className='w-full h-[75%] mt-4'>
              <Text className='text-white text-[48px] mt-5 font-black flex-1 flex-row justify-between'>
                {islamicDate}
              </Text>
              <Text className='text-right text-[#AEAEAE] text-3xl font-normal'>
                In {city}
              </Text>
            </View>
          </View>
          {/* Card 2 Next Prayer */}
          <View className='w-full bg-[#73BA9B] h-[200px] mt-8 mb-8 rounded-xl p-4'>
            <Text className='text-[#2F2F2F] text-[30px] font-medium'>
              Next Prayer
            </Text>
            <View className='w-full h-[75%] mt-4'>
              {(() => {
                const now = new Date();

                const getPrayerDate = (hour: string, minute: string) => {
                  if (!hour || !minute || isNaN(Number(hour)) || isNaN(Number(minute))) return null;
                  const d = new Date();
                  d.setHours(Number(hour), Number(minute), 0, 0);
                  return d;
                };

                const prayerLabels = ['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];
                const prayerKeys = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

                // Build a list of valid prayer times
                const prayers = prayerKeys.map((key, i) => {
                  const [h, m] = prayerTime[key as keyof typeof prayerTime] || [];
                  const time = getPrayerDate(h, m);
                  return time ? { time, label: prayerLabels[i], hour: h, minute: m } : null;
                }).filter(Boolean) as { time: Date, label: string, hour: string, minute: string }[];

                // Find the next prayer
                const upcoming = prayers.find(prayer => prayer.time > now);

                // If all today's prayers have passed, show tomorrow's Fajr
                const nextPrayer = upcoming || (prayers.length > 0
                  ? {
                      ...prayers[0],
                      time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, Number(prayers[0].hour), Number(prayers[0].minute)),
                    }
                  : { label: '', hour: '', minute: '' });

                return (
                  <Text className='text-white text-6xl mt-5 font-black flex-1 flex-row justify-between'>
                    {nextPrayer.hour && nextPrayer.minute ? `${nextPrayer.hour}:${nextPrayer.minute}` : '--:--'} {nextPrayer.label}
                  </Text>
                );
              })()}
            </View>
          </View>
          {/* Card 3 Prayer Times Adjustment */}
          <View className='w-full bg-[#CA3713] h-[330px] mb-8 rounded-xl p-4'>
            <Text className='text-[#AEAEAE] text-[25px] font-medium'>
              Prayer Times Adjustment
            </Text>
            <View className='w-full h-[75%] mt-4'>
              <View>
                <Checkbox text="Fajr" checked={prayerTimes.fajr} setChecked={() => {
                  setPrayerTimes({ ...prayerTimes, fajr: !prayerTimes.fajr })
                  storage.set('fajr', !prayerTimes.fajr)
                }} />
                <Checkbox text="Zuhr" checked={prayerTimes.zuhr} setChecked={() => {
                  setPrayerTimes({ ...prayerTimes, zuhr: !prayerTimes.zuhr })
                  storage.set('zuhr', !prayerTimes.zuhr)
                }} />
                <Checkbox text="Asr" checked={prayerTimes.asr} setChecked={() => {
                  setPrayerTimes({ ...prayerTimes, asr: !prayerTimes.asr })
                  storage.set('asr', !prayerTimes.asr)
                }} />
                <Checkbox text="Maghrib" checked={prayerTimes.maghrib} setChecked={() => {
                  setPrayerTimes({ ...prayerTimes, maghrib: !prayerTimes.maghrib })
                  storage.set('maghrib', !prayerTimes.maghrib)
                }} />
                <Checkbox text="Isha" checked={prayerTimes.isha} setChecked={() => {
                  setPrayerTimes({ ...prayerTimes, isha: !prayerTimes.isha })
                  storage.set('isha', !prayerTimes.isha)
                }} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )}
}

export default HomeScreen