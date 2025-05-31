import React, { useEffect, useState } from 'react';
import '../global.css';
import HomeScreen from './screen/home';
import axios from 'axios';
import BackgroundFetch from 'react-native-background-fetch';
import { storage } from './libs/storage';
import { requestPermissionNotification, setNotification } from './libs/setNotification';
import notifee from '@notifee/react-native';
import TrackPlayer from 'react-native-track-player';
import { tracks } from './constants';

const App = () => {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const getCountryAndCity = async () => {
      const location = await storage.getString('location')
      const parsedLocation = JSON.parse(location || '{}')
      if(Object.keys(parsedLocation).length > 0){
        setCountry(parsedLocation.country)
        setCity(parsedLocation.city)
      }else{
        try {
          const response = await axios.get('http://ip-api.com/json/');
          const { country, city } = response.data;
          setCountry(country);
          setCity(city);
          storage.set('location', JSON.stringify({country, city}))
        } catch (error) {
          console.error('Error fetching location data:', error);
        }
      }
    };

    getCountryAndCity();
  }, []);

  const showForegroundNotification = async () => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    await notifee.displayNotification({
      title: 'Adhaan Playing',
      body: 'The Adhaan is being played.',
      android: {
        channelId,
        asForegroundService: true,
      },
    });
  };

  useEffect(() => {
    const configureBackgroundFetch = async () => {
      await BackgroundFetch.configure({
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
    }, async (taskId) => {
      await setNotification()
      console.log('BackgroundFetch event received', taskId);
      }, (error) => { 
        console.log('BackgroundFetch error', error);
      })
    }
    configureBackgroundFetch();
  }, [] )
    
  
  useEffect(() => {
    requestPermissionNotification()
  }, [])

  useEffect(() => {
    notifee.registerForegroundService(async (notification) => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        await TrackPlayer.play();
      } catch (e) {
        console.log('TrackPlayer setup failed:', e);
      }
    });
  }, []);

  return <HomeScreen country={country} city={city} />;
};

export default App;
